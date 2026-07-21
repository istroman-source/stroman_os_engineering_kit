import { DomainError } from "@/domain/shared";

/**
 * A knowledge observation can be reviewed exactly once. Re-reviewing an
 * already-accepted or already-rejected observation is rejected so that accepted
 * knowledge (and its downstream materialization) can never be silently overwritten.
 */
export class ObservationAlreadyReviewedError extends DomainError {
  constructor() {
    super("CONFLICT", "This observation has already been reviewed");
  }
}

/**
 * The review outcome and its `editedPayload` must agree: EDIT_AND_ACCEPT must
 * carry an edited payload matching the observation's kind; ACCEPT and REJECT must
 * not carry one. Keeps the human's edit legible and the original extraction intact.
 */
export class ReviewOutcomeError extends DomainError {
  constructor(message: string) {
    super("VALIDATION", message);
  }
}
