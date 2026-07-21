import { DomainError } from "@/domain/shared";

/**
 * Story evidence must trace to EXACTLY ONE node of the memory graph: either a
 * memory or an insight, never both and never neither. This keeps every piece of
 * reasoning cited to a single, unambiguous source in the Memory Engine.
 */
export class EvidenceReferenceError extends DomainError {
  constructor() {
    super("VALIDATION", "Story evidence must reference exactly one of a memory or an insight");
  }
}

/**
 * A critique's authorship and its author reference must agree: a HUMAN critique
 * must name its critic, and an AI critique must not. Prevents mislabeled or
 * unattributed human judgment (the human-authority principle).
 */
export class CriticAuthorityError extends DomainError {
  constructor(message: string) {
    super("VALIDATION", message);
  }
}
