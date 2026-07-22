import type { PrismaClient } from "@prisma/client";
import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";
import { ConflictError } from "@/lib/errors";
import { OwnerId, ProjectId, createProject, makeProjectName } from "@/domain/project";
import {
  MediaAssetId,
  TranscriptDocumentId,
  TranscriptSegmentId,
  TranscriptSpeakerId,
  createMediaAsset,
  createTranscriptDocument,
  type MediaAsset,
  type TranscriptDocument,
} from "@/domain/media-transcript";
import {
  PrismaMediaAssetRepository,
  PrismaProjectRepository,
  PrismaTranscriptDocumentRepository,
} from "@/infrastructure/persistence/prisma";
import { createTestPrisma, resetDatabase } from "@test/db/integration-helpers";

const NOW = new Date("2026-07-22T00:00:00Z");
const OWNER = OwnerId.unsafe("usr_00000001");
const PROJECT = ProjectId.unsafe("proj_00000001");
function unwrap<T>(value: { ok: true; value: T } | { ok: false; error: unknown }): T {
  if (!value.ok) throw value.error;
  return value.value;
}
function asset(id = "mast_00000001"): MediaAsset {
  return unwrap(
    createMediaAsset({
      id: MediaAssetId.unsafe(id),
      ownerId: OWNER,
      projectId: PROJECT,
      fileName: `${id}.mp4`,
      mediaType: "video/mp4",
      byteSize: 10,
      contentHash: `sha256:${id}`,
      now: NOW,
    }),
  );
}
function document(mediaAssetId = MediaAssetId.unsafe("mast_00000001")): TranscriptDocument {
  const speakerId = TranscriptSpeakerId.unsafe("trspk_00000001");
  return unwrap(
    createTranscriptDocument({
      id: TranscriptDocumentId.unsafe("trdoc_00000001"),
      ownerId: OWNER,
      projectId: PROJECT,
      mediaAssetId,
      title: "Interview",
      speakers: [{ id: speakerId, label: "Guest" }],
      segments: [
        { id: TranscriptSegmentId.unsafe("trseg_00000002"), sequence: 2, text: "Later" },
        {
          id: TranscriptSegmentId.unsafe("trseg_00000001"),
          sequence: 1,
          speakerId,
          text: "First",
          startMs: 0,
          endMs: 10,
        },
      ],
      now: NOW,
    }),
  );
}
let db: PrismaClient;
let media: PrismaMediaAssetRepository;
let transcripts: PrismaTranscriptDocumentRepository;
beforeAll(() => {
  db = createTestPrisma();
  media = new PrismaMediaAssetRepository(db);
  transcripts = new PrismaTranscriptDocumentRepository(db);
});
afterAll(async () => db.$disconnect());
beforeEach(async () => {
  await resetDatabase(db);
  const name = makeProjectName("Documentary");
  if (!name.ok) throw name.error;
  await new PrismaProjectRepository(db).insert(
    createProject({ id: PROJECT, ownerId: OWNER, name: name.value, now: NOW }),
  );
});

describe("Prisma media transcript repositories", () => {
  it("persists, retrieves, and orders media and complete transcripts", async () => {
    const a = asset();
    await media.insert(a);
    await transcripts.insert(document(a.id));
    expect(await media.findById(a.id)).toEqual(a);
    const loaded = await transcripts.findByMediaAsset(a.id);
    expect(loaded?.segments.map((value) => value.sequence)).toEqual([1, 2]);
    expect(await transcripts.listByProject(PROJECT)).toHaveLength(1);
  });

  it("enforces one transcript per media asset", async () => {
    const a = asset();
    await media.insert(a);
    await transcripts.insert(document(a.id));
    const duplicate = { ...document(a.id), id: TranscriptDocumentId.unsafe("trdoc_00000002") };
    await expect(transcripts.insert(duplicate)).rejects.toBeInstanceOf(ConflictError);
  });

  it("rolls back the transcript root when a child write fails", async () => {
    const a = asset();
    await media.insert(a);
    const invalid = {
      ...document(a.id),
      segments: [
        document(a.id).segments[0]!,
        { ...document(a.id).segments[1]!, sequence: document(a.id).segments[0]!.sequence },
      ],
    };
    await expect(transcripts.insert(invalid)).rejects.toBeInstanceOf(ConflictError);
    expect(await transcripts.findById(invalid.id)).toBeNull();
  });

  it("enforces database checks and owner/project alignment", async () => {
    await expect(db.mediaAsset.create({ data: { ...asset(), byteSize: -1 } })).rejects.toBeTruthy();
    const other = asset("mast_00000002");
    await media.insert(other);
    await expect(
      db.transcriptDocument.create({
        data: {
          id: "trdoc_00000009",
          ownerId: "usr_99999999",
          projectId: PROJECT,
          mediaAssetId: other.id,
          title: "Mismatch",
          createdAt: NOW,
        },
      }),
    ).rejects.toBeTruthy();
  });

  it("verifies segment CHECK constraints, local speaker FK, and duplicate child ids", async () => {
    const a = asset();
    await media.insert(a);
    const transcript = document(a.id);
    await transcripts.insert(transcript);
    const root = {
      transcriptDocumentId: transcript.id,
      text: "Invalid",
      speakerId: null,
      startMs: null,
      endMs: null,
    };
    await expect(
      db.transcriptSegment.create({
        data: { ...root, id: "trseg_00000090", sequence: -1 },
      }),
    ).rejects.toBeTruthy();
    await expect(
      db.transcriptSegment.create({
        data: { ...root, id: "trseg_00000091", sequence: 91, startMs: 0 },
      }),
    ).rejects.toBeTruthy();
    await expect(
      db.transcriptSegment.create({
        data: { ...root, id: "trseg_00000092", sequence: 92, startMs: -1, endMs: 1 },
      }),
    ).rejects.toBeTruthy();
    await expect(
      db.transcriptSegment.create({
        data: { ...root, id: "trseg_00000093", sequence: 93, startMs: 10, endMs: 10 },
      }),
    ).rejects.toBeTruthy();
    await expect(
      db.transcriptSegment.create({
        data: {
          ...root,
          id: "trseg_00000094",
          sequence: 94,
          speakerId: "trspk_99999999",
        },
      }),
    ).rejects.toBeTruthy();
    await expect(
      db.transcriptSpeaker.create({
        data: {
          transcriptDocumentId: transcript.id,
          id: transcript.speakers[0]!.id,
          label: "Duplicate",
        },
      }),
    ).rejects.toBeTruthy();
  });

  it("rejects a transcript whose media asset does not exist", async () => {
    await expect(
      transcripts.insert(document(MediaAssetId.unsafe("mast_99999999"))),
    ).rejects.toBeTruthy();
  });
});
