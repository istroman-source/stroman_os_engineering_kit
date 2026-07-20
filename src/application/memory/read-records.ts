import { ok, type Result } from "@/lib/result";
import {
  EntityId,
  type EntityRepository,
  type InsightRepository,
  MemoryId,
  type MemoryRecord,
  type MemoryRepository,
  type RelationshipRepository,
  SourceId,
  type SourceRepository,
} from "@/domain/memory";
import type { OwnerId } from "@/domain/project";
import type { InvalidValueError } from "@/domain/shared";
import { attempt } from "../shared/attempt";
import { NotAuthorizedError, NotFoundError, type RepositoryError } from "../shared/errors";
import { loadOwnedEntity, loadOwnedMemory, loadOwnedSource } from "./record-access";
import {
  type EntityKnowledgeView,
  type EntityView,
  type InsightView,
  type MemoryView,
  type RelationshipView,
  type SourceView,
  toEntityView,
  toInsightView,
  toMemoryView,
  toRelationshipView,
  toSourceView,
} from "./memory-view";

type Owned<V> = Result<V, InvalidValueError | NotFoundError | NotAuthorizedError | RepositoryError>;

export async function listEntities(
  deps: { entities: EntityRepository },
  input: { actorId: OwnerId },
): Promise<Result<readonly EntityView[], RepositoryError>> {
  const listed = await attempt("entity.listByOwner", () =>
    deps.entities.listByOwner(input.actorId),
  );
  if (!listed.ok) return listed;
  return ok(listed.value.map(toEntityView));
}

export async function listSources(
  deps: { sources: SourceRepository },
  input: { actorId: OwnerId },
): Promise<Result<readonly SourceView[], RepositoryError>> {
  const listed = await attempt("source.listByOwner", () => deps.sources.listByOwner(input.actorId));
  if (!listed.ok) return listed;
  return ok(listed.value.map(toSourceView));
}

export async function listMemoriesByEntity(
  deps: { entities: EntityRepository; memories: MemoryRepository },
  input: { actorId: OwnerId; entityId: string },
): Promise<Owned<readonly MemoryView[]>> {
  const entityId = EntityId.parse(input.entityId);
  if (!entityId.ok) return entityId;
  const entity = await loadOwnedEntity(deps.entities, input.actorId, entityId.value, "memory.list");
  if (!entity.ok) return entity;
  const listed = await attempt("memory.listByEntity", () =>
    deps.memories.listByEntity(entityId.value),
  );
  if (!listed.ok) return listed;
  return ok(listed.value.map(toMemoryView));
}

export async function listMemoriesBySource(
  deps: { sources: SourceRepository; memories: MemoryRepository },
  input: { actorId: OwnerId; sourceId: string },
): Promise<Owned<readonly MemoryView[]>> {
  const sourceId = SourceId.parse(input.sourceId);
  if (!sourceId.ok) return sourceId;
  const source = await loadOwnedSource(deps.sources, input.actorId, sourceId.value, "memory.list");
  if (!source.ok) return source;
  const listed = await attempt("memory.listBySource", () =>
    deps.memories.listBySource(sourceId.value),
  );
  if (!listed.ok) return listed;
  return ok(listed.value.map(toMemoryView));
}

export async function listRelationshipsByEntity(
  deps: { entities: EntityRepository; relationships: RelationshipRepository },
  input: { actorId: OwnerId; entityId: string },
): Promise<Owned<readonly RelationshipView[]>> {
  const entityId = EntityId.parse(input.entityId);
  if (!entityId.ok) return entityId;
  const entity = await loadOwnedEntity(
    deps.entities,
    input.actorId,
    entityId.value,
    "relationship.list",
  );
  if (!entity.ok) return entity;
  const listed = await attempt("relationship.listByEntity", () =>
    deps.relationships.listByEntity(entityId.value),
  );
  if (!listed.ok) return listed;
  return ok(listed.value.map(toRelationshipView));
}

