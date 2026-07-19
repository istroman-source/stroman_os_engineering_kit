import { DomainError } from "../shared";
import type { CriterionId } from "./evaluation-id";

export class EmptyRubricError extends DomainError {
  constructor() {
    super("VALIDATION", "A rubric must have at least one criterion");
  }
}

export class InvalidCriterionWeightError extends DomainError {
  readonly criterionId: CriterionId;
  constructor(criterionId: CriterionId) {
    super("VALIDATION", "Criterion weight must be a finite number greater than 0", {
      context: { criterionId },
    });
    this.criterionId = criterionId;
  }
}

export class DuplicateCriterionError extends DomainError {
  readonly criterionId: CriterionId;
  constructor(criterionId: CriterionId) {
    super("CONFLICT", "Duplicate criterion in rubric or evaluation", {
      context: { criterionId },
    });
    this.criterionId = criterionId;
  }
}

export class EmptyEvaluationError extends DomainError {
  constructor() {
    super("VALIDATION", "An evaluation must contain at least one score");
  }
}

export class IncompleteScoringError extends DomainError {
  readonly missing: readonly CriterionId[];
  constructor(missing: readonly CriterionId[]) {
    super("VALIDATION", "Scores are missing for one or more rubric criteria", {
      context: { missing },
    });
    this.missing = missing;
  }
}
