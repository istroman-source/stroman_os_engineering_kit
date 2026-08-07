import type { ReviewRun, ReviewRunId, ScoreOverride } from "@/domain/evaluation";
import type { EvaluationId, RubricId } from "@/domain/evaluation";
import type { OwnerId, ProjectId } from "@/domain/project";

export interface ReviewRunView {
  readonly id: ReviewRunId;
  readonly projectId: ProjectId;
  readonly rubricId: RubricId;
  readonly evaluationId: EvaluationId;
  readonly reviewerId: OwnerId;
  readonly overrides: readonly ScoreOverride[];
  readonly completedAt: Date;
}

export function toReviewRunView(review: ReviewRun): ReviewRunView {
  return { ...review, overrides: review.overrides.map((entry) => ({ ...entry })) };
}
