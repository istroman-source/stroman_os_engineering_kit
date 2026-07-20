import { ok, type Result } from "@/lib/result";
import type { OwnerId } from "@/domain/project";
import { type DomainError, validateBoundedText } from "@/domain/shared";
import type { EntityId, MemoryId, SourceId } from "./ids";

/**
 * A discrete fact/observation about an entity. Optionally traceable to a source.
 * "Memory" is the product term; the type is `MemoryRecord` to avoid clashing with
 * the global `Memory` type.
 */
export interface MemoryRecord {
  readonly id: MemoryId;
  readonly ownerId: OwnerId;
  readonly entityId: EntityId;
  readonly sourceId: SourceId | null;
  readonly content: string;
  readonly createdAt: Date;
}

export interface CreateMemoryInput {
  readonly id: MemoryId;
  readonly ownerId: OwnerId;
  readonly entityId: EntityId;
  readonly sourceId?: SourceId | null;
  readonly content: string;
  readonly now: Date;
}

export function createMemory(input: CreateMemoryInput): Result<MemoryRecord, DomainError> {
  const content = validateBoundedText(input.content, { label: "Memory content", max: 5000 });
  if (!content.ok) return content;
  return ok({
    id: input.id,
    ownerId: input.ownerId,
    entityId: input.entityId,
    sourceId: input.sourceId ?? null,
    content: content.value,
    createdAt: input.now,
  });
}
