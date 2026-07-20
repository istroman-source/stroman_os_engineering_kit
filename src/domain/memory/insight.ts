import { err, ok, type Result } from "@/lib/result";
import type { OwnerId } from "@/domain/project";
import {
  type Confidence,
  type DomainError,
  InvalidValueError,
  makeConfidence,
  validateBoundedText,
} from "@/domain/shared";
import type { InsightId, MemoryId } from "./ids";
import { optionalBounded } from "./source";

/**
 * A higher-order conclusion derived from memories. The core invariant: an insight
 * MUST cite at least one memory (its traceable evidence), and it carries a
 * confidence plus optional free-text evidence/reasoning.
 */
export interface Insight {
  readonly id: InsightId;
  readonly ownerId: OwnerId;
  readonly statement: string;
  readonly confidence: Confidence;
  readonly evidence: string | null;
  readonly memoryIds: readonly MemoryId[];
  readonly createdAt: Date;
}

export interface CreateInsightInput {
  readonly id: InsightId;
  readonly ownerId: OwnerId;
  readonly statement: string;
  readonly confidence: number;
  readonly evidence?: string | null;
  readonly memoryIds: readonly MemoryId[];
  readonly now: Date;
}

export function createInsight(input: CreateInsightInput): Result<Insight, DomainError> {
  const statement = validateBoundedText(input.statement, { label: "Insight statement", max: 2000 });
  if (!statement.ok) return statement;

  const confidence = makeConfidence(input.confidence);
  if (!confidence.ok) return confidence;

  const evidence = optionalBounded(input.evidence, "Insight evidence", 5000);
  if (!evidence.ok) return evidence;

  const memoryIds = [...new Set(input.memoryIds)];
  if (memoryIds.length < 1) {
    return err(new InvalidValueError("An insight must reference at least one memory"));
  }

  return ok({
    id: input.id,
    ownerId: input.ownerId,
    statement: statement.value,
    confidence: confidence.value,
    evidence: evidence.value,
    memoryIds,
    createdAt: input.now,
  });
}
