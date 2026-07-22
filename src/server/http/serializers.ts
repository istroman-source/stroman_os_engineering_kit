import type { ContentItemView } from "@/application/content";
import type { AnalysisView } from "@/application/creative";
import type { DecisionView } from "@/application/decision";
import type { EvaluationView, RubricView } from "@/application/evaluation";
import type {
  EntityKnowledgeView,
  EntityView,
  InsightView,
  MemoryView,
  RelationshipView,
  SourceView,
} from "@/application/memory";
import type { ProjectView } from "@/application/project";
import type {
  AcquisitionRunView,
  KnowledgeObservationView,
  KnowledgeReviewView,
  KnowledgeSourceView,
  MaterializationView,
  SourceDocumentView,
} from "@/application/knowledge-acquisition";

/**
 * Explicit HTTP serializers. Views are converted to plain JSON-safe objects with
 * ISO-8601 UTC timestamps and stable field names. `lockVersion` is deliberately
 * omitted from bodies — it is exposed only as the ETag concurrency token.
 */
const iso = (date: Date): string => date.toISOString();

export function serializeProject(view: ProjectView) {
  return {
    id: view.id,
    name: view.name,
    status: view.status,
    createdAt: iso(view.createdAt),
    updatedAt: iso(view.updatedAt),
  };
}

export function serializeContent(view: ContentItemView) {
  return {
    id: view.id,
    type: view.type,
    slug: view.slug,
    title: view.title,
    status: view.status,
    version: view.version,
    createdAt: iso(view.createdAt),
    updatedAt: iso(view.updatedAt),
  };
}

export function serializeRubric(view: RubricView) {
  return {
    id: view.id,
    slug: view.slug,
    title: view.title,
    criteria: view.criteria.map((criterion) => ({
      id: criterion.id,
      name: criterion.name,
      weight: criterion.weight,
      anchors: {
        one: criterion.anchors.one,
        five: criterion.anchors.five,
        ten: criterion.anchors.ten,
      },
    })),
  };
}

export function serializeEvaluation(view: EvaluationView) {
  return {
    id: view.id,
    projectId: view.projectId,
    rubricId: view.rubricId,
    reviewerType: view.reviewerType,
    reviewerId: view.reviewerId,
    scores: view.scores.map((score) => ({
      criterionId: score.criterionId,
      score: score.score,
      justification: score.justification,
    })),
    createdAt: iso(view.createdAt),
  };
}

export function serializeDecision(view: DecisionView) {
  return {
    id: view.id,
    projectId: view.projectId,
    question: view.question,
    options: view.options.map((option) => ({
      id: option.id,
      label: option.label,
      rationale: option.rationale,
    })),
    advisory: view.advisory
      ? {
          recommendedOptionId: view.advisory.recommendedOptionId,
          rationale: view.advisory.rationale,
          confidence: view.advisory.confidence,
          evidence: view.advisory.evidence.map((entry) => ({
            sourceLabel: entry.sourceLabel,
            observation: entry.observation,
            relevance: entry.relevance,
          })),
        }
      : null,
    status: view.status,
    selectedOptionId: view.selectedOptionId,
    decidedBy: view.decidedBy,
    decisionRationale: view.decisionRationale,
    createdAt: iso(view.createdAt),
    decidedAt: view.decidedAt ? iso(view.decidedAt) : null,
  };
}

export function serializeAnalysis(view: AnalysisView) {
  const b = view.brief;
  return {
    brief: {
      id: b.id,
      projectId: b.projectId,
      title: b.title,
      client: b.client,
      projectType: b.projectType,
      creativeGoal: b.creativeGoal,
      targetAudience: b.targetAudience,
      desiredEmotion: b.desiredEmotion,
      context: b.context,
      createdAt: iso(b.createdAt),
      updatedAt: iso(b.updatedAt),
    },
    // The blueprint is pure JSON-safe data (strings/arrays) — passed through as-is.
    blueprint: view.blueprint,
  };
}

// ── Memory Engine serializers ────────────────────────────────────────────────

export function serializeEntity(view: EntityView) {
  return { id: view.id, name: view.name, kind: view.kind, createdAt: iso(view.createdAt) };
}

export function serializeSource(view: SourceView) {
  return {
    id: view.id,
    label: view.label,
    sourceType: view.sourceType,
    url: view.url,
    detail: view.detail,
    createdAt: iso(view.createdAt),
  };
}

export function serializeMemory(view: MemoryView) {
  return {
    id: view.id,
    entityId: view.entityId,
    sourceId: view.sourceId,
    content: view.content,
    createdAt: iso(view.createdAt),
  };
}

