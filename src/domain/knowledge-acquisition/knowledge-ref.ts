import { err, ok, type Result } from "@/lib/result";
import { InvalidValueError } from "@/domain/shared";

/**
 * The four kinds of Creative Memory Engine record a knowledge observation can
 * describe (and, later, materialize into). Shared by an observation's type and by
 * a KnowledgeEngineRef's target type.
 */
export type KnowledgeKind = "ENTITY" | "MEMORY" | "INSIGHT" | "RELATIONSHIP";

export const KNOWLEDGE_KINDS: readonly KnowledgeKind[] = [
  "ENTITY",
  "MEMORY",
  "INSIGHT",
  "RELATIONSHIP",
];

/**
 * A provider-neutral pointer to a Creative Memory Engine record by kind + opaque
 * id. This is the decoupling seam: the acquisition domain never imports Memory
 * Engine branded ids or repositories. The future materialization stage uses this
 * to link an accepted observation to the one-or-more records it produces.
 */
export interface KnowledgeEngineRef {
  readonly recordType: KnowledgeKind;
  readonly recordId: string;
}

export function makeKnowledgeEngineRef(
  recordType: KnowledgeKind,
  recordId: string,
): Result<KnowledgeEngineRef, InvalidValueError> {
  if (!KNOWLEDGE_KINDS.includes(recordType)) {
    return err(new InvalidValueError(`Invalid record type: "${recordType}"`));
  }
  const trimmed = recordId.trim();
  if (trimmed === "") {
    return err(new InvalidValueError("A knowledge engine reference requires a record id"));
  }
  return ok({ recordType, recordId: trimmed });
}
