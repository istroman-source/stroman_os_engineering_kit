import { err, ok, type Result } from "@/lib/result";
import { type DomainError, type Score, validateBoundedText } from "../shared";
import type { OwnerId, ProjectId } from "../project/project-id";
import type { CriterionId, EvaluationId, RubricId } from "./evaluation-id";
import { DuplicateCriterionError, EmptyEvaluationError } from "./evaluation-errors";

/** Who produced an evaluation. */
export type ReviewerType = "HUMAN" | "AI";

export interface CriterionScore {
  readonly criterionId: CriterionId;
  readonly score: Score;
  readonly justification: string;
}

/**
 * A recorded, rubric-based scoring of a project. Aggregate root; scores are owned
 * and immutable once created. Cross-domain references (project, rubric, reviewer)
 * are held by identifier only.
 */
export interface Evaluation {
  readonly id: EvaluationId;
  readonly projectId: ProjectId;
  readonly rubricId: RubricId;
  readonly reviewerType: ReviewerType;
  readonly reviewerId: OwnerId | null;
  readonly scores: readonly CriterionScore[];
  readonly createdAt: Date;
}

export interface CriterionScoreInput {
  readonly criterionId: CriterionId;
  readonly score: Score;
  readonly justification: string;
}

export interface CreateEvaluationInput {
  readonly id: EvaluationId;
  readonly projectId: ProjectId;
  readonly rubricId: RubricId;
  readonly reviewerType: ReviewerType;
  readonly reviewerId?: OwnerId | null;
  readonly scores: readonly CriterionScoreInput[];
  readonly now: Date;
}

export function createEvaluation(input: CreateEvaluationInput): Result<Evaluation, DomainError> {
  if (input.scores.length === 0) return err(new EmptyEvaluationError());

  const seen = new Set<string>();
  const scores: CriterionScore[] = [];
  for (const entry of input.scores) {
    if (seen.has(entry.criterionId)) return err(new DuplicateCriterionError(entry.criterionId));
    seen.add(entry.criterionId);
    const justification = validateBoundedText(entry.justification, {
      label: "Justification",
      max: 2000,
    });
    if (!justification.ok) return justification;
    scores.push({
      criterionId: entry.criterionId,
      score: entry.score,
      justification: justification.value,
    });
  }

  return ok({
    id: input.id,
    projectId: input.projectId,
    rubricId: input.rubricId,
    reviewerType: input.reviewerType,
    reviewerId: input.reviewerId ?? null,
    scores,
    createdAt: input.now,
  });
}

/** Index an evaluation's scores by criterion, for use with `weightedScore`. */
export function scoreMap(evaluation: Evaluation): ReadonlyMap<CriterionId, Score> {
  const map = new Map<CriterionId, Score>();
  for (const entry of evaluation.scores) {
    map.set(entry.criterionId, entry.score);
  }
  return map;
}
