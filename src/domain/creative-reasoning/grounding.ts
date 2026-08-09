import type { EvidenceReferenceId } from "@/domain/evidence";
import type { InsightId, MemoryId } from "@/domain/memory";
import { type DomainError, InvalidValueError, validateBoundedText } from "@/domain/shared";
import { err, ok, type Result } from "@/lib/result";
import { GroundingReferenceError } from "./errors";

export type CreativeEvidenceRef =
  | { readonly kind: "SOURCE_EVIDENCE"; readonly evidenceReferenceId: EvidenceReferenceId }
  | { readonly kind: "MEMORY_CONTEXT"; readonly memoryId: MemoryId }
  | { readonly kind: "INSIGHT_CONTEXT"; readonly insightId: InsightId };

export type CreativeEvidenceRefInput = {
  readonly kind: "SOURCE_EVIDENCE" | "MEMORY_CONTEXT" | "INSIGHT_CONTEXT";
  readonly evidenceReferenceId?: EvidenceReferenceId | null;
  readonly memoryId?: MemoryId | null;
  readonly insightId?: InsightId | null;
};

export function createCreativeEvidenceRef(
  input: CreativeEvidenceRefInput,
): Result<CreativeEvidenceRef, GroundingReferenceError> {
  const evidence = input.evidenceReferenceId ?? null;
  const memory = input.memoryId ?? null;
  const insight = input.insightId ?? null;
  const count = Number(evidence !== null) + Number(memory !== null) + Number(insight !== null);
  if (count !== 1) return err(new GroundingReferenceError());
  if (input.kind === "SOURCE_EVIDENCE" && evidence !== null)
    return ok({ kind: input.kind, evidenceReferenceId: evidence });
  if (input.kind === "MEMORY_CONTEXT" && memory !== null)
    return ok({ kind: input.kind, memoryId: memory });
  if (input.kind === "INSIGHT_CONTEXT" && insight !== null)
    return ok({ kind: input.kind, insightId: insight });
  return err(new GroundingReferenceError());
}

export type GroundingStance = "SUPPORTING" | "CONTRADICTORY" | "CONTEXTUAL";
const GROUNDING_STANCES: readonly GroundingStance[] = ["SUPPORTING", "CONTRADICTORY", "CONTEXTUAL"];
export interface GroundedClaim {
  readonly ref: CreativeEvidenceRef;
  readonly stance: GroundingStance;
  readonly note: string;
}
export function createGroundedClaim(input: {
  ref: CreativeEvidenceRef;
  stance: GroundingStance;
  note: string;
}): Result<GroundedClaim, DomainError> {
  if (!GROUNDING_STANCES.includes(input.stance)) {
    return err(new InvalidValueError(`Invalid grounding stance: "${input.stance}"`));
  }
  const note = validateBoundedText(input.note, { label: "Grounding note", max: 2000 });
  return note.ok ? ok({ ...input, note: note.value }) : note;
}

export function validateGrounding(
  values: readonly GroundedClaim[],
): Result<readonly GroundedClaim[], DomainError> {
  const grounded: GroundedClaim[] = [];
  for (const value of values) {
    const claim = createGroundedClaim(value);
    if (!claim.ok) return claim;
    grounded.push(claim.value);
  }
  return ok(grounded);
}