export function serializeRelationship(view: RelationshipView) {
  return {
    id: view.id,
    fromEntityId: view.fromEntityId,
    toEntityId: view.toEntityId,
    relationType: view.relationType,
    createdAt: iso(view.createdAt),
  };
}

export function serializeInsight(view: InsightView) {
  return {
    id: view.id,
    statement: view.statement,
    confidence: view.confidence,
    evidence: view.evidence,
    memoryIds: view.memoryIds,
    createdAt: iso(view.createdAt),
  };
}

export function serializeEntityKnowledge(view: EntityKnowledgeView) {
  return {
    entity: serializeEntity(view.entity),
    memories: view.memories.map((m) => ({
      memory: serializeMemory(m.memory),
      source: m.source ? serializeSource(m.source) : null,
    })),
    relationships: view.relationships.map((r) => ({
      relationship: serializeRelationship(r.relationship),
      direction: r.direction,
      otherEntity: r.otherEntity ? serializeEntity(r.otherEntity) : null,
    })),
    insights: view.insights.map((i) => ({
      insight: serializeInsight(i.insight),
      citedMemories: i.citedMemories.map(serializeMemory),
    })),
  };
}

// ── Knowledge Acquisition serializers ──────────────────────────────────────
export function serializeKnowledgeSource(view: KnowledgeSourceView) {
  return {
    id: view.id,
    name: view.name,
    sourceType: view.sourceType,
    origin: view.origin,
    sourceReliability: view.sourceReliability,
    status: view.status,
    createdAt: iso(view.createdAt),
  };
}

export function serializeSourceDocument(view: SourceDocumentView) {
  return {
    id: view.id,
    knowledgeSourceId: view.knowledgeSourceId,
    documentType: view.documentType,
    contentHash: view.contentHash,
    title: view.title,
    mediaType: view.mediaType,
    byteSize: view.byteSize,
    createdAt: iso(view.createdAt),
  };
}

export function serializeAcquisitionRun(view: AcquisitionRunView) {
  return {
    id: view.id,
    knowledgeSourceId: view.knowledgeSourceId,
    extractor: view.extractor,
    extractorVersion: view.extractorVersion,
    status: view.status,
    startedAt: view.startedAt ? iso(view.startedAt) : null,
    finishedAt: view.finishedAt ? iso(view.finishedAt) : null,
    summary: view.summary
      ? {
          documentsProcessed: view.summary.documentsProcessed,
          observationsCreated: view.summary.observationsCreated,
          failureCount: view.summary.failureCount,
        }
      : null,
    createdAt: iso(view.createdAt),
  };
}

function serializeExtractionLocation(location: KnowledgeObservationView["evidence"]["location"]) {
  return location
    ? {
        textSpan: location.textSpan,
        charStart: location.charStart,
        charEnd: location.charEnd,
        timeStartMs: location.timeStartMs,
        timeEndMs: location.timeEndMs,
        pageNumber: location.pageNumber,
      }
    : null;
}

export function serializeKnowledgeObservation(view: KnowledgeObservationView) {
  return {
    id: view.id,
    observationType: view.observationType,
    payload: view.payload,
    evidence: {
      sourceDocumentId: view.evidence.sourceDocumentId,
      knowledgeSourceId: view.evidence.knowledgeSourceId,
      acquisitionRunId: view.evidence.acquisitionRunId,
      location: serializeExtractionLocation(view.evidence.location),
    },
    confidence: view.confidence,
    createdBy: view.createdBy,
    status: view.status,
    createdAt: iso(view.createdAt),
  };
}

export function serializeKnowledgeReview(view: KnowledgeReviewView) {
  return {
    id: view.id,
    knowledgeObservationId: view.knowledgeObservationId,
    outcome: view.outcome,
    reviewerId: view.reviewerId,
    note: view.note,
    editedPayload: view.editedPayload,
    reviewedAt: iso(view.reviewedAt),
    createdAt: iso(view.createdAt),
  };
}

export function serializeObservationWithReview(view: {
  observation: KnowledgeObservationView;
  review: KnowledgeReviewView | null;
}) {
  return {
    observation: serializeKnowledgeObservation(view.observation),
    review: view.review ? serializeKnowledgeReview(view.review) : null,
  };
}

export function serializeMaterialization(view: MaterializationView) {
  return {
    knowledgeObservationId: view.knowledgeObservationId,
    knowledgeReviewId: view.knowledgeReviewId,
    record: { recordType: view.record.recordType, recordId: view.record.recordId },
    createdAt: iso(view.createdAt),
  };
}
