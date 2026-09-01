import type { PrismaClient } from "@prisma/client";
import { NotFoundError, OptimisticConcurrencyError } from "@/lib/errors";
import type { CreativeBrief, CreativeBriefRepository } from "@/domain/creative";
import type { ProjectId } from "@/domain/project";
import { translatePrismaError } from "../errors";
import {
  toCreativeBrief,
  toCreativeBriefFields,
  toCreativeBriefRevision,
  toCreativeBriefRevisionFields,
} from "../mappers/creative-brief-mapper";

/**
 * PostgreSQL/Prisma adapter for the Creative Brief (one per project).
 * - insert: create only; a duplicate project id is rejected by the unique index.
 * - update: compare-and-swap on lockVersion — a missing row is NotFound, a version
 *   mismatch is an OptimisticConcurrencyError (stale re-analysis).
 */
export class PrismaCreativeBriefRepository implements CreativeBriefRepository {
  constructor(private readonly db: PrismaClient) {}

  async findByProject(projectId: ProjectId): Promise<CreativeBrief | null> {
    try {
      const row = await this.db.creativeBrief.findUnique({ where: { projectId } });
      return row ? toCreativeBrief(row) : null;
    } catch (error) {
      throw translatePrismaError(error);
    }
  }

  async insert(brief: CreativeBrief): Promise<void> {
    try {
      await this.db.$transaction([
        this.db.creativeBrief.create({ data: toCreativeBriefFields(brief) }),
        this.db.creativeBriefRevision.create({
          data: toCreativeBriefRevisionFields(brief, 1),
        }),
      ]);
    } catch (error) {
      throw translatePrismaError(error);
    }
  }

  async update(brief: CreativeBrief): Promise<void> {
    const { id, ...rest } = toCreativeBriefFields(brief);
    const currentVersion = brief.lockVersion;
    let count: number;
    try {
      count = await this.db.$transaction(async (transaction) => {
        const result = await transaction.creativeBrief.updateMany({
          where: { id, lockVersion: currentVersion },
          data: { ...rest, lockVersion: { increment: 1 } },
        });
        if (result.count === 1) {
          const latestRevision = await transaction.creativeBriefRevision.findFirst({
            where: { creativeBriefId: id },
            orderBy: { version: "desc" },
            select: { version: true },
          });
          await transaction.creativeBriefRevision.create({
            data: toCreativeBriefRevisionFields(brief, (latestRevision?.version ?? 0) + 1),
          });
        }
        return result.count;
      });
    } catch (error) {
      throw translatePrismaError(error);
    }
    if (count === 0) {
      throw (await this.exists(id)) ? new OptimisticConcurrencyError() : new NotFoundError();
    }
  }

  async updateDevelopment(brief: CreativeBrief): Promise<void> {
    const { id, ...rest } = toCreativeBriefFields(brief);
    const currentVersion = brief.lockVersion;
    let count: number;
    try {
      const result = await this.db.creativeBrief.updateMany({
        where: { id, lockVersion: currentVersion },
        data: { ...rest, lockVersion: { increment: 1 } },
      });
      count = result.count;
    } catch (error) {
      throw translatePrismaError(error);
    }
    if (count === 0) {
      throw (await this.exists(id)) ? new OptimisticConcurrencyError() : new NotFoundError();
    }
  }

  async listRevisions(projectId: ProjectId) {
    try {
      const rows = await this.db.creativeBriefRevision.findMany({
        where: { projectId },
        orderBy: { version: "asc" },
      });
      return rows.map(toCreativeBriefRevision);
    } catch (error) {
      throw translatePrismaError(error);
    }
  }

  private async exists(id: string): Promise<boolean> {
    try {
      const row = await this.db.creativeBrief.findUnique({ where: { id }, select: { id: true } });
      return row !== null;
    } catch (error) {
      throw translatePrismaError(error);
    }
  }
}
