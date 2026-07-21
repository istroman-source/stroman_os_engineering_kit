import type {
  KnowledgeEngineRef,
  KnowledgeKind,
  KnowledgeObservationId,
  KnowledgeReviewId,
} from "@/domain/knowledge-acquisition";
import type { Entity, Insight, MemoryRecord, Relationship } from "@/domain/memory";
import type { OwnerId } from "@/domain/project";

export interface MaterializationLink {
  readonly ownerId: OwnerId;
  readonly knowledgeObservationId: KnowledgeObservationId;
  readonly knowledgeReviewId: KnowledgeReviewId;
  readonly record: KnowledgeEngineRef;
  readonly createdAt: Date;
}
export type MaterializedRecord =
  | { readonly kind: "ENTITY"; readonly entity: Entity }
  | { readonly kind: "MEMORY"; readonly memory: MemoryRecord }
  | { readonly kind: "INSIGHT"; readonly insight: Insight }
  | { readonly kind: "RELATIONSHIP"; readonly relationship: Relationship };
export interface MaterializationRepository {
  findByObservation(id: KnowledgeObservationId): Promise<readonly MaterializationLink[]>;
  findByRecord(
    recordType: KnowledgeKind,
    recordId: string,
  ): Promise<readonly MaterializationLink[]>;
  materialize(record: MaterializedRecord, link: MaterializationLink): Promise<void>;
}
