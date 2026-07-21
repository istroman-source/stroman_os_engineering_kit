import { ConflictError, OptimisticConcurrencyError } from "@/lib/errors";
import { err, ok, type Result } from "@/lib/result";
import type { OwnerId } from "@/domain/project";
import type { DomainError } from "@/domain/shared";
import {
  archiveStoryAngle as archiveAggregate,
  evaluateStoryAngle as evaluateAggregate,
  reviseStoryAngle as reviseAggregate,
  restoreStoryAngle as restoreAggregate,
  selectStoryAngle as selectAggregate,
  type StoryAngle,
  type StoryAngleId,
  type StoryAngleRepository,
} from "@/domain/story-reasoning";
import { attempt, attemptUpdate } from "../shared/attempt";
import {
  NotAuthorizedError,
  NotFoundError,
  RepositoryError,
  SelectedAngleConflictError,
} from "../shared/errors";
import { loadOwnedStoryAngle } from "./story-angle-access";
import { type StoryAngleView, toStoryAngleView } from "./story-reasoning-view";

export interface TransitionStoryAngleDeps {
  readonly storyAngles: StoryAngleRepository;
}

export interface TransitionStoryAngleInput {
  readonly actorId: OwnerId;
  readonly storyAngleId: StoryAngleId;
  /** The lockVersion the caller last observed (optimistic concurrency). */
  readonly expectedVersion: number;
}

type TransitionResult = Result<
  StoryAngleView,
  DomainError | NotFoundError | NotAuthorizedError | OptimisticConcurrencyError | RepositoryError
>;

/**
 * Shared flow for the lifecycle operations that need no cross-row invariant:
 * authorize the actor, verify the expected version, apply the domain transition,
 * and persist with an optimistic-concurrency compare-and-swap.
 */
async function runTransition(
  deps: TransitionStoryAngleDeps,
  input: TransitionStoryAngleInput,
  action: string,
  apply: (angle: StoryAngle) => Result<StoryAngle, DomainError>,
): Promise<TransitionResult> {
  const access = await loadOwnedStoryAngle(
    deps.storyAngles,
    input.actorId,
    input.storyAngleId,
    action,
  );
  if (!access.ok) return access;
  if (access.value.lockVersion !== input.expectedVersion) {
    return err(new OptimisticConcurrencyError());
  }
  const transitioned = apply(access.value);
  if (!transitioned.ok) return transitioned;
  const saved = await attemptUpdate(action, () => deps.storyAngles.update(transitioned.value));
  if (!saved.ok) return saved;
  return ok(toStoryAngleView(transitioned.value));
}

export function evaluateStoryAngle(
  deps: TransitionStoryAngleDeps,
  input: TransitionStoryAngleInput,
): Promise<TransitionResult> {
  return runTransition(deps, input, "storyAngle.evaluate", evaluateAggregate);
}

export function reviseStoryAngle(
  deps: TransitionStoryAngleDeps,
  input: TransitionStoryAngleInput,
): Promise<TransitionResult> {
  return runTransition(deps, input, "storyAngle.revise", reviseAggregate);
}

export function archiveStoryAngle(
  deps: TransitionStoryAngleDeps,
  input: TransitionStoryAngleInput,
): Promise<TransitionResult> {
  return runTransition(deps, input, "storyAngle.archive", archiveAggregate);
}

export function restoreStoryAngle(
  deps: TransitionStoryAngleDeps,
  input: TransitionStoryAngleInput,
): Promise<TransitionResult> {
  return runTransition(deps, input, "storyAngle.restore", restoreAggregate);
}

type SelectResult = Result<
  StoryAngleView,
  | DomainError
  | NotFoundError
  | NotAuthorizedError
  | OptimisticConcurrencyError
  | SelectedAngleConflictError
  | RepositoryError
>;

/**
 * Select an angle as the project's chosen direction. Enforces "at most one
 * SELECTED angle per project": a friendly pre-check rejects a second selection,
 * and the database partial unique index is the authoritative, race-proof backstop
 * (a concurrent second commit surfaces here as a SelectedAngleConflictError).
 */
export async function selectStoryAngle(
  deps: TransitionStoryAngleDeps,
  input: TransitionStoryAngleInput,
): Promise<SelectResult> {
  const access = await loadOwnedStoryAngle(
    deps.storyAngles,
    input.actorId,
    input.storyAngleId,
    "storyAngle.select",
  );
  if (!access.ok) return access;
  const angle = access.value;
  if (angle.lockVersion !== input.expectedVersion) {
    return err(new OptimisticConcurrencyError());
  }

  const selected = selectAggregate(angle);
  if (!selected.ok) return selected;

  // Friendly, common-case conflict check before attempting the write.
  const current = await attempt("storyAngle.findSelectedByProject", () =>
    deps.storyAngles.findSelectedByProject(angle.projectId),
  );
  if (!current.ok) return current;
  if (current.value && current.value.id !== angle.id) {
    return err(new SelectedAngleConflictError(angle.projectId));
  }

  // The partial unique index is the transactional guarantee. Map its violation to
  // the domain-meaningful conflict; keep concurrency + storage failures distinct.
  try {
    await deps.storyAngles.update(selected.value);
  } catch (cause) {
    if (cause instanceof OptimisticConcurrencyError) return err(cause);
    if (cause instanceof ConflictError) return err(new SelectedAngleConflictError(angle.projectId));
    return err(new RepositoryError("storyAngle.select", { cause }));
  }
  return ok(toStoryAngleView(selected.value));
}
