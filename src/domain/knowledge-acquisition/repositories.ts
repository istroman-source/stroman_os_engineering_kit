import type { OwnerId } from "@/domain/project";
import type { AcquisitionRun } from "./acquisition-run";
import type {
  AcquisitionRunId,
  KnowledgeObservationId,
  KnowledgeReviewId,
  KnowledgeSourceId,
  SourceDocumentId,
} from "./ids";
import type { KnowledgeObservation } from "./knowledge-observation";
import type { KnowledgeReview } from "./knowledge-review";
import type { KnowledgeSource } from "./knowledge-source";
import type { SourceDocument } from "./source-document";

/**
 * Persistence ports for the Knowledge Acquisition domain. Sources and runs are
 * mutable aggregates (lifecycle) with optimistic-concurrency `update`; documents
 * and reviews are append-only; observations are mutable only via review. Query
 * methods filter by natural key, used after the application has authorized access.
 */
export interface KnowledgeSourceRepository {
  insert(source: KnowledgeSource): Promise<void>;
  findById(id: KnowledgeSourceId): Promise<KnowledgeSource | null>;
  listByOwner(ownerId: OwnerId): Promise<readonly KnowledgeSource[]>;
  update(source: KnowledgeSource): Promise<void>;
}

export interface SourceDocumentRepository {
  insert(document: SourceDocument): Promise<void>;
  findById(id: SourceDocumentId): Promise<SourceDocument | null>;
  listBySource(knowledgeSourceId: KnowledgeSourceId): Promise<readonly SourceDocument[]>;
  /** Idempotency lookup: an existing document with this content in this source, if any. */
  findBySourceAndHash(
    knowledgeSourceId: KnowledgeSourceId,
    contentHash: string,
  ): Promise<SourceDocument | null>;
}

export interface AcquisitionRunRepository {
  insert(run: AcquisitionRun): Promise<void>;
  findById(id: AcquisitionRunId): Promise<AcquisitionRun | null>;
  listBySource(knowledgeSourceId: KnowledgeSourceId): Promise<readonly AcquisitionRun[]>;
  update(run: AcquisitionRun): Promise<void>;
}

export interface KnowledgeObservationRepository {
  insert(observation: KnowledgeObservation): Promise<void>;
  findById(id: KnowledgeObservationId): Promise<KnowledgeObservation | null>;
  /** By `evidence.sourceDocumentId`. */
  listByDocument(sourceDocumentId: SourceDocumentId): Promise<readonly KnowledgeObservation[]>;
  /** By `evidence.acquisitionRunId`. */
  listByRun(acquisitionRunId: AcquisitionRunId): Promise<readonly KnowledgeObservation[]>;
  update(observation: KnowledgeObservation): Promise<void>;
}

export interface KnowledgeReviewRepository {
  insert(review: KnowledgeReview): Promise<void>;
  findById(id: KnowledgeReviewId): Promise<KnowledgeReview | null>;
  findByObservation(
    knowledgeObservationId: KnowledgeObservationId,
  ): Promise<KnowledgeReview | null>;
}