export async function listInsightsByMemory(
  deps: { memories: MemoryRepository; insights: InsightRepository },
  input: { actorId: OwnerId; memoryId: string },
): Promise<Owned<readonly InsightView[]>> {
  const memoryId = MemoryId.parse(input.memoryId);
  if (!memoryId.ok) return memoryId;
  const memory = await loadOwnedMemory(
    deps.memories,
    input.actorId,
    memoryId.value,
    "insight.list",
  );
  if (!memory.ok) return memory;
  const listed = await attempt("insight.listByMemory", () =>
    deps.insights.listByMemory(memoryId.value),
  );
  if (!listed.ok) return listed;
  return ok(listed.value.map(toInsightView));
}

export interface EntityKnowledgeDeps {
  readonly entities: EntityRepository;
  readonly memories: MemoryRepository;
  readonly sources: SourceRepository;
  readonly relationships: RelationshipRepository;
  readonly insights: InsightRepository;
}

/**
 * All knowledge about an entity: its memories (each with its source), its
 * relationships (with the other entity), and insights derived from its memories
 * (each with confidence, evidence, and the exact memories it cites). This is the
 * traceable retrieval the acceptance test exercises.
 */
export async function getEntityKnowledge(
  deps: EntityKnowledgeDeps,
  input: { actorId: OwnerId; entityId: string },
): Promise<Owned<EntityKnowledgeView>> {
  const entityId = EntityId.parse(input.entityId);
  if (!entityId.ok) return entityId;
  const entity = await loadOwnedEntity(
    deps.entities,
    input.actorId,
    entityId.value,
    "knowledge.get",
  );
  if (!entity.ok) return entity;

  const memoriesLoad = await attempt("memory.listByEntity", () =>
    deps.memories.listByEntity(entityId.value),
  );
  if (!memoriesLoad.ok) return memoriesLoad;
  const relationshipsLoad = await attempt("relationship.listByEntity", () =>
    deps.relationships.listByEntity(entityId.value),
  );
  if (!relationshipsLoad.ok) return relationshipsLoad;
  const sourcesLoad = await attempt("source.listByOwner", () =>
    deps.sources.listByOwner(input.actorId),
  );
  if (!sourcesLoad.ok) return sourcesLoad;
  const entitiesLoad = await attempt("entity.listByOwner", () =>
    deps.entities.listByOwner(input.actorId),
  );
  if (!entitiesLoad.ok) return entitiesLoad;

  const memories = memoriesLoad.value;
  const memoryIds = memories.map((m) => m.id);
  const insightsLoad = await attempt("insight.listByMemoryIds", () =>
    deps.insights.listByMemoryIds(memoryIds),
  );
  if (!insightsLoad.ok) return insightsLoad;

  const sourceMap = new Map(sourcesLoad.value.map((s) => [s.id, s]));
  const entityMap = new Map(entitiesLoad.value.map((e) => [e.id, e]));
  const memoryMap = new Map<string, MemoryRecord>(memories.map((m) => [m.id, m]));

  // An insight may cite memories belonging to other entities; load any missing.
  for (const insight of insightsLoad.value) {
    for (const id of insight.memoryIds) {
      if (!memoryMap.has(id)) {
        const extra = await attempt("memory.findById", () => deps.memories.findById(id));
        if (!extra.ok) return extra;
        if (extra.value) memoryMap.set(id, extra.value);
      }
    }
  }

  return ok({
    entity: toEntityView(entity.value),
    memories: memories.map((memory) => {
      const source = memory.sourceId ? (sourceMap.get(memory.sourceId) ?? null) : null;
      return { memory: toMemoryView(memory), source: source ? toSourceView(source) : null };
    }),
    relationships: relationshipsLoad.value.map((relationship) => {
      const outgoing = relationship.fromEntityId === entityId.value;
      const otherId = outgoing ? relationship.toEntityId : relationship.fromEntityId;
      const other = entityMap.get(otherId);
      return {
        relationship: toRelationshipView(relationship),
        direction: outgoing ? ("outgoing" as const) : ("incoming" as const),
        otherEntity: other ? toEntityView(other) : null,
      };
    }),
    insights: insightsLoad.value.map((insight) => ({
      insight: toInsightView(insight),
      citedMemories: insight.memoryIds
        .map((id) => memoryMap.get(id))
        .filter((m): m is MemoryRecord => m !== undefined)
        .map(toMemoryView),
    })),
  });
}
