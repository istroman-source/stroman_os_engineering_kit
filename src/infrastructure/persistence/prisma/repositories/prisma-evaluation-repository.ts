import type { PrismaClient } from "@prisma/client";
import type { Evaluation, EvaluationId, EvaluationRepository } from "@/domain/evaluation";
import type { ProjectId } from "@/domain/project";
import { translatePrismaError } from "../errors";
import {
  toEvaluation,
  toEvaluationFields,
  toEvaluationScoreRows,
} from "../mappers/evaluation-mapper";

/**
 * PostgreSQL/Prisma adapter for the Evaluation repository. Evaluations are
 * append-only (immutable once recorded), so only `insert` is supported: the
 * evaluation and its criterion scores are created atomically in a transaction.
 * Project/rubric references are enforced by foreign keys.
 */
export class PrismaEvaluationRepository implements EvaluationRepository {
  constructor(private readonly db: PrismaClient) {}

  async findById(id: EvaluationId): Promise<Evaluation | null> {
    try {
      const row = await this.db.evaluation.findUnique({ where: { id }, include: { scores: true } });
      return row ? toEvaluation(row) : null;
    } catch (error) {
      throw translatePrismaError(error);
    }
  }

  async listByProject(projectId: ProjectId): Promise<readonly Evaluation[]> {
    try {
      const rows = await this.db.evaluation.findMany({
        where: { projectId },
        include: { scores: true },
        orderBy: { createdAt: "asc" },
      });
      return rows.map(toEvaluation);
    } catch (error) {
      throw translatePrismaError(error);
    }
  }

  async insert(evaluation: Evaluation): Promise<void> {
    const fields = toEvaluationFields(evaluation);
    const scores = toEvaluationScoreRows(evaluation);
    try {
      await this.db.$transaction(async (tx) => {
        await tx.evaluation.create({ data: fields });
        if (scores.length > 0) {
          await tx.evaluationScore.createMany({ data: scores });
        }
      });
    } catch (error) {
      throw translatePrismaError(error);
    }
  }
}
