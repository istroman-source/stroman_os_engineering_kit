import { err, ok, type Result } from "@/lib/result";
import type { OwnerId } from "@/domain/project";
import {
  type Confidence,
  type DomainError,
  InvalidValueError,
  makeConfidence,
  validateBoundedText,
} from "@/domain/shared";
import type { KnowledgeObservationId } from "./ids";
import type { KnowledgeKind } from "./knowledge-ref";
import type { ObservationEvidence } from "./observation-evidence";

/** An observation's type mirrors the Memory Engine kind it describes. */
export type ObservationType = KnowledgeKind;

/** How an observation entered the system (distinct from provenance/evidence). */
export type ObservationOrigin = "AI" | "HUMAN" | "IMPORT";
const ORIGINS: readonly ObservationOrigin[] = ["AI", "HUMAN", "IMPORT"];

export type ObservationStatus = "PENDING_REVIEW" | "ACCEPTED" | "REJECTED";

/**
 * The proposed content of an observation, discriminated by kind. Minimal by
 * design — cross-observation reference resolution is deferred to a future
 * materialization stage.
 */
export type ObservationPayload =
  | { readonly kind: "ENTITY"; readonly name: string; readonly entityKind: string }
  | { readonly kind: "MEMORY"; readonly content: string }
  | { readonly kind: "INSIGHT"; readonly statement: string }
  | {
      readonly kind: "RELATIONSHIP";
      readonly relationType: string;
      readonly fromLabel: string;
      readonly toLabel: string;
    };

/**
 * Validate and normalize a payload's text fields. Shared with the review flow so an
 * edited payload is validated identically to an extracted one.
 */
export function validateObservationPayload(
  payload: ObservationPayload,
): Result<ObservationPayload, DomainError> {
  switch (payload.kind) {
    case "ENTITY": {
      const name = validateBoundedText(payload.name, { label: "Entity name", max: 200 });
      if (!name.ok) return name;
      const entityKind = validateBoundedText(payload.entityKind, { label: "Entity kind", max: 60 });
      if (!entityKind.ok) return entityKind;
      return ok({ kind: "ENTITY", name: name.value, entityKind: entityKind.value });
    }
    case "MEMORY": {
      const content = validateBoundedText(payload.content, { label: "Memory content", max: 5000 });
      if (!content.ok) return content;
      return ok({ kind: "MEMORY", content: content.value });
    }
    case "INSIGHT": {
      const statement = validateBoundedText(payload.statement, {
        label: "Insight statement",
        max: 2000,
      });
      if (!statement.ok) return statement;
      return ok({ kind: "INSIGHT", statement: statement.value });
    }
    case "RELATIONSHIP": {
      const relationType = validateBoundedText(payload.relationType, {
        label: "Relationship type",
        max: 60,
      });
      if (!relationType.ok) return relationType;
      const fromLabel = validateBoundedText(payload.fromLabel, { label: "From label", max: 200 });
      if (!fromLabel.ok) return fromLabel;
      const toLabel = validateBoundedText(payload.toLabel, { label: "To label", max: 200 });
      if (!toLabel.ok) return toLabel;
      return ok({
        kind: "RELATIONSHIP",
        relationType: relationType.value,
        fromLabel: fromLabel.value,
        toLabel: toLabel.value,
      });
    }
  }
}

/**
 * A discrete observation extracted from (or entered against) a source document,
 * staged for human review. It is NEVER a Memory Engine record — acceptance and
 * materialization happen downstream. The original `payload` is immutable; any human
 * edit is recorded separately on the KnowledgeReview.
 */
export interface KnowledgeObservation {
  readonly id: KnowledgeObservationId;
  readonly ownerId: OwnerId;
  readonly observationType: ObservationType;
  readonly payload: ObservationPayload;
  readonly evidence: ObservationEvidence;
  readonly confidence: Confidence | null;
  readonly createdBy: ObservationOrigin;
  readonly status: ObservationStatus;
  readonly createdAt: Date;
  readonly lockVersion: number;
}

export interface CreateKnowledgeObservationInput {
  readonly id: KnowledgeObservationId;
  readonly ownerId: OwnerId;
  readonly observationType: ObservationType;
  readonly payload: ObservationPayload;
  readonly evidence: ObservationEvidence;
  readonly createdBy: ObservationOrigin;
  /** Extraction confidence. Optional — manual observations need not carry one. */
  readonly confidence?: number | null;
  readonly now: Date;
}

export function createKnowledgeObservation(
  input: CreateKnowledgeObservationInput,
): Result<KnowledgeObservation, DomainError> {
  if (!ORIGINS.includes(input.createdBy)) {
    return err(new InvalidValueError(`Invalid observation origin: "${input.createdBy}"`));
  }
  if (input.observationType !== input.payload.kind) {
    return err(
      new InvalidValueError(
        `Observation type "${input.observationType}" does not match payload kind "${input.payload.kind}"`,
      ),
    );
  }
  const payload = validateObservationPayload(input.payload);
  if (!payload.ok) return payload;

  let confidence: Confidence | null = null;
  if (input.confidence != null) {
    const made = makeConfidence(input.confidence);
    if (!made.ok) return made;
    confidence = made.value;
  }

  return ok({
    id: input.id,
    ownerId: input.ownerId,
    observationType: input.observationType,
    payload: payload.value,
    evidence: input.evidence,
    confidence,
    createdBy: input.createdBy,
    status: "PENDING_REVIEW",
    createdAt: input.now,
    lockVersion: 1,
  });
}
