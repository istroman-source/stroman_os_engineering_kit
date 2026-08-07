import type { OwnerId, ProjectId } from "@/domain/project";
import { type DomainError, validateBoundedText } from "@/domain/shared";
import { ok, type Result } from "@/lib/result";
import { validateGrounding, type GroundedClaim } from "./grounding";
import type { CreativeDirectionId, CreativeReasoningSessionId } from "./ids";

export type CreativeOrigin = "AI" | "HUMAN";
export interface CreativeDirection {
  readonly id: CreativeDirectionId;
  readonly ownerId: OwnerId;
  readonly projectId: ProjectId;
  readonly sessionId: CreativeReasoningSessionId;
  readonly summary: string;
  readonly intent: string;
  readonly form: string;
  readonly formTags: readonly string[];
  readonly origin: CreativeOrigin;
  readonly grounding: readonly GroundedClaim[];
  readonly status: "PROPOSED";
  readonly createdAt: Date;
}
export function createCreativeDirection(
  input: Omit<CreativeDirection, "status">,
): Result<CreativeDirection, DomainError> {
  const summary = validateBoundedText(input.summary, { label: "Direction summary", max: 1000 });
  if (!summary.ok) return summary;
  const intent = validateBoundedText(input.intent, { label: "Direction intent", max: 4000 });
  if (!intent.ok) return intent;
  const form = validateBoundedText(input.form, { label: "Creative form", max: 200 });
  if (!form.ok) return form;
  const tags: string[] = [];
  for (const raw of input.formTags) {
    const tag = validateBoundedText(raw, { label: "Creative form tag", max: 100 });
    if (!tag.ok) return tag;
    tags.push(tag.value);
  }
  const grounding = validateGrounding(input.grounding);
  if (!grounding.ok) return grounding;
  return ok({
    ...input,
    summary: summary.value,
    intent: intent.value,
    form: form.value,
    formTags: tags,
    grounding: grounding.value,
    status: "PROPOSED",
  });
}
