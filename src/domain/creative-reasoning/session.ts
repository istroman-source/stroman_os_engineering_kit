import type { OwnerId, ProjectId } from "@/domain/project";
import { type DomainError, validateBoundedText } from "@/domain/shared";
import { err, ok, type Result } from "@/lib/result";
import { CreativeAlignmentError } from "./errors";
import type { CreativeDirection } from "./direction";
import type { CreativeDirectionId, CreativeReasoningSessionId } from "./ids";

export interface ObjectiveFraming {
  readonly goal: string;
  readonly proposedApproach: string | null;
}
export type CreativeReasoningSessionStatus = "ACTIVE" | "COMPLETED";
export interface CreativeReasoningSession {
  readonly id: CreativeReasoningSessionId;
  readonly ownerId: OwnerId;
  readonly projectId: ProjectId;
  readonly objective: ObjectiveFraming;
  readonly constraints: readonly string[];
  readonly recommendedDirectionId: CreativeDirectionId | null;
  readonly status: CreativeReasoningSessionStatus;
  readonly createdAt: Date;
  readonly lockVersion: number;
}
export function createCreativeReasoningSession(input: {
  id: CreativeReasoningSessionId;
  ownerId: OwnerId;
  projectId: ProjectId;
  objective: ObjectiveFraming;
  constraints?: readonly string[];
  now: Date;
}): Result<CreativeReasoningSession, DomainError> {
  const goal = validateBoundedText(input.objective.goal, { label: "Creative goal", max: 2000 });
  if (!goal.ok) return goal;
  let proposedApproach: string | null = null;
  if (input.objective.proposedApproach != null) {
    const value = validateBoundedText(input.objective.proposedApproach, {
      label: "Proposed approach",
      max: 4000,
    });
    if (!value.ok) return value;
    proposedApproach = value.value;
  }
  const constraints: string[] = [];
  for (const raw of input.constraints ?? []) {
    const value = validateBoundedText(raw, { label: "Creative constraint", max: 1000 });
    if (!value.ok) return value;
    constraints.push(value.value);
  }
  return ok({
    id: input.id,
    ownerId: input.ownerId,
    projectId: input.projectId,
    objective: { goal: goal.value, proposedApproach },
    constraints,
    recommendedDirectionId: null,
    status: "ACTIVE",
    createdAt: input.now,
    lockVersion: 1,
  });
}
export function recommendCreativeDirection(
  session: CreativeReasoningSession,
  direction: CreativeDirection,
): Result<CreativeReasoningSession, DomainError> {
  if (
    direction.sessionId !== session.id ||
    direction.ownerId !== session.ownerId ||
    direction.projectId !== session.projectId
  )
    return err(new CreativeAlignmentError("Recommended direction must belong to the session"));
  if (session.status !== "ACTIVE")
    return err(new CreativeAlignmentError("A completed reasoning session cannot be changed"));
  return ok({
    ...session,
    recommendedDirectionId: direction.id,
    lockVersion: session.lockVersion + 1,
  });
}
export function completeCreativeReasoningSession(
  session: CreativeReasoningSession,
): Result<CreativeReasoningSession, DomainError> {
  if (session.status !== "ACTIVE" || session.recommendedDirectionId === null)
    return err(
      new CreativeAlignmentError("A session requires a recommended direction to complete"),
    );
  return ok({ ...session, status: "COMPLETED", lockVersion: session.lockVersion + 1 });
}
