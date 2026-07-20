import type { PrismaClient } from "@prisma/client";
import { NotFoundError, OptimisticConcurrencyError } from "@/lib/errors";
import type { CreativeBrief, CreativeBriefRepository } from "@/domain/creative";
import type { ProjectId } from "@/domain/project";
import { translatePrismaError } from "../errors";
import { toCreativeBrief, toCreativeBriefFields } from "../mappers/creative-brief-mapper";

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
      await this.db.creativeBrief.create({ data: toCreativeBriefFields(brief) });
    } catch (error) {
      throw translatePrismaError(error);
    }
  }

  async update(brief: CreativeBrief): Promise<void> {
    const { id, lockVersion, ...rest } = toCreativeBriefFields(brief);
    let count: number;
    try {
      const result = await this.db.creativeBrief.updateMany({
        where: { id, lockVersion },
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

  private async exists(id: string): Promise<boolean> {
    try {
      const row = await this.db.creativeBrief.findUnique({ where: { id }, select: { id: true } });
      return row !== null;
    } catch (error) {
      throw translatePrismaError(error);
    }
  }
}
