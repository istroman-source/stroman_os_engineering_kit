import type { PrismaClient } from "@prisma/client";
import { NotFoundError, OptimisticConcurrencyError } from "@/lib/errors";
import type { Retrospective, RetrospectiveId, RetrospectiveRepository } from "@/domain/learning";
import type { ProjectId } from "@/domain/project";
import { translatePrismaError } from "../errors";
import {
  toLessonRows,
  toRetrospective,
  toRetrospectiveFields,
} from "../mappers/retrospective-mapper";
export class PrismaRetrospectiveRepository implements RetrospectiveRepository {
  constructor(private readonly db: PrismaClient) {}
  async findById(id: RetrospectiveId) {
    try {
      const row = await this.db.retrospective.findUnique({
        where: { id },
        include: { lessons: true },
      });
      return row ? toRetrospective(row) : null;
    } catch (error) {
      throw translatePrismaError(error);
    }
  }
  async listByProject(projectId: ProjectId) {
    try {
      return (
        await this.db.retrospective.findMany({
          where: { projectId },
          include: { lessons: true },
          orderBy: [{ createdAt: "asc" }, { id: "asc" }],
        })
      ).map(toRetrospective);
    } catch (error) {
      throw translatePrismaError(error);
    }
  }
  async insert(value: Retrospective) {
    try {
      await this.db.$transaction(async (tx) => {
        await tx.retrospective.create({ data: toRetrospectiveFields(value) });
        await tx.lesson.createMany({ data: toLessonRows(value) });
      });
    } catch (error) {
      throw translatePrismaError(error);
    }
  }
  async update(value: Retrospective) {
    const { id, lockVersion, ...data } = toRetrospectiveFields(value);
    let updated = false;
    try {
      const result = await this.db.retrospective.updateMany({
        where: { id, lockVersion },
        data: { ...data, lockVersion: { increment: 1 } },
      });
      updated = result.count === 1;
    } catch (error) {
      throw translatePrismaError(error);
    }
    if (!updated) {
      const exists = await this.db.retrospective.findUnique({
        where: { id },
        select: { id: true },
      });
      throw exists ? new OptimisticConcurrencyError() : new NotFoundError();
    }
  }
}
