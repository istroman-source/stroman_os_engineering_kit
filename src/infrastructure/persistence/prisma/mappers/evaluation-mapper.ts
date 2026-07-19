import type { Prisma } from "@prisma/client";
import {
  type CriterionScore,
  CriterionId,
  type Evaluation,
  EvaluationId,
  RubricId,
} from "@/domain/evaluation";
import { OwnerId, ProjectId } from "@/domain/project";
import { makeScore } from "@/domain/shared";
import { orThrowMapping } from "./shared";

export type EvaluationRow = Prisma.EvaluationGetPayload<{ include: { scores: true } }>;

export function toEvaluation(row: EvaluationRow): Evaluation {
  const scores: CriterionScore[] = [...row.scores]
    .sort((a, b) => a.criterionId.localeCompare(b.criterionId))
    .map((score) => ({
      criterionId: orThrowMapping(
        CriterionId.parse(score.criterionId),
        `score.criterionId="${score.criterionId}"`,
      ),
      score: orThrowMapping(makeScore(score.score), `score.value=${score.score}`),
      justification: score.justification,
    }));

  return {
    id: orThrowMapping(EvaluationId.parse(row.id), `evaluation.id="${row.id}"`),
    projectId: orThrowMapping(
      ProjectId.parse(row.projectId),
      `evaluation.projectId="${row.projectId}"`,
    ),
    rubricId: orThrowMapping(RubricId.parse(row.rubricId), `evaluation.rubricId="${row.rubricId}"`),
    reviewerType: row.reviewerType,
    reviewerId:
      row.reviewerId === null
        ? null
        : orThrowMapping(
            OwnerId.parse(row.reviewerId),
            `evaluation.reviewerId="${row.reviewerId}"`,
          ),
    scores,
    createdAt: row.createdAt,
  };
}

export function toEvaluationFields(evaluation: Evaluation) {
  return {
    id: evaluation.id,
    projectId: evaluation.projectId,
    rubricId: evaluation.rubricId,
    reviewerType: evaluation.reviewerType,
    reviewerId: evaluation.reviewerId,
    createdAt: evaluation.createdAt,
  };
}

export function toEvaluationScoreRows(evaluation: Evaluation) {
  return evaluation.scores.map((score) => ({
    evaluationId: evaluation.id,
    criterionId: score.criterionId,
    score: score.score,
    justification: score.justification,
  }));
}
