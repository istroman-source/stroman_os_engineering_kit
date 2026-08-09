import type { OwnerId, ProjectId } from "@/domain/project";
import { type DomainError, InvalidValueError, validateBoundedText } from "@/domain/shared";
import { err, ok, type Result } from "@/lib/result";
import type { CreativeDirection } from "./direction";
import { CreativeAlignmentError, SelfRevisionError } from "./errors";
import type { CreativeEvidenceRef } from "./grounding";
import type { CreativeDirectionId, HumanContextId, ReasoningRevisionId } from "./ids";

export type RevisionTrigger =
  | { readonly kind: "HUMAN_CONTEXT"; readonly contextId: HumanContextId }
  | { readonly kind: "NEW_EVIDENCE"; readonly ref: CreativeEvidenceRef };
const REVISION_TRIGGER_KINDS: readonly RevisionTrigger["kind"][] = [
  "HUMAN_CONTEXT",
  "NEW_EVIDENCE",
];
export interface ReasoningRevision {
  readonly id: ReasoningRevisionId;
  readonly ownerId: OwnerId;
  readonly projectId: ProjectId;
  readonly fromDirectionId: CreativeDirectionId;
  readonly toDirectionId: CreativeDirectionId;
  readonly trigger: RevisionTrigger;
  readonly reason: string;
  readonly createdAt: Date;
}
export function createReasoningRevision(input: {
  id: ReasoningRevisionId;
  from: CreativeDirection;
  to: CreativeDirection;
  trigger: RevisionTrigger;
  reason: string;
  now: Date;
}): Result<ReasoningRevision, DomainError> {
  if (!REVISION_TRIGGER_KINDS.includes(input.trigger.kind)) {
    return err(new InvalidValueError(`Invalid revision trigger kind: "${input.trigger.kind}"`));
  }
  if (input.from.id === input.to.id) return err(new SelfRevisionError());
  if (
    input.from.ownerId !== input.to.ownerId ||
    input.from.projectId !== input.to.projectId ||
    input.from.sessionId !== input.to.sessionId
  )
    return err(new CreativeAlignmentError("A revision must stay within one reasoning session"));
  const reason = validateBoundedText(input.reason, { label: "Revision reason", max: 4000 });
  if (!reason.ok) return reason;
  return ok({
    id: input.id,
    ownerId: input.from.ownerId,
    projectId: input.from.projectId,
    fromDirectionId: input.from.id,
    toDirectionId: input.to.id,
    trigger: input.trigger,
    reason: reason.value,
    createdAt: input.now,
  });
}
