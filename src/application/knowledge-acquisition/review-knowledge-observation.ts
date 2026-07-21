import { ConflictError, OptimisticConcurrencyError } from "@/lib/errors";
import { err, ok } from "@/lib/result";
import type { OwnerId } from "@/domain/project";
import {
  KnowledgeReviewId,
  ObservationAlreadyReviewedError,
  reviewObservation,
  type KnowledgeObservationId,
  type KnowledgeObservationRepository,
  type ObservationPayload,
  type ReviewOutcome,
} from "@/domain/knowledge-acquisition";
import type { Clock, IdGenerator } from "../shared";
import { RepositoryError } from "../shared/errors";
import { loadOwnedObservation } from "./knowledge-source-access";
import { toKnowledgeObservationView, toKnowledgeReviewView } from "./knowledge-acquisition-view";
export async function reviewKnowledgeObservation(
  deps: { knowledgeObservations: KnowledgeObservationRepository; ids: IdGenerator; clock: Clock },
  input: {
    actorId: OwnerId;
    knowledgeObservationId: KnowledgeObservationId;
    expectedVersion: number;
    outcome: ReviewOutcome;
    note?: string | null;
    editedPayload?: ObservationPayload | null;
  },
) {
  const loaded = await loadOwnedObservation(
    deps.knowledgeObservations,
    input.actorId,
    input.knowledgeObservationId,
    "knowledgeObservation.review",
  );
  if (!loaded.ok) return loaded;
  if (loaded.value.lockVersion !== input.expectedVersion)
    return err(new OptimisticConcurrencyError());
  const made = reviewObservation(loaded.value, {
    id: KnowledgeReviewId.unsafe(deps.ids.generate(KnowledgeReviewId.prefix)),
    outcome: input.outcome,
    reviewerId: input.actorId,
    note: input.note,
    editedPayload: input.editedPayload,
    now: deps.clock.now(),
  });
  if (!made.ok) return made;
  try {
    await deps.knowledgeObservations.applyReview(made.value.observation, made.value.review);
  } catch (cause) {
    if (cause instanceof ConflictError) return err(new ObservationAlreadyReviewedError());
    if (cause instanceof OptimisticConcurrencyError) return err(cause);
    return err(new RepositoryError("knowledgeObservation.applyReview", { cause }));
  }
  return ok({
    observation: toKnowledgeObservationView(made.value.observation),
    review: toKnowledgeReviewView(made.value.review),
  });
}
