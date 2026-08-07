import type { PrismaClient } from "@prisma/client";
import type { ReviewRun, ReviewRunId, ReviewRunRepository } from "@/domain/evaluation";
import type { ProjectId } from "@/domain/project";
import { translatePrismaError } from "../errors";
import { toReviewOverrideRows, toReviewRun, toReviewRunFields } from "../mappers/review-run-mapper";

export class PrismaReviewRunRepository implements ReviewRunRepository {
  constructor(private readonly db: PrismaClient) {}
  async findById(id: ReviewRunId): Promise<ReviewRun | null> {
    try {
      const row = await this.db.reviewRun.findUnique({
        where: { id },
        include: { overrides: true },
      });
      return row ? toReviewRun(row) : null;
    } catch (error) {
      throw translatePrismaError(error);
    }
  }
  async listByProject(projectId: ProjectId): Promise<readonly ReviewRun[]> {
    try {
      const rows = await this.db.reviewRun.findMany({
        where: { projectId },
        include: { overrides: true },
        orderBy: [{ completedAt: "asc" }, { id: "asc" }],
      });
      return rows.map(toReviewRun);
    } catch (error) {
      throw translatePrismaError(error);
    }
  }
  async insert(review: ReviewRun): Promise<void> {
    try {
      await this.db.$transaction(async (tx) => {
        await tx.reviewRun.create({ data: toReviewRunFields(review) });
        await tx.reviewScoreOverride.createMany({ data: toReviewOverrideRows(review) });
      });
    } catch (error) {
      throw translatePrismaError(error);
    }
  }
}
