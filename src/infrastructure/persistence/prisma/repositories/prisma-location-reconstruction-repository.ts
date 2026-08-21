import type { Prisma, PrismaClient } from "@prisma/client";
import { z } from "zod";
import {
  type LocationCapturePhoto,
  type LocationReconstructionJob,
  type LocationReconstructionRepository,
} from "@/domain/creative";
import { OwnerId, ProjectId } from "@/domain/project";
import { OptimisticConcurrencyError } from "@/lib/errors";
import { PersistenceMappingError, translatePrismaError } from "../errors";

const PhotoRow = z.object({
  mediaAssetId: z.string().min(1),
  fileName: z.string().min(1),
  contentType: z.enum(["image/jpeg", "image/png"]),
  byteSize: z.number().int().positive(),
  contentHash: z.string().min(1),
  storageKey: z.string().min(1),
});

const JobRow = z.object({
  id: z.string().min(1),
  ownerId: z.string().min(1),
  projectId: z.string().min(1),
  name: z.string().min(1),
  providerKey: z.string().min(1),
  providerJobId: z.string().nullable(),
  status: z.enum(["SUBMITTING", "PROCESSING", "SUCCEEDED", "FAILED", "EXPIRED"]),
  photos: z.array(PhotoRow).min(20).max(300),
  environmentId: z.string().nullable(),
  failureCode: z.string().nullable(),
  workerLeaseId: z.string().nullable(),
  workerLeaseExpiresAt: z.date().nullable(),
  createdAt: z.date(),
  updatedAt: z.date(),
  completedAt: z.date().nullable(),
  lockVersion: z.number().int().positive(),
});

function toJob(row: unknown): LocationReconstructionJob {
  const parsed = JobRow.safeParse(row);
  if (!parsed.success) {
    throw new PersistenceMappingError("Location reconstruction row violated its contract");
  }
  return {
    ...parsed.data,
    ownerId: OwnerId.unsafe(parsed.data.ownerId),
    projectId: ProjectId.unsafe(parsed.data.projectId),
    photos: parsed.data.photos as readonly LocationCapturePhoto[],
  };
}

function data(
  job: LocationReconstructionJob,
): Prisma.LocationReconstructionJobUncheckedCreateInput {
  return {
    id: job.id,
    ownerId: job.ownerId,
    projectId: job.projectId,
    name: job.name,
    providerKey: job.providerKey,
    providerJobId: job.providerJobId,
    status: job.status,
    photos: job.photos as unknown as Prisma.InputJsonValue,
    environmentId: job.environmentId,
    failureCode: job.failureCode,
    workerLeaseId: job.workerLeaseId ?? null,
    workerLeaseExpiresAt: job.workerLeaseExpiresAt ?? null,
    createdAt: job.createdAt,
    updatedAt: job.updatedAt,
    completedAt: job.completedAt,
    lockVersion: job.lockVersion,
  };
}

export class PrismaLocationReconstructionRepository implements LocationReconstructionRepository {
  constructor(private readonly db: PrismaClient) {}

  async findById(id: string): Promise<LocationReconstructionJob | null> {
    try {
      const row = await this.db.locationReconstructionJob.findUnique({ where: { id } });
      return row ? toJob(row) : null;
    } catch (error) {
      throw translatePrismaError(error);
    }
  }

  async findLatestByProject(projectId: ProjectId): Promise<LocationReconstructionJob | null> {
    try {
      const row = await this.db.locationReconstructionJob.findFirst({
        where: { projectId },
        orderBy: [{ createdAt: "desc" }, { id: "desc" }],
      });
      return row ? toJob(row) : null;
    } catch (error) {
      throw translatePrismaError(error);
    }
  }

  async insert(job: LocationReconstructionJob): Promise<void> {
    try {
      await this.db.locationReconstructionJob.create({ data: data(job) });
    } catch (error) {
      throw translatePrismaError(error);
    }
  }

  async update(job: LocationReconstructionJob): Promise<void> {
    try {
      const updated = await this.db.locationReconstructionJob.updateMany({
        where: { id: job.id, lockVersion: job.lockVersion },
        data: {
          providerKey: job.providerKey,
          providerJobId: job.providerJobId,
          status: job.status,
          environmentId: job.environmentId,
          failureCode: job.failureCode,
          workerLeaseId: job.workerLeaseId ?? null,
          workerLeaseExpiresAt: job.workerLeaseExpiresAt ?? null,
          updatedAt: job.updatedAt,
          completedAt: job.completedAt,
          lockVersion: { increment: 1 },
        },
      });
      if (updated.count !== 1) {
        throw new OptimisticConcurrencyError("Location reconstruction changed concurrently.");
      }
    } catch (error) {
      if (error instanceof OptimisticConcurrencyError) throw error;
      throw translatePrismaError(error);
    }
  }

  async claimNextForWorker(input: {
    readonly providerKey: string;
    readonly leaseId: string;
    readonly now: Date;
    readonly leaseExpiresAt: Date;
  }): Promise<LocationReconstructionJob | null> {
    try {
      // The candidate is re-checked with its optimistic version. A second Mac
      // can observe the row, but cannot acquire the same lease.
      const candidate = await this.db.locationReconstructionJob.findFirst({
        where: {
          providerKey: input.providerKey,
          status: "PROCESSING",
          OR: [
            { workerLeaseExpiresAt: null },
            { workerLeaseExpiresAt: { lt: input.now } },
          ],
        },
        orderBy: [{ createdAt: "asc" }, { id: "asc" }],
      });
      if (!candidate) return null;
      const claimed = await this.db.locationReconstructionJob.updateMany({
        where: {
          id: candidate.id,
          lockVersion: candidate.lockVersion,
          OR: [
            { workerLeaseExpiresAt: null },
            { workerLeaseExpiresAt: { lt: input.now } },
          ],
        },
        data: {
          workerLeaseId: input.leaseId,
          workerLeaseExpiresAt: input.leaseExpiresAt,
          updatedAt: input.now,
          lockVersion: { increment: 1 },
        },
      });
      if (claimed.count !== 1) return null;
      return toJob({
        ...candidate,
        workerLeaseId: input.leaseId,
        workerLeaseExpiresAt: input.leaseExpiresAt,
        updatedAt: input.now,
        lockVersion: candidate.lockVersion + 1,
      });
    } catch (error) {
      throw translatePrismaError(error);
    }
  }
}
