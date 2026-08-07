import type { Prisma } from "@prisma/client";
import {
  CriterionId,
  createReviewRun,
  EvaluationId,
  ReviewRunId,
  RubricId,
  type ReviewRun,
} from "@/domain/evaluation";
import { OwnerId, ProjectId } from "@/domain/project";
import { makeScore } from "@/domain/shared";
import { orThrowMapping } from "./shared";

export type ReviewRunRow = Prisma.ReviewRunGetPayload<{ include: { overrides: true } }>;

export function toReviewRun(row: ReviewRunRow): ReviewRun {
  return orThrowMapping(
    createReviewRun({
      id: orThrowMapping(ReviewRunId.parse(row.id), `reviewRun.id="${row.id}"`),
      projectId: orThrowMapping(
        ProjectId.parse(row.projectId),
        `reviewRun.projectId="${row.projectId}"`,
      ),
      rubricId: orThrowMapping(
        RubricId.parse(row.rubricId),
        `reviewRun.rubricId="${row.rubricId}"`,
      ),
      evaluationId: orThrowMapping(
        EvaluationId.parse(row.evaluationId),
        `reviewRun.evaluationId="${row.evaluationId}"`,
      ),
      reviewerId: orThrowMapping(
        OwnerId.parse(row.reviewerId),
        `reviewRun.reviewerId="${row.reviewerId}"`,
      ),
      completedAt: row.completedAt,
      overrides: [...row.overrides]
        .sort((a, b) => a.criterionId.localeCompare(b.criterionId))
        .map((entry) => ({
          criterionId: orThrowMapping(
            CriterionId.parse(entry.criterionId),
            `override.criterionId="${entry.criterionId}"`,
          ),
          originalScore: orThrowMapping(
            makeScore(entry.originalScore),
            `override.originalScore=${entry.originalScore}`,
          ),
          overrideScore: orThrowMapping(
            makeScore(entry.overrideScore),
            `override.overrideScore=${entry.overrideScore}`,
          ),
          rationale: entry.rationale,
        })),
    }),
    `reviewRun aggregate="${row.id}"`,
  );
}

export function toReviewRunFields(review: ReviewRun) {
  return {
    id: review.id,
    projectId: review.projectId,
    rubricId: review.rubricId,
    evaluationId: review.evaluationId,
    reviewerId: review.reviewerId,
    completedAt: review.completedAt,
  };
}

export function toReviewOverrideRows(review: ReviewRun) {
  return review.overrides.map((entry) => ({
    reviewRunId: review.id,
    rubricId: review.rubricId,
    evaluationId: review.evaluationId,
    criterionId: entry.criterionId,
    originalScore: entry.originalScore,
    overrideScore: entry.overrideScore,
    rationale: entry.rationale,
  }));
}
