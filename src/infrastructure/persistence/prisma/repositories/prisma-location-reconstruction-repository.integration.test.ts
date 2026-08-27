import { afterAll, beforeEach, describe, expect, it } from "vitest";
import type { LocationReconstructionJob } from "@/domain/creative";
import { createProject, makeProjectName, OwnerId, ProjectId } from "@/domain/project";
import { OptimisticConcurrencyError } from "@/lib/errors";
import { createTestPrisma, resetDatabase } from "@test/db/integration-helpers";
import { PrismaProjectRepository } from "./prisma-project-repository";
import { PrismaLocationReconstructionRepository } from "./prisma-location-reconstruction-repository";

const db = createTestPrisma();
const repository = new PrismaLocationReconstructionRepository(db);
const OWNER = OwnerId.unsafe("usr_RECONOWNER1");
const PROJECT = ProjectId.unsafe("proj_RECONROOM1");
const NOW = new Date("2026-08-20T12:00:00.000Z");

function job(): LocationReconstructionJob {
  return {
    id: "lrec_RECONROOM1",
    ownerId: OWNER,
    projectId: PROJECT,
    name: "Actual kitchen",
    providerKey: "kiri-photo-v1",
    providerJobId: null,
    workerLeaseId: null,
    workerLeaseExpiresAt: null,
    status: "SUBMITTING",
    photos: Array.from({ length: 20 }, (_, index) => ({
      mediaAssetId: `mast_RECON${String(index).padStart(4, "0")}`,
      fileName: `angle-${index + 1}.jpg`,
      contentType: "image/jpeg" as const,
      byteSize: 4,
      contentHash: `sha256:${String(index).padStart(64, "0")}`,
      storageKey: `${OWNER}/${PROJECT}/${index}`,
    })),
    environmentId: null,
    failureCode: null,
    createdAt: NOW,
    updatedAt: NOW,
    completedAt: null,
    lockVersion: 1,
  };
}

beforeEach(async () => {
  await resetDatabase(db);
  const name = makeProjectName("Photo room");
  if (!name.ok) throw name.error;
  await new PrismaProjectRepository(db).insert(
    createProject({ id: PROJECT, ownerId: OWNER, name: name.value, now: NOW }),
  );
});

afterAll(async () => {
  await db.$disconnect();
});

describe("PrismaLocationReconstructionRepository", () => {
  it("round-trips private orchestration state and enforces compare-and-swap updates", async () => {
    const original = job();
    await repository.insert(original);
    await expect(repository.findLatestByProject(PROJECT)).resolves.toEqual(original);

    await repository.update({
      ...original,
      providerKey: "stroman-owned-v1",
      providerJobId: "provider-room-1",
      status: "PROCESSING",
      updatedAt: new Date("2026-08-20T12:01:00.000Z"),
    });
    await expect(repository.findById(original.id)).resolves.toMatchObject({
      providerKey: "stroman-owned-v1",
      providerJobId: "provider-room-1",
      status: "PROCESSING",
      lockVersion: 2,
    });
    await expect(repository.update(original)).rejects.toBeInstanceOf(OptimisticConcurrencyError);
  });
});
