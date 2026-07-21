import { err, ok, type Result } from "@/lib/result";
import type { OwnerId } from "@/domain/project";
import {
  defineStateMachine,
  type DomainError,
  InvalidStateTransitionError,
  InvalidValueError,
  validateBoundedText,
} from "@/domain/shared";
import type { KnowledgeSourceId } from "./ids";

/** The kind of origin a source represents. External platforms are future adapters, not enum values. */
export type SourceType = "UPLOAD" | "WEB_PAGE" | "MANUAL";
const SOURCE_TYPES: readonly SourceType[] = ["UPLOAD", "WEB_PAGE", "MANUAL"];

/**
 * How trustworthy a source's content is. Feeds Story Context later. VERIFIED is
 * stronger than HIGH — e.g. a verified interview transcript vs. an ordinary
 * high-quality source.
 */
export type SourceReliability = "VERIFIED" | "HIGH" | "MEDIUM" | "LOW" | "UNKNOWN";
const RELIABILITIES: readonly SourceReliability[] = [
  "VERIFIED",
  "HIGH",
  "MEDIUM",
  "LOW",
  "UNKNOWN",
];

export type KnowledgeSourceStatus = "ACTIVE" | "PAUSED" | "ARCHIVED";

export const knowledgeSourceLifecycle = defineStateMachine<KnowledgeSourceStatus>({
  ACTIVE: ["PAUSED", "ARCHIVED"],
  PAUSED: ["ACTIVE", "ARCHIVED"],
  ARCHIVED: [],
});

/**
 * A configured origin of knowledge for an owner (an upload channel, a web page, or
 * a manual-entry channel). Aggregate root; owner-scoped. Feeds documents, which
 * feed observations. Mutable lifecycle guarded by optimistic concurrency.
 */
export interface KnowledgeSource {
  readonly id: KnowledgeSourceId;
  readonly ownerId: OwnerId;
  readonly name: string;
  readonly sourceType: SourceType;
  readonly origin: string | null;
  readonly sourceReliability: SourceReliability;
  readonly status: KnowledgeSourceStatus;
  readonly createdAt: Date;
  readonly lockVersion: number;
}

export interface CreateKnowledgeSourceInput {
  readonly id: KnowledgeSourceId;
  readonly ownerId: OwnerId;
  readonly name: string;
  readonly sourceType: SourceType;
  readonly origin?: string | null;
  readonly sourceReliability: SourceReliability;
  readonly now: Date;
}

export function createKnowledgeSource(
  input: CreateKnowledgeSourceInput,
): Result<KnowledgeSource, DomainError> {
  const name = validateBoundedText(input.name, { label: "Knowledge source name", max: 200 });
  if (!name.ok) return name;
  if (!SOURCE_TYPES.includes(input.sourceType)) {
    return err(new InvalidValueError(`Invalid source type: "${input.sourceType}"`));
  }
  if (!RELIABILITIES.includes(input.sourceReliability)) {
    return err(new InvalidValueError(`Invalid source reliability: "${input.sourceReliability}"`));
  }
  let origin: string | null = null;
  if (input.origin != null && input.origin.trim() !== "") {
    const validated = validateBoundedText(input.origin, { label: "Source origin", max: 2000 });
    if (!validated.ok) return validated;
    origin = validated.value;
  }

  return ok({
    id: input.id,
    ownerId: input.ownerId,
    name: name.value,
    sourceType: input.sourceType,
    origin,
    sourceReliability: input.sourceReliability,
    status: "ACTIVE",
    createdAt: input.now,
    lockVersion: 1,
  });
}

function transition(
  source: KnowledgeSource,
  allowedFrom: readonly KnowledgeSourceStatus[],
  to: KnowledgeSourceStatus,
): Result<KnowledgeSource, DomainError> {
  if (!allowedFrom.includes(source.status)) {
    return err(new InvalidStateTransitionError("KnowledgeSource", source.status, to));
  }
  const asserted = knowledgeSourceLifecycle.assert("KnowledgeSource", source.status, to);
  if (!asserted.ok) return asserted;
  return ok({ ...source, status: to, lockVersion: source.lockVersion + 1 });
}

/** Pause acquisition from an active source. */
export function pauseSource(source: KnowledgeSource): Result<KnowledgeSource, DomainError> {
  return transition(source, ["ACTIVE"], "PAUSED");
}

/** Resume acquisition from a paused source. */
export function resumeSource(source: KnowledgeSource): Result<KnowledgeSource, DomainError> {
  return transition(source, ["PAUSED"], "ACTIVE");
}

/** Retire a source (terminal). */
export function archiveSource(source: KnowledgeSource): Result<KnowledgeSource, DomainError> {
  return transition(source, ["ACTIVE", "PAUSED"], "ARCHIVED");
}
