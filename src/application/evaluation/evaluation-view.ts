import type {
  CriterionAnchors,
  CriterionId,
  Evaluation,
  EvaluationId,
  ReviewerType,
  Rubric,
  RubricId,
} from "@/domain/evaluation";
import type { OwnerId, ProjectId } from "@/domain/project";
import type { Score, Slug } from "@/domain/shared";

/** Projection of a rubric criterion (includes anchors for scoring UIs). */
export interface RubricCriterionView {
  readonly id: CriterionId;
  readonly name: string;
  readonly weight: number;
  readonly anchors: CriterionAnchors;
}

export interface RubricView {
  readonly id: RubricId;
  readonly slug: Slug;
  readonly title: string;
  readonly criteria: readonly RubricCriterionView[];
}

export function toRubricView(rubric: Rubric): RubricView {
  return {
    id: rubric.id,
    slug: rubric.slug,
    title: rubric.title,
    criteria: rubric.criteria.map((criterion) => ({
      id: criterion.id,
      name: criterion.name,
      weight: criterion.weight,
      anchors: criterion.anchors,
    })),
  };
}

export interface CriterionScoreView {
  readonly criterionId: CriterionId;
  readonly score: Score;
  readonly justification: string;
}

export interface EvaluationView {
  readonly id: EvaluationId;
  readonly projectId: ProjectId;
  readonly rubricId: RubricId;
  readonly reviewerType: ReviewerType;
  readonly reviewerId: OwnerId | null;
  readonly scores: readonly CriterionScoreView[];
  readonly createdAt: Date;
}

export function toEvaluationView(evaluation: Evaluation): EvaluationView {
  return {
    id: evaluation.id,
    projectId: evaluation.projectId,
    rubricId: evaluation.rubricId,
    reviewerType: evaluation.reviewerType,
    reviewerId: evaluation.reviewerId,
    scores: evaluation.scores.map((score) => ({
      criterionId: score.criterionId,
      score: score.score,
      justification: score.justification,
    })),
    createdAt: evaluation.createdAt,
  };
}
