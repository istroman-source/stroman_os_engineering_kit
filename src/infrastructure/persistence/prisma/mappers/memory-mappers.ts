import type {
  Entity as EntityRow,
  Memory as MemoryRow,
  Prisma,
  Relationship as RelationshipRow,
  Source as SourceRow,
} from "@prisma/client";
import {
  type Entity,
  EntityId,
  type Insight,
  InsightId,
  type MemoryRecord,
  MemoryId,
  type Relationship,
  RelationshipId,
  type Source,
  SourceId,
} from "@/domain/memory";
import { OwnerId } from "@/domain/project";
import { makeConfidence } from "@/domain/shared";
import { orThrowMapping } from "./shared";

const ownerOf = (raw: string): OwnerId => orThrowMapping(OwnerId.parse(raw), `owner_id="${raw}"`);

export function toEntity(row: EntityRow): Entity {
  return {
    id: orThrowMapping(EntityId.parse(row.id), `entity.id="${row.id}"`),
    ownerId: ownerOf(row.ownerId),
    name: row.name,
    kind: row.kind,
    createdAt: row.createdAt,
  };
}

export function toEntityFields(entity: Entity): Prisma.EntityCreateManyInput {
  return {
    id: entity.id,
    ownerId: entity.ownerId,
    name: entity.name,
    kind: entity.kind,
    createdAt: entity.createdAt,
  };
}

export function toSource(row: SourceRow): Source {
  return {
    id: orThrowMapping(SourceId.parse(row.id), `source.id="${row.id}"`),
    ownerId: ownerOf(row.ownerId),
    label: row.label,
    sourceType: row.sourceType,
    url: row.url,
    detail: row.detail,
    createdAt: row.createdAt,
  };
}

export function toSourceFields(source: Source): Prisma.SourceCreateManyInput {
  return {
    id: source.id,
    ownerId: source.ownerId,
    label: source.label,
    sourceType: source.sourceType,
    url: source.url,
    detail: source.detail,
    createdAt: source.createdAt,
  };
}

export function toMemory(row: MemoryRow): MemoryRecord {
  return {
    id: orThrowMapping(MemoryId.parse(row.id), `memory.id="${row.id}"`),
    ownerId: ownerOf(row.ownerId),
    entityId: orThrowMapping(EntityId.parse(row.entityId), `memory.entityId="${row.entityId}"`),
    sourceId:
      row.sourceId === null
        ? null
        : orThrowMapping(SourceId.parse(row.sourceId), `memory.sourceId="${row.sourceId}"`),
    content: row.content,
    createdAt: row.createdAt,
  };
}

export function toMemoryFields(memory: MemoryRecord): Prisma.MemoryCreateManyInput {
  return {
    id: memory.id,
    ownerId: memory.ownerId,
    entityId: memory.entityId,
    sourceId: memory.sourceId,
    content: memory.content,
    createdAt: memory.createdAt,
  };
}

export function toRelationship(row: RelationshipRow): Relationship {
  return {
    id: orThrowMapping(RelationshipId.parse(row.id), `relationship.id="${row.id}"`),
    ownerId: ownerOf(row.ownerId),
    fromEntityId: orThrowMapping(
      EntityId.parse(row.fromEntityId),
      `relationship.fromEntityId="${row.fromEntityId}"`,
    ),
    toEntityId: orThrowMapping(
      EntityId.parse(row.toEntityId),
      `relationship.toEntityId="${row.toEntityId}"`,
    ),
    relationType: row.relationType,
    createdAt: row.createdAt,
  };
}

export function toRelationshipFields(rel: Relationship): Prisma.RelationshipCreateManyInput {
  return {
    id: rel.id,
    ownerId: rel.ownerId,
    fromEntityId: rel.fromEntityId,
    toEntityId: rel.toEntityId,
    relationType: rel.relationType,
    createdAt: rel.createdAt,
  };
}

export type InsightRow = Prisma.InsightGetPayload<{ include: { memories: true } }>;

export function toInsight(row: InsightRow): Insight {
  return {
    id: orThrowMapping(InsightId.parse(row.id), `insight.id="${row.id}"`),
    ownerId: ownerOf(row.ownerId),
    statement: row.statement,
    confidence: orThrowMapping(
      makeConfidence(row.confidence),
      `insight.confidence=${row.confidence}`,
    ),
    evidence: row.evidence,
    memoryIds: row.memories.map((m) =>
      orThrowMapping(MemoryId.parse(m.memoryId), `insightMemory.memoryId="${m.memoryId}"`),
    ),
    createdAt: row.createdAt,
  };
}

export function toInsightFields(insight: Insight): Prisma.InsightCreateManyInput {
  return {
    id: insight.id,
    ownerId: insight.ownerId,
    statement: insight.statement,
    confidence: insight.confidence,
    evidence: insight.evidence,
    createdAt: insight.createdAt,
  };
}

export function toInsightMemoryRows(insight: Insight): Prisma.InsightMemoryCreateManyInput[] {
  return insight.memoryIds.map((memoryId) => ({ insightId: insight.id, memoryId }));
}
