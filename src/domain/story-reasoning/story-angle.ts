import { err, ok, type Result } from "@/lib/result";
import type { OwnerId, ProjectId } from "@/domain/project";
import {
  defineStateMachine,
  type DomainError,
  InvalidStateTransitionError,
  validateBoundedText,
} from "@/domain/shared";
import type { StoryAngleId } from "./ids";

/**
 * Lifecycle of a candidate story angle:
 *   DRAFT      — authored, not yet critiqued
 *   EVALUATED  — at least one critique recorded; awaiting a human's call
 *   SELECTED   — the human chose this angle for the project
 *   ARCHIVED   — set aside
 * Transitions are performed ONLY by the explicit human operations below; a
 * critique never moves an angle on its own.
 */
export type StoryAngleStatus = "DRAFT" | "EVALUATED" | "SELECTED" | "ARCHIVED";

export const storyAngleLifecycle = defineStateMachine<StoryAngleStatus>({
  DRAFT: ["EVALUATED", "ARCHIVED"],
  EVALUATED: ["SELECTED", "DRAFT", "ARCHIVED"],
  SELECTED: ["ARCHIVED"],
  ARCHIVED: ["DRAFT"],
});

/**
 * A candidate narrative direction for a project. Aggregate root of the Story
 * Reasoning Engine. Cross-domain references (owner, project) are held by
 * identifier only; the angle itself carries the human-authored framing.
 */
export interface StoryAngle {
  readonly id: StoryAngleId;
  readonly ownerId: OwnerId;
  readonly projectId: ProjectId;
  readonly title: string;
  readonly theme: string;
  readonly premise: string;
  readonly audiencePromise: string;
  readonly centralQuestion: string;
  readonly status: StoryAngleStatus;
  readonly createdAt: Date;
  /**
   * Optimistic-concurrency token, managed by the persistence layer, so a stale
   * write cannot overwrite a newer lifecycle change.
   */
  readonly lockVersion: number;
}

export interface CreateStoryAngleInput {
  readonly id: StoryAngleId;
  readonly ownerId: OwnerId;
  readonly projectId: ProjectId;
  readonly title: string;
  readonly theme: string;
  readonly premise: string;
  readonly audiencePromise: string;
  readonly centralQuestion: string;
  readonly now: Date;
}

export function createStoryAngle(input: CreateStoryAngleInput): Result<StoryAngle, DomainError> {
  const title = validateBoundedText(input.title, { label: "Story angle title", max: 200 });
  if (!title.ok) return title;
  const theme = validateBoundedText(input.theme, { label: "Story angle theme", max: 200 });
  if (!theme.ok) return theme;
  const premise = validateBoundedText(input.premise, { label: "Story angle premise", max: 2000 });
  if (!premise.ok) return premise;
  const audiencePromise = validateBoundedText(input.audiencePromise, {
    label: "Audience promise",
    max: 500,
  });
  if (!audiencePromise.ok) return audiencePromise;
  const centralQuestion = validateBoundedText(input.centralQuestion, {
    label: "Central question",
    max: 500,
  });
  if (!centralQuestion.ok) return centralQuestion;

  return ok({
    id: input.id,
    ownerId: input.ownerId,
    projectId: input.projectId,
    title: title.value,
    theme: theme.value,
    premise: premise.value,
    audiencePromise: audiencePromise.value,
    centralQuestion: centralQuestion.value,
    status: "DRAFT",
    createdAt: input.now,
    lockVersion: 1,
  });
}

/**
 * Apply a lifecycle transition from one of the allowed source states to `to`.
 * Restricting the source set (not just the target) lets operations that share a
 * target — revise and restore both land on DRAFT — stay semantically distinct.
 */
function transition(
  angle: StoryAngle,
  allowedFrom: readonly StoryAngleStatus[],
  to: StoryAngleStatus,
): Result<StoryAngle, DomainError> {
  if (!allowedFrom.includes(angle.status)) {
    return err(new InvalidStateTransitionError("StoryAngle", angle.status, to));
  }
  const asserted = storyAngleLifecycle.assert("StoryAngle", angle.status, to);
  if (!asserted.ok) return asserted;
  return ok({ ...angle, status: to, lockVersion: angle.lockVersion + 1 });
}

/** Record that the angle has been critiqued and is ready for a human call. */
export function evaluateStoryAngle(angle: StoryAngle): Result<StoryAngle, DomainError> {
  return transition(angle, ["DRAFT"], "EVALUATED");
}

/** A human chooses this angle. (One selected angle per project is enforced above the domain.) */
export function selectStoryAngle(angle: StoryAngle): Result<StoryAngle, DomainError> {
  return transition(angle, ["EVALUATED"], "SELECTED");
}

/** Send an evaluated angle back to DRAFT for rework. */
export function reviseStoryAngle(angle: StoryAngle): Result<StoryAngle, DomainError> {
  return transition(angle, ["EVALUATED"], "DRAFT");
}

/** Set an active angle aside. */
export function archiveStoryAngle(angle: StoryAngle): Result<StoryAngle, DomainError> {
  return transition(angle, ["DRAFT", "EVALUATED", "SELECTED"], "ARCHIVED");
}

/** Bring an archived angle back into play as a DRAFT. */
export function restoreStoryAngle(angle: StoryAngle): Result<StoryAngle, DomainError> {
  return transition(angle, ["ARCHIVED"], "DRAFT");
}
