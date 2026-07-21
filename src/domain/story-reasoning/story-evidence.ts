import { err, ok, type Result } from "@/lib/result";
import type { InsightId, MemoryId } from "@/domain/memory";
import type { OwnerId } from "@/domain/project";
import { type DomainError, validateBoundedText } from "@/domain/shared";
import type { StoryAngleId, StoryEvidenceId } from "./ids";
import { EvidenceReferenceError } from "./story-reasoning-errors";

/**
 * How a piece of evidence bears on a story angle:
 *   PRIMARY      — a load-bearing fact the angle rests on
 *   SUPPORTING   — reinforces the angle
 *   CONTEXTUAL   — background that frames the angle
 *   COUNTERPOINT — tension or a complication the angle must answer
 */
export type EvidenceRole = "PRIMARY" | "SUPPORTING" | "CONTEXTUAL" | "COUNTERPOINT";

/**
 * A single citation linking a story angle to the Memory Engine. Each record
 * references EXACTLY ONE memory-graph node (a memory OR an insight) so the
 * reasoning behind an angle is always traceable to one unambiguous source.
 */
export interface StoryEvidence {
  readonly id: StoryEvidenceId;
  readonly ownerId: OwnerId;
  readonly storyAngleId: StoryAngleId;
  readonly memoryId: MemoryId | null;
  readonly insightId: InsightId | null;
  readonly role: EvidenceRole;
  readonly reason: string;
  readonly createdAt: Date;
}

export interface CreateStoryEvidenceInput {
  readonly id: StoryEvidenceId;
  readonly ownerId: OwnerId;
  readonly storyAngleId: StoryAngleId;
  readonly memoryId?: MemoryId | null;
  readonly insightId?: InsightId | null;
  readonly role: EvidenceRole;
  readonly reason: string;
  readonly now: Date;
}

export function createStoryEvidence(
  input: CreateStoryEvidenceInput,
): Result<StoryEvidence, DomainError> {
  const memoryId = input.memoryId ?? null;
  const insightId = input.insightId ?? null;
  // Exactly one reference: both or neither is invalid.
  if ((memoryId === null) === (insightId === null)) {
    return err(new EvidenceReferenceError());
  }

  const reason = validateBoundedText(input.reason, { label: "Evidence reason", max: 2000 });
  if (!reason.ok) return reason;

  return ok({
    id: input.id,
    ownerId: input.ownerId,
    storyAngleId: input.storyAngleId,
    memoryId,
    insightId,
    role: input.role,
    reason: reason.value,
    createdAt: input.now,
  });
}
