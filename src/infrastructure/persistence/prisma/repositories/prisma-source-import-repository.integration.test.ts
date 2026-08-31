import type { PrismaClient } from "@prisma/client";
import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";
import type { SourceImportReceipt } from "@/domain/source-import";
import {
  MediaAssetId,
  TranscriptDocumentId,
  TranscriptSegmentId,
  createMediaAsset,
  createTranscriptDocument,
} from "@/domain/media-transcript";
import { OwnerId, ProjectId, createProject, makeProjectName } from "@/domain/project";
import {
  PrismaProjectRepository,
  PrismaSourceImportRepository,
} from "@/infrastructure/persistence/prisma";
import { createTestPrisma, resetDatabase } from "@test/db/integration-helpers";

const OWNER = OwnerId.unsafe("usr_00000001");
const PROJECT = ProjectId.unsafe("proj_00000001");
const NOW = new Date("2026-07-29T12:00:00Z");
const unwrap = <T>(value: { ok: true; value: T } | { ok: false; error: unknown }): T => {
  if (!value.ok) throw value.error;
  return value.value;
};

function values() {
  const media = unwrap(
    createMediaAsset({
      id: MediaAssetId.unsafe("mast_00000001"),
      ownerId: OWNER,
      projectId: PROJECT,
      fileName: "interview.srt",
      mediaType: "application/x-subrip",
      byteSize: 20,
      contentHash: "sha256:abc",
      now: NOW,
    }),
  );
  const transcript = unwrap(
    createTranscriptDocument({
      id: TranscriptDocumentId.unsafe("trdoc_00000001"),
      ownerId: OWNER,
      projectId: PROJECT,
      mediaAssetId: media.id,
      title: "Interview",
      speakers: [],
      segments: [
        {
          id: TranscriptSegmentId.unsafe("trseg_00000001"),
          sequence: 0,
          text: "Opening",
          startMs: 0,
          endMs: 1000,
        },
      ],
      now: NOW,
    }),
  );
  const receipt: SourceImportReceipt = {
    id: "simp_00000001",
    ownerId: OWNER,
    projectId: PROJECT,
    idempotencyKey: "key-1",
    status: "PROCESSING",
    sourceName: "interview.srt",
    sourceKind: "TRANSCRIPT",
    contentType: "application/x-subrip",
    byteSize: 20,
    contentHash: "sha256:abc",
    storageKey: `${OWNER}/${PROJECT}/sha256:abc`,
    transcriptFormat: "srt",
    failureCode: null,
    mediaAssetId: null,
    transcriptDocumentId: null,
    createdAt: NOW,
    updatedAt: NOW,
  };
  return { media, transcript, receipt };
}

let db: PrismaClient;
let repository: PrismaSourceImportRepository;
beforeAll(() => {
  db = createTestPrisma();
  repository = new PrismaSourceImportRepository(db);
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

describe("Prisma source import repository", () => {
  it("commits receipt, media, transcript, and ordered segments atomically", async () => {
    const input = values();
    await repository.start(input.receipt);
    const completed = await repository.completeAtomically(input);
    expect(completed).toMatchObject({
      status: "COMPLETED",
      mediaAssetId: input.media.id,
      transcriptDocumentId: input.transcript.id,
    });
    expect(await repository.findByKey(PROJECT, "key-1")).toEqual(completed);
    expect(await db.transcriptSegment.findMany()).toHaveLength(1);
  });

  it("rolls back every record when a child violates persistence constraints", async () => {
    const input = values();
    await repository.start(input.receipt);
    const corrupt = {
      ...input.transcript,
      segments: [
        input.transcript.segments[0]!,
        { ...input.transcript.segments[0]!, id: TranscriptSegmentId.unsafe("trseg_00000002") },
      ],
    };
    await expect(
      repository.completeAtomically({ ...input, transcript: corrupt }),
    ).rejects.toBeTruthy();
    expect(await db.mediaAsset.count()).toBe(0);
    expect(await db.transcriptDocument.count()).toBe(0);
    expect(await db.sourceImport.findUnique({ where: { id: input.receipt.id } })).toMatchObject({
      status: "PROCESSING",
      mediaAssetId: null,
    });
  });

  it("claims one retry atomically and records its lifecycle", async () => {
    const { receipt } = values();
    await repository.start(receipt);
    const failed = await repository.markFailure({
      id: receipt.id,
      projectId: PROJECT,
      status: "RETRYABLE_FAILURE",
      failureCode: "PERSISTENCE_UNAVAILABLE",
      now: NOW,
    });
    expect(failed.status).toBe("RETRYABLE_FAILURE");
    const claimed = await repository.claimRetry(receipt.id, PROJECT, NOW);
    expect(claimed).toMatchObject({ status: "PROCESSING", failureCode: null });
    await expect(repository.claimRetry(receipt.id, PROJECT, NOW)).resolves.toBeNull();
  });
});
