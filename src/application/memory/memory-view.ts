import type {
  Entity,
  EntityId,
  Insight,
  InsightId,
  MemoryId,
  MemoryRecord,
  Relationship,
  RelationshipId,
  Source,
  SourceId,
} from "@/domain/memory";

export interface EntityView {
  readonly id: EntityId;
  readonly name: string;
  readonly kind: string;
  readonly createdAt: Date;
}

export interface SourceView {
  readonly id: SourceId;
  readonly label: string;
  readonly sourceType: string;
  readonly url: string | null;
  readonly detail: string | null;
  readonly createdAt: Date;
}

export interface MemoryView {
  readonly id: MemoryId;
  readonly entityId: EntityId;
  readonly sourceId: SourceId | null;
  readonly content: string;
  readonly createdAt: Date;
}

export interface RelationshipView {
  readonly id: RelationshipId;
  readonly fromEntityId: EntityId;
  readonly toEntityId: EntityId;
  readonly relationType: string;
  readonly createdAt: Date;
}

export interface InsightView {
  readonly id: InsightId;
  readonly statement: string;
  readonly confidence: number;
  readonly evidence: string | null;
  readonly memoryIds: readonly MemoryId[];
  readonly createdAt: Date;
}

/** Aggregate: everything known about an entity, with traceable sources + evidence. */
export interface EntityKnowledgeView {
  readonly entity: EntityView;
  readonly memories: ReadonlyArray<{ memory: MemoryView; source: SourceView | null }>;
  readonly relationships: ReadonlyArray<{
    relationship: RelationshipView;
    direction: "outgoing" | "incoming";
    otherEntity: EntityView | null;
  }>;
  readonly insights: ReadonlyArray<{ insight: InsightView; citedMemories: readonly MemoryView[] }>;
}

export const toEntityView = (e: Entity): EntityView => ({
  id: e.id,
  name: e.name,
  kind: e.kind,
  createdAt: e.createdAt,
});

export const toSourceView = (s: Source): SourceView => ({
  id: s.id,
  label: s.label,
  sourceType: s.sourceType,
  url: s.url,
  detail: s.detail,
  createdAt: s.createdAt,
});

export const toMemoryView = (m: MemoryRecord): MemoryView => ({
  id: m.id,
  entityId: m.entityId,
  sourceId: m.sourceId,
  content: m.content,
  createdAt: m.createdAt,
});

export const toRelationshipView = (r: Relationship): RelationshipView => ({
  id: r.id,
  fromEntityId: r.fromEntityId,
  toEntityId: r.toEntityId,
  relationType: r.relationType,
  createdAt: r.createdAt,
});

export const toInsightView = (i: Insight): InsightView => ({
  id: i.id,
  statement: i.statement,
  confidence: i.confidence,
  evidence: i.evidence,
  memoryIds: i.memoryIds,
  createdAt: i.createdAt,
});
