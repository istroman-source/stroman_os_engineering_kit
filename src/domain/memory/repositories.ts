import type { OwnerId } from "@/domain/project";
import type { Entity } from "./entity";
import type { EntityId, InsightId, MemoryId, RelationshipId, SourceId } from "./ids";
import type { Insight } from "./insight";
import type { MemoryRecord } from "./memory-record";
import type { Relationship } from "./relationship";
import type { Source } from "./source";

/**
 * Persistence ports for the memory graph. Records are append-only (no update) and
 * deletable. Query methods are used only after the application has authorized the
 * owning entity/source, so they filter by the natural key, not by owner.
 */
export interface EntityRepository {
  insert(entity: Entity): Promise<void>;
  findById(id: EntityId): Promise<Entity | null>;
  listByOwner(ownerId: OwnerId): Promise<readonly Entity[]>;
  delete(id: EntityId): Promise<void>;
}

export interface SourceRepository {
  insert(source: Source): Promise<void>;
  findById(id: SourceId): Promise<Source | null>;
  listByOwner(ownerId: OwnerId): Promise<readonly Source[]>;
  delete(id: SourceId): Promise<void>;
}

export interface MemoryRepository {
  insert(memory: MemoryRecord): Promise<void>;
  findById(id: MemoryId): Promise<MemoryRecord | null>;
  listByEntity(entityId: EntityId): Promise<readonly MemoryRecord[]>;
  listBySource(sourceId: SourceId): Promise<readonly MemoryRecord[]>;
  delete(id: MemoryId): Promise<void>;
}

export interface RelationshipRepository {
  insert(relationship: Relationship): Promise<void>;
  findById(id: RelationshipId): Promise<Relationship | null>;
  /** Relationships where the entity is either endpoint. */
  listByEntity(entityId: EntityId): Promise<readonly Relationship[]>;
  delete(id: RelationshipId): Promise<void>;
}

export interface InsightRepository {
  /** Persists the insight and its memory references atomically. */
  insert(insight: Insight): Promise<void>;
  findById(id: InsightId): Promise<Insight | null>;
  listByMemory(memoryId: MemoryId): Promise<readonly Insight[]>;
  /** Insights that cite ANY of the given memories (deduplicated). */
  listByMemoryIds(memoryIds: readonly MemoryId[]): Promise<readonly Insight[]>;
  delete(id: InsightId): Promise<void>;
}
