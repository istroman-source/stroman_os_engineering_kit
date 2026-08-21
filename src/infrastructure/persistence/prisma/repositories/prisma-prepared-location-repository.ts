import { Prisma, type PrismaClient } from "@prisma/client";
import { z } from "zod";
import type {
  PreparedLocation,
  PreparedLocationInput,
  PreparedLocationRepository,
} from "@/domain/location-library";
import { OwnerId } from "@/domain/project";
import { OptimisticConcurrencyError } from "@/lib/errors";
import { PersistenceMappingError, translatePrismaError } from "../errors";

const InputRow = z.object({
  id: z.string().min(1),
  kind: z.enum(["GEOMETRY", "PHOTO"]),
  fileName: z.string().min(1),
  contentType: z.string().min(1),
  byteSize: z.number().int().nonnegative(),
  contentHash: z.string().min(1),
  storageKey: z.string().min(1),
  createdAt: z.date(),
});
const Row = z.object({
  id: z.string().min(1),
  ownerId: z.string().min(1),
  name: z.string().min(1),
  inputKind: z.enum(["GLB", "PHOTOS"]),
  status: z.enum(["DRAFT", "UPLOADING", "PROCESSING", "READY", "NEEDS_ATTENTION", "FAILED"]),
  environment: z.unknown().nullable(),
  failureCode: z.string().nullable(),
  inputs: z.array(InputRow),
  createdAt: z.date(),
  updatedAt: z.date(),
  lockVersion: z.number().int().positive(),
});

function toLocation(row: unknown): PreparedLocation {
  const parsed = Row.safeParse(row);
  if (!parsed.success) throw new PersistenceMappingError("Prepared location row violated its contract");
  return {
    ...parsed.data,
    environment: parsed.data.environment ?? null,
    ownerId: OwnerId.unsafe(parsed.data.ownerId),
    inputs: parsed.data.inputs as readonly PreparedLocationInput[],
  };
}

function data(location: PreparedLocation): Prisma.PreparedLocationUncheckedCreateInput {
  return {
    id: location.id,
    ownerId: location.ownerId,
    name: location.name,
    inputKind: location.inputKind,
    status: location.status,
    environment: location.environment === null ? Prisma.DbNull : location.environment as Prisma.InputJsonValue,
    failureCode: location.failureCode,
    createdAt: location.createdAt,
    updatedAt: location.updatedAt,
    lockVersion: location.lockVersion,
    inputs: {
      create: location.inputs.map((input) => ({
        id: input.id,
        kind: input.kind,
        fileName: input.fileName,
        contentType: input.contentType,
        byteSize: input.byteSize,
        contentHash: input.contentHash,
        storageKey: input.storageKey,
        createdAt: input.createdAt,
      })),
    },
  };
}

const include = { inputs: { orderBy: [{ createdAt: "asc" as const }, { id: "asc" as const }] } };

export class PrismaPreparedLocationRepository implements PreparedLocationRepository {
  constructor(private readonly db: PrismaClient) {}

  async findById(id: string): Promise<PreparedLocation | null> {
    try {
      const row = await this.db.preparedLocation.findUnique({ where: { id }, include });
      return row ? toLocation(row) : null;
    } catch (error) { throw translatePrismaError(error); }
  }

  async listByOwner(ownerId: OwnerId): Promise<readonly PreparedLocation[]> {
    try {
      const rows = await this.db.preparedLocation.findMany({ where: { ownerId }, include, orderBy: [{ updatedAt: "desc" }, { id: "desc" }] });
      return rows.map(toLocation);
    } catch (error) { throw translatePrismaError(error); }
  }

  async insert(location: PreparedLocation): Promise<void> {
    try { await this.db.preparedLocation.create({ data: data(location) }); }
    catch (error) { throw translatePrismaError(error); }
  }

  async update(location: PreparedLocation): Promise<void> {
    try {
      const updated = await this.db.preparedLocation.updateMany({
        where: { id: location.id, ownerId: location.ownerId, lockVersion: location.lockVersion },
        data: { name: location.name, status: location.status, environment: location.environment === null ? Prisma.DbNull : location.environment as Prisma.InputJsonValue, failureCode: location.failureCode, updatedAt: location.updatedAt, lockVersion: { increment: 1 } },
      });
      if (updated.count !== 1) throw new OptimisticConcurrencyError("Prepared location changed concurrently.");
    } catch (error) {
      if (error instanceof OptimisticConcurrencyError) throw error;
      throw translatePrismaError(error);
    }
  }

  async addInput(preparedLocationId: string, input: PreparedLocationInput): Promise<void> {
    try {
      await this.db.preparedLocationInput.create({ data: {
        id: input.id, preparedLocationId, kind: input.kind,
        fileName: input.fileName, contentType: input.contentType, byteSize: input.byteSize,
        contentHash: input.contentHash, storageKey: input.storageKey, createdAt: input.createdAt,
      } });
    } catch (error) { throw translatePrismaError(error); }
  }
}
