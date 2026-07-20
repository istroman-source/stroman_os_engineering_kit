import { ok, type Result } from "@/lib/result";
import {
  createEntity as createEntityAggregate,
  createInsight as createInsightAggregate,
  createMemory as createMemoryAggregate,
  createRelationship as createRelationshipAggregate,
  createSource as createSourceAggregate,
  EntityId,
  type EntityRepository,
  InsightId,
  type InsightRepository,
  MemoryId,
  type MemoryRepository,
  RelationshipId,
  type RelationshipRepository,
  SourceId,
  type SourceRepository,
} from "@/domain/memory";
import type { OwnerId } from "@/domain/project";
import type { DomainError } from "@/domain/shared";
import { attempt } from "../shared/attempt";
import type { Clock, IdGenerator } from "../shared";
import { NotAuthorizedError, NotFoundError, type RepositoryError } from "../shared/errors";
import { loadOwnedEntity, loadOwnedMemory, loadOwnedSource } from "./record-access";
import {
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

type CreateResult<V> = Result<
  V,
  DomainError | NotFoundError | NotAuthorizedError | RepositoryError
>;

export interface CreateEntityDeps {
  readonly entities: EntityRepository;
  readonly ids: IdGenerator;
  readonly clock: Clock;
}
export interface CreateEntityInput {
  readonly actorId: OwnerId;
  readonly name: string;
  readonly kind: string;
}
export async function createEntity(
  deps: CreateEntityDeps,
  input: CreateEntityInput,
): Promise<CreateResult<EntityView>> {
  const entity = createEntityAggregate({
    id: EntityId.unsafe(deps.ids.generate(EntityId.prefix)),
    ownerId: input.actorId,
    name: input.name,
    kind: input.kind,
    now: deps.clock.now(),
  });
  if (!entity.ok) return entity;
  const saved = await attempt("entity.insert", () => deps.entities.insert(entity.value));
  if (!saved.ok) return saved;
  return ok(toEntityView(entity.value));
}

export interface CreateSourceDeps {
  readonly sources: SourceRepository;
  readonly ids: IdGenerator;
  readonly clock: Clock;
}
export interface CreateSourceInput {
  readonly actorId: OwnerId;
  readonly label: string;
  readonly sourceType: string;
  readonly url?: string | null;
  readonly detail?: string | null;
}
export async function createSource(
  deps: CreateSourceDeps,
  input: CreateSourceInput,
): Promise<CreateResult<SourceView>> {
  const source = createSourceAggregate({
    id: SourceId.unsafe(deps.ids.generate(SourceId.prefix)),
    ownerId: input.actorId,
    label: input.label,
    sourceType: input.sourceType,
    url: input.url,
    detail: input.detail,
    now: deps.clock.now(),
  });
  if (!source.ok) return source;
  const saved = await attempt("source.insert", () => deps.sources.insert(source.value));
  if (!saved.ok) return saved;
  return ok(toSourceView(source.value));
}

export interface CreateMemoryDeps {
  readonly entities: EntityRepository;
  readonly sources: SourceRepository;
  readonly memories: MemoryRepository;
  readonly ids: IdGenerator;
  readonly clock: Clock;
}
export interface CreateMemoryInput {
  readonly actorId: OwnerId;
  readonly entityId: string;
  readonly sourceId?: string | null;
  readonly content: string;
}
export async function createMemory(
  deps: CreateMemoryDeps,
  input: CreateMemoryInput,
): Promise<CreateResult<MemoryView>> {
  const entityId = EntityId.parse(input.entityId);
  if (!entityId.ok) return entityId;
  const entity = await loadOwnedEntity(
    deps.entities,
    input.actorId,
    entityId.value,
    "memory.create",
  );
  if (!entity.ok) return entity;

  let sourceId: SourceId | null = null;
  if (input.sourceId != null && input.sourceId !== "") {
    const parsed = SourceId.parse(input.sourceId);
    if (!parsed.ok) return parsed;
    const source = await loadOwnedSource(
      deps.sources,
      input.actorId,
      parsed.value,
      "memory.create",
    );
    if (!source.ok) return source;
    sourceId = parsed.value;
  }

  const memory = createMemoryAggregate({
    id: MemoryId.unsafe(deps.ids.generate(MemoryId.prefix)),
    ownerId: input.actorId,
    entityId: entityId.value,
    sourceId,
    content: input.content,
    now: deps.clock.now(),
  });
  if (!memory.ok) return memory;
  const saved = await attempt("memory.insert", () => deps.memories.insert(memory.value));
  if (!saved.ok) return saved;
  return ok(toMemoryView(memory.value));
}

export interface CreateRelationshipDeps {
  readonly entities: EntityRepository;
  readonly relationships: RelationshipRepository;
  readonly ids: IdGenerator;
  readonly clock: Clock;
}
export interface CreateRelationshipInput {
  readonly actorId: OwnerId;
  readonly fromEntityId: string;
  readonly toEntityId: string;
  readonly relationType: string;
}
export async function createRelationship(
  deps: CreateRelationshipDeps,
  input: CreateRelationshipInput,
): Promise<CreateResult<RelationshipView>> {
  const fromId = EntityId.parse(input.fromEntityId);
  if (!fromId.ok) return fromId;
  const toId = EntityId.parse(input.toEntityId);
  if (!toId.ok) return toId;
  const from = await loadOwnedEntity(
    deps.entities,
    input.actorId,
    fromId.value,
    "relationship.create",
  );
  if (!from.ok) return from;
  const to = await loadOwnedEntity(deps.entities, input.actorId, toId.value, "relationship.create");
  if (!to.ok) return to;

  const relationship = createRelationshipAggregate({
    id: RelationshipId.unsafe(deps.ids.generate(RelationshipId.prefix)),
    ownerId: input.actorId,
    fromEntityId: fromId.value,
    toEntityId: toId.value,
    relationType: input.relationType,
    now: deps.clock.now(),
  });
  if (!relationship.ok) return relationship;
  const saved = await attempt("relationship.insert", () =>
    deps.relationships.insert(relationship.value),
  );
  if (!saved.ok) return saved;
  return ok(toRelationshipView(relationship.value));
}

export interface CreateInsightDeps {
  readonly memories: MemoryRepository;
  readonly insights: InsightRepository;
  readonly ids: IdGenerator;
  readonly clock: Clock;
}
export interface CreateInsightInput {
  readonly actorId: OwnerId;
  readonly statement: string;
  readonly confidence: number;
  readonly evidence?: string | null;
  readonly memoryIds: readonly string[];
}
export async function createInsight(
  deps: CreateInsightDeps,
  input: CreateInsightInput,
): Promise<CreateResult<InsightView>> {
  const memoryIds: MemoryId[] = [];
  for (const raw of input.memoryIds) {
    const parsed = MemoryId.parse(raw);
    if (!parsed.ok) return parsed;
    memoryIds.push(parsed.value);
  }

  const insight = createInsightAggregate({
    id: InsightId.unsafe(deps.ids.generate(InsightId.prefix)),
    ownerId: input.actorId,
    statement: input.statement,
    confidence: input.confidence,
    evidence: input.evidence,
    memoryIds,
    now: deps.clock.now(),
  });
  if (!insight.ok) return insight;

  // Every cited memory must exist and belong to the actor (traceable + authorized).
  for (const memoryId of insight.value.memoryIds) {
    const owned = await loadOwnedMemory(deps.memories, input.actorId, memoryId, "insight.create");
    if (!owned.ok) return owned;
  }

  const saved = await attempt("insight.insert", () => deps.insights.insert(insight.value));
  if (!saved.ok) return saved;
  return ok(toInsightView(insight.value));
}
