import { err, ok, type Result } from "@/lib/result";
import type { OwnerId } from "@/domain/project";
import { type DomainError, validateBoundedText } from "@/domain/shared";
import type { KnowledgeObservationId, KnowledgeReviewId } from "./ids";
import {
  type KnowledgeObservation,
  type ObservationPayload,
  validateObservationPayload,
} from "./knowledge-observation";
import {
  ObservationAlreadyReviewedError,
  ReviewOutcomeError,
} from "./knowledge-acquisition-errors";

/**
 * A human's decision on an observation. EDIT_AND_ACCEPT is distinct from ACCEPT so
 * that human improvements to extracted knowledge are preserved as future learning
 * data (the original observation payload stays immutable; the edit lives here).
 */
export type ReviewOutcome = "ACCEPT" | "EDIT_AND_ACCEPT" | "REJECT";

/**
 * The immutable record of a human review. Owner-scoped. `editedPayload` is set only
 * for EDIT_AND_ACCEPT and is validated identically to an extracted payload.
 */
export interface KnowledgeReview {
  readonly id: KnowledgeReviewId;
  readonly ownerId: OwnerId;
  readonly knowledgeObservationId: KnowledgeObservationId;
  readonly outcome: ReviewOutcome;
  readonly reviewerId: OwnerId;
  readonly note: string | null;
  readonly editedPayload: ObservationPayload | null;
  readonly reviewedAt: Date;
  readonly createdAt: Date;
}

export interface ReviewObservationInput {
  readonly id: KnowledgeReviewId;
  readonly outcome: ReviewOutcome;
  readonly reviewerId: OwnerId;
  readonly note?: string | null;
  /** Required for EDIT_AND_ACCEPT; forbidden otherwise. Must match the observation's kind. */
  readonly editedPayload?: ObservationPayload | null;
  readonly now: Date;
}

/**
 * Apply a human review to a pending observation, producing the updated observation
 * and the immutable review record. ACCEPT and EDIT_AND_ACCEPT move the observation
 * to ACCEPTED; REJECT moves it to REJECTED. The observation's original payload is
 * never mutated. Reviewing a non-pending observation is rejected, so accepted
 * knowledge can never be overwritten by reprocessing.
 */
export function reviewObservation(
  observation: KnowledgeObservation,
  input: ReviewObservationInput,
): Result<{ observation: KnowledgeObservation; review: KnowledgeReview }, DomainError> {
  if (observation.status !== "PENDING_REVIEW") {
    return err(new ObservationAlreadyReviewedError());
  }

  const providedEdit = input.editedPayload ?? null;
  let editedPayload: ObservationPayload | null = null;

  if (input.outcome === "EDIT_AND_ACCEPT") {
    if (providedEdit === null) {
      return err(new ReviewOutcomeError("EDIT_AND_ACCEPT requires an edited payload"));
    }
    if (providedEdit.kind !== observation.observationType) {
      return err(
        new ReviewOutcomeError(
          `Edited payload kind "${providedEdit.kind}" does not match the observation type "${observation.observationType}"`,
        ),
      );
    }
    const validated = validateObservationPayload(providedEdit);
    if (!validated.ok) return validated;
    editedPayload = validated.value;
  } else if (providedEdit !== null) {
    return err(new ReviewOutcomeError(`${input.outcome} must not carry an edited payload`));
  }

  let note: string | null = null;
  if (input.note != null && input.note.trim() !== "") {
    const validatedNote = validateBoundedText(input.note, { label: "Review note", max: 2000 });
    if (!validatedNote.ok) return validatedNote;
    note = validatedNote.value;
  }

  const nextStatus = input.outcome === "REJECT" ? "REJECTED" : "ACCEPTED";

  const review: KnowledgeReview = {
    id: input.id,
    ownerId: observation.ownerId,
    knowledgeObservationId: observation.id,
    outcome: input.outcome,
    reviewerId: input.reviewerId,
    note,
    editedPayload,
    reviewedAt: input.now,
    createdAt: input.now,
  };

  return ok({
    observation: { ...observation, status: nextStatus, lockVersion: observation.lockVersion + 1 },
    review,
  });
}
