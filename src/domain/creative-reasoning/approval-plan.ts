import type { OwnerId, ProjectId } from "@/domain/project";
import {
  type DomainError,
  InvalidStateTransitionError,
  validateBoundedText,
} from "@/domain/shared";
import { err, ok, type Result } from "@/lib/result";
import type { CreativeDirection } from "./direction";
import {
  CreativeAlignmentError,
  CreativeAuthorityError,
  EmptyProjectPlanError,
  InvalidPlanOrderingError,
} from "./errors";
import { validateGrounding, type GroundedClaim } from "./grounding";
import type { CreativeApprovalId, CreativeDirectionId, PlanSegmentId, ProjectPlanId } from "./ids";

export interface CreativeApproval {
  readonly id: CreativeApprovalId;
  readonly ownerId: OwnerId;
  readonly projectId: ProjectId;
  readonly directionId: CreativeDirectionId;
  readonly approvedBy: OwnerId;
  readonly approvedAt: Date;
}
export function createCreativeApproval(input: {
  id: CreativeApprovalId;
  direction: CreativeDirection;
  approvedBy: OwnerId;
  now: Date;
}): Result<CreativeApproval, DomainError> {
  if (input.approvedBy !== input.direction.ownerId)
    return err(
      new CreativeAuthorityError("Creative approval must be attributed to the project owner"),
    );
  if (input.now < input.direction.createdAt)
    return err(new CreativeAlignmentError("Approval cannot precede direction creation"));
  return ok({
    id: input.id,
    ownerId: input.direction.ownerId,
    projectId: input.direction.projectId,
    directionId: input.direction.id,
    approvedBy: input.approvedBy,
    approvedAt: input.now,
  });
}
export interface PlanSegment {
  readonly id: PlanSegmentId;
  readonly sequence: number;
  readonly intent: string;
  readonly grounding: readonly GroundedClaim[];
}
export type ProjectPlanStatus = "DRAFT" | "APPROVED";
export interface ProjectPlan {
  readonly id: ProjectPlanId;
  readonly ownerId: OwnerId;
  readonly projectId: ProjectId;
  readonly creativeApprovalId: CreativeApprovalId;
  readonly summary: string;
  readonly segments: readonly PlanSegment[];
  readonly status: ProjectPlanStatus;
  readonly createdAt: Date;
  readonly approvedBy: OwnerId | null;
  readonly approvedAt: Date | null;
  readonly lockVersion: number;
}
export function createProjectPlan(input: {
  id: ProjectPlanId;
  ownerId: OwnerId;
  projectId: ProjectId;
  creativeApprovalId: CreativeApprovalId;
  summary: string;
  segments: readonly PlanSegment[];
  now: Date;
}): Result<ProjectPlan, DomainError> {
  if (input.segments.length === 0) return err(new EmptyProjectPlanError());
  const summary = validateBoundedText(input.summary, { label: "Project plan summary", max: 2000 });
  if (!summary.ok) return summary;
  const ids = new Set<string>();
  const sequences = new Set<number>();
  const segments: PlanSegment[] = [];
  for (const value of input.segments) {
    if (ids.has(value.id))
      return err(new InvalidPlanOrderingError("Plan segment ids must be unique"));
    if (!Number.isInteger(value.sequence) || value.sequence < 0 || sequences.has(value.sequence))
      return err(
        new InvalidPlanOrderingError("Plan segment sequences must be unique non-negative integers"),
      );
    ids.add(value.id);
    sequences.add(value.sequence);
    const intent = validateBoundedText(value.intent, { label: "Plan segment intent", max: 3000 });
    if (!intent.ok) return intent;
    const grounding = validateGrounding(value.grounding);
    if (!grounding.ok) return grounding;
    segments.push({ ...value, intent: intent.value, grounding: grounding.value });
  }
  segments.sort((a, b) => a.sequence - b.sequence || a.id.localeCompare(b.id));
  if (segments.some((value, index) => value.sequence !== index))
    return err(new InvalidPlanOrderingError("Plan segment sequences must be contiguous from zero"));
  return ok({
    ...input,
    summary: summary.value,
    segments,
    status: "DRAFT",
    createdAt: input.now,
    approvedBy: null,
    approvedAt: null,
    lockVersion: 1,
  });
}
export function approveProjectPlan(
  plan: ProjectPlan,
  approval: CreativeApproval,
): Result<ProjectPlan, DomainError> {
  if (plan.status !== "DRAFT")
    return err(new InvalidStateTransitionError("ProjectPlan", plan.status, "APPROVED"));
  if (
    approval.id !== plan.creativeApprovalId ||
    approval.ownerId !== plan.ownerId ||
    approval.projectId !== plan.projectId
  )
    return err(new CreativeAlignmentError("Project plan requires its matching creative approval"));
  return ok({
    ...plan,
    status: "APPROVED",
    approvedBy: approval.approvedBy,
    approvedAt: approval.approvedAt,
    lockVersion: plan.lockVersion + 1,
  });
}
