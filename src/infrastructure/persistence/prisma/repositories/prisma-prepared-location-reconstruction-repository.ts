import type { Prisma, PrismaClient } from "@prisma/client";
import { z } from "zod";
import type {
  PreparedLocationReconstructionJob,
  PreparedLocationReconstructionRepository,
} from "@/domain/location-library";
import { OwnerId } from "@/domain/project";
import { OptimisticConcurrencyError } from "@/lib/errors";
import { PersistenceMappingError, translatePrismaError } from "../errors";

const Row = z.object({
  id: z.string().min(1),
  ownerId: z.string().min(1),
  preparedLocationId: z.string().min(1),
  providerKey: z.string().min(1),
  status: z.enum(["SUBMITTING", "PROCESSING", "SUCCEEDED", "FAILED", "EXPIRED"]),
  failureCode: z.string().nullable(),
  workerLeaseId: z.string().nullable(),
  workerLeaseExpiresAt: z.date().nullable(),
  createdAt: z.date(),
  updatedAt: z.date(),
  completedAt: z.date().nullable(),
  lockVersion: z.number().int().positive(),
});

function toJob(row: unknown): PreparedLocationReconstructionJob {
  const parsed = Row.safeParse(row);
  if (!parsed.success)
    throw new PersistenceMappingError("Prepared location reconstruction row violated its contract");
  return { ...parsed.data, ownerId: OwnerId.unsafe(parsed.data.ownerId) };
}

function data(
  job: PreparedLocationReconstructionJob,
): Prisma.PreparedLocationReconstructionJobUncheckedCreateInput {
  return {
    ...job,
    ownerId: job.ownerId,
    workerLeaseId: job.workerLeaseId,
    workerLeaseExpiresAt: job.workerLeaseExpiresAt,
  };
}

export class PrismaPreparedLocationReconstructionRepository implements PreparedLocationReconstructionRepository {
  constructor(private readonly db: PrismaClient) {}

  async findById(id: string) {
    try {
      const row = await this.db.preparedLocationReconstructionJob.findUnique({ where: { id } });
      return row ? toJob(row) : null;
    } catch (error) {
      throw translatePrismaError(error);
    }
  }

  async findLatestByLocation(preparedLocationId: string) {
    try {
      const row = await this.db.preparedLocationReconstructionJob.findFirst({
        where: { preparedLocationId },
        orderBy: [{ createdAt: "desc" }, { id: "desc" }],
      });
      return row ? toJob(row) : null;
    } catch (error) {
      throw translatePrismaError(error);
    }
  }

  async insert(job: PreparedLocationReconstructionJob): Promise<void> {
    try {
      await this.db.preparedLocationReconstructionJob.create({ data: data(job) });
    } catch (error) {
      throw translatePrismaError(error);
    }
  }

  async update(job: PreparedLocationReconstructionJob): Promise<void> {
    try {
      const updated = await this.db.preparedLocationReconstructionJob.updateMany({
        where: { id: job.id, ownerId: job.ownerId, lockVersion: job.lockVersion },
        data: {
          providerKey: job.providerKey,
          status: job.status,
          failureCode: job.failureCode,
          workerLeaseId: job.workerLeaseId,
          workerLeaseExpiresAt: job.workerLeaseExpiresAt,
          updatedAt: job.updatedAt,
          completedAt: job.completedAt,
          lockVersion: { increment: 1 },
        },
      });
      if (updated.count !== 1)
        throw new OptimisticConcurrencyError("Prepared room reconstruction changed concurrently.");
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
  }) {
    try {
      const candidate = await this.db.preparedLocationReconstructionJob.findFirst({
        where: {
          providerKey: input.providerKey,
          status: "PROCESSING",
          OR: [{ workerLeaseExpiresAt: null }, { workerLeaseExpiresAt: { lt: input.now } }],
        },
        orderBy: [{ createdAt: "asc" }, { id: "asc" }],
      });
      if (!candidate) return null;
      const claimed = await this.db.preparedLocationReconstructionJob.updateMany({
        where: {
          id: candidate.id,
          lockVersion: candidate.lockVersion,
          OR: [{ workerLeaseExpiresAt: null }, { workerLeaseExpiresAt: { lt: input.now } }],
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
