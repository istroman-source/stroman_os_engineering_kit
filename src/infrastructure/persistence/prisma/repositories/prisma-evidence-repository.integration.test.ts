import type { PrismaClient } from "@prisma/client";
import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";
import { ConflictError } from "@/lib/errors";
import { OwnerId, ProjectId, createProject, makeProjectName } from "@/domain/project";
import {
  MediaAssetId,
  TranscriptDocumentId,
  TranscriptSegmentId,
  createMediaAsset,
  createTranscriptDocument,
} from "@/domain/media-transcript";
import { EvidenceReferenceId, createEvidenceReference } from "@/domain/evidence";
import {
  PrismaEvidenceReferenceRepository,
  PrismaMediaAssetRepository,
  PrismaProjectRepository,
  PrismaTranscriptDocumentRepository,
} from "@/infrastructure/persistence/prisma";
import { createTestPrisma, resetDatabase } from "@test/db/integration-helpers";

const NOW = new Date("2026-07-22T21:00:00Z");
const OWNER = OwnerId.unsafe("usr_00000001");
const PROJECT = ProjectId.unsafe("proj_00000001");
const ASSET = MediaAssetId.unsafe("mast_00000001");
const TRANSCRIPT = TranscriptDocumentId.unsafe("trdoc_00000001");
const SEGMENT = TranscriptSegmentId.unsafe("trseg_00000001");
const unwrap = <T>(result: { ok: true; value: T } | { ok: false; error: unknown }): T => {
  if (!result.ok) throw result.error;
  return result.value;
};

let db: PrismaClient;
let evidence: PrismaEvidenceReferenceRepository;
beforeAll(() => {
  db = createTestPrisma();
  evidence = new PrismaEvidenceReferenceRepository(db);
});
afterAll(async () => db.$disconnect());
beforeEach(async () => {
  await resetDatabase(db);
  const name = makeProjectName("Documentary");
  if (!name.ok) throw name.error;
  await new PrismaProjectRepository(db).insert(
    createProject({ id: PROJECT, ownerId: OWNER, name: name.value, now: NOW }),
  );
  await new PrismaMediaAssetRepository(db).insert(
    unwrap(
      createMediaAsset({
        id: ASSET,
        ownerId: OWNER,
        projectId: PROJECT,
        fileName: "interview.mp4",
        mediaType: "video/mp4",
        byteSize: 10,
        contentHash: "sha256:a",
        now: NOW,
      }),
    ),
  );
  await new PrismaTranscriptDocumentRepository(db).insert(
    unwrap(
      createTranscriptDocument({
        id: TRANSCRIPT,
        ownerId: OWNER,
        projectId: PROJECT,
        mediaAssetId: ASSET,
        title: "Interview",
        speakers: [],
        segments: [{ id: SEGMENT, sequence: 0, text: "Grounded" }],
        now: NOW,
      }),
    ),
  );
});

function mediaEvidence(id = "evref_00000001") {
  return createEvidenceReference({
    id: EvidenceReferenceId.unsafe(id),
    ownerId: OWNER,
    projectId: PROJECT,
    provenance: { kind: "MEDIA_ASSET", mediaAssetId: ASSET },
    now: NOW,
  });
}
function segmentEvidence(id = "evref_00000002") {
  return createEvidenceReference({
    id: EvidenceReferenceId.unsafe(id),
    ownerId: OWNER,
    projectId: PROJECT,
    provenance: {
      kind: "TRANSCRIPT_SEGMENT",
      mediaAssetId: ASSET,
      transcriptDocumentId: TRANSCRIPT,
      transcriptSegmentId: SEGMENT,
    },
    now: NOW,
  });
}

describe("PrismaEvidenceReferenceRepository", () => {
  it("inserts and reads both durable provenance classifications", async () => {
    const media = mediaEvidence();
    const segment = segmentEvidence();
    await evidence.insert(media);
    await evidence.insert(segment);
    expect(await evidence.findById(media.id)).toEqual(media);
    expect(await evidence.findById(segment.id)).toEqual(segment);
    expect(await evidence.listByProject(PROJECT)).toEqual([media, segment]);
    expect(await evidence.listByMediaAsset(ASSET)).toEqual([media, segment]);
    expect(await evidence.listByTranscriptDocument(TRANSCRIPT)).toEqual([segment]);
  });

  it("rejects duplicate identifiers without overwriting", async () => {
    const first = mediaEvidence();
    await evidence.insert(first);
    await expect(evidence.insert(segmentEvidence(first.id))).rejects.toBeInstanceOf(ConflictError);
    expect(await evidence.findById(first.id)).toEqual(first);
  });

  it("enforces provenance shape CHECK constraints", async () => {
    await expect(
      db.evidenceReference.create({
        data: {
          id: "evref_00000090",
          ownerId: OWNER,
          projectId: PROJECT,
          provenanceKind: "MEDIA_ASSET",
          mediaAssetId: ASSET,
          transcriptDocumentId: TRANSCRIPT,
          transcriptSegmentId: SEGMENT,
          createdAt: NOW,
        },
      }),
    ).rejects.toBeTruthy();
    await expect(
      db.evidenceReference.create({
        data: {
          id: "evref_00000091",
          ownerId: OWNER,
          projectId: PROJECT,
          provenanceKind: "TRANSCRIPT_SEGMENT",
          mediaAssetId: ASSET,
          createdAt: NOW,
        },
      }),
    ).rejects.toBeTruthy();
  });

  it("enforces project, owner, media, transcript, and segment alignment", async () => {
    await expect(
      db.evidenceReference.create({
        data: {
          id: "evref_00000092",
          ownerId: "usr_99999999",
          projectId: PROJECT,
          provenanceKind: "MEDIA_ASSET",
          mediaAssetId: ASSET,
          createdAt: NOW,
        },
      }),
    ).rejects.toBeTruthy();
    await expect(
      db.evidenceReference.create({
        data: {
          id: "evref_00000093",
          ownerId: OWNER,
          projectId: PROJECT,
          provenanceKind: "TRANSCRIPT_SEGMENT",
          mediaAssetId: ASSET,
          transcriptDocumentId: TRANSCRIPT,
          transcriptSegmentId: "trseg_99999999",
          createdAt: NOW,
        },
      }),
    ).rejects.toBeTruthy();
  });

  it("protects referenced provenance from deletion", async () => {
    await evidence.insert(segmentEvidence());
    await expect(
      db.transcriptSegment.delete({
        where: {
          transcriptDocumentId_id: { transcriptDocumentId: TRANSCRIPT, id: SEGMENT },
        },
      }),
    ).rejects.toBeTruthy();
    const secondAsset = MediaAssetId.unsafe("mast_00000002");
    await new PrismaMediaAssetRepository(db).insert(
      unwrap(
        createMediaAsset({
          id: secondAsset,
          ownerId: OWNER,
          projectId: PROJECT,
          fileName: "b-roll.mp4",
          mediaType: "video/mp4",
          byteSize: 5,
          contentHash: "sha256:b",
          now: NOW,
        }),
      ),
    );
    await evidence.insert(
      createEvidenceReference({
        id: EvidenceReferenceId.unsafe("evref_00000003"),
        ownerId: OWNER,
        projectId: PROJECT,
        provenance: { kind: "MEDIA_ASSET", mediaAssetId: secondAsset },
        now: NOW,
      }),
    );
    await expect(db.mediaAsset.delete({ where: { id: secondAsset } })).rejects.toBeTruthy();
  });
});
