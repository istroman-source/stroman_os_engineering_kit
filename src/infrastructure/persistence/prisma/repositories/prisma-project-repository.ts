import type { PrismaClient } from "@prisma/client";
import { NotFoundError, OptimisticConcurrencyError } from "@/lib/errors";
import type { OwnerId, Project, ProjectId, ProjectRepository } from "@/domain/project";
import { translatePrismaError } from "../errors";
import { toProject, toProjectFields } from "../mappers/project-mapper";

/**
 * PostgreSQL/Prisma adapter for the Project repository.
 * - insert: create only — a duplicate id is rejected by the primary key.
 * - update: compare-and-swap on lockVersion — a missing row is a NotFound, and a
 *   version mismatch is an OptimisticConcurrencyError (stale write). Owner listing
 *   is filtered in the database.
 */
export class PrismaProjectRepository implements ProjectRepository {
  constructor(private readonly db: PrismaClient) {}

  async findById(id: ProjectId): Promise<Project | null> {
    try {
      const row = await this.db.project.findUnique({ where: { id } });
      return row ? toProject(row) : null;
    } catch (error) {
      throw translatePrismaError(error);
    }
  }

  async listByOwner(ownerId: OwnerId): Promise<readonly Project[]> {
    try {
      const rows = await this.db.project.findMany({
        where: { ownerId },
        orderBy: { createdAt: "asc" },
      });
      return rows.map(toProject);
    } catch (error) {
      throw translatePrismaError(error);
    }
  }

  async insert(project: Project): Promise<void> {
    try {
      await this.db.project.create({ data: toProjectFields(project) });
    } catch (error) {
      throw translatePrismaError(error);
    }
  }

  async update(project: Project): Promise<void> {
    const { id, lockVersion, ...rest } = toProjectFields(project);
    let count: number;
    try {
      const result = await this.db.project.updateMany({
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
      const row = await this.db.project.findUnique({ where: { id }, select: { id: true } });
      return row !== null;
    } catch (error) {
      throw translatePrismaError(error);
    }
  }
}
