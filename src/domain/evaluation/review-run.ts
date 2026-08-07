import { err, ok, type Result } from "@/lib/result";
import type { OwnerId, ProjectId } from "../project";
import { type DomainError, type Score, validateBoundedText } from "../shared";
import type { CriterionId, EvaluationId, ReviewRunId, RubricId } from "./evaluation-id";
import {
  DuplicateCriterionError,
  EmptyReviewRunError,
  UnchangedScoreOverrideError,
} from "./evaluation-errors";

export interface ScoreOverride {
  readonly criterionId: CriterionId;
  readonly originalScore: Score;
  readonly overrideScore: Score;
  readonly rationale: string;
}

/** Immutable audit record of a human review of an existing evaluation. */
export interface ReviewRun {
  readonly id: ReviewRunId;
  readonly projectId: ProjectId;
  readonly rubricId: RubricId;
  readonly evaluationId: EvaluationId;
  readonly reviewerId: OwnerId;
  readonly overrides: readonly ScoreOverride[];
  readonly completedAt: Date;
}

export interface CreateReviewRunInput extends Omit<ReviewRun, "overrides"> {
  readonly overrides: readonly ScoreOverride[];
}

export function createReviewRun(input: CreateReviewRunInput): Result<ReviewRun, DomainError> {
  if (input.overrides.length === 0) return err(new EmptyReviewRunError());
  const seen = new Set<string>();
  const overrides: ScoreOverride[] = [];
  for (const entry of input.overrides) {
    if (seen.has(entry.criterionId)) return err(new DuplicateCriterionError(entry.criterionId));
    seen.add(entry.criterionId);
    if (entry.originalScore === entry.overrideScore) {
      return err(new UnchangedScoreOverrideError(entry.criterionId));
    }
    const rationale = validateBoundedText(entry.rationale, {
      label: "Override rationale",
      max: 2000,
    });
    if (!rationale.ok) return rationale;
    overrides.push({ ...entry, rationale: rationale.value });
  }
  return ok({ ...input, overrides });
}
