import type {
  AcquisitionRun as AcquisitionRunRow,
  KnowledgeObservation as KnowledgeObservationRow,
  KnowledgeReview as KnowledgeReviewRow,
  KnowledgeSource as KnowledgeSourceRow,
  Prisma,
  SourceDocument as SourceDocumentRow,
} from "@prisma/client";
import {
  AcquisitionRunId,
  type AcquisitionRun,
  type AcquisitionRunStatus,
  KnowledgeObservationId,
  type KnowledgeObservation,
  KnowledgeReviewId,
  type KnowledgeReview,
  KnowledgeSourceId,
  type KnowledgeSource,
  makeExtractionLocation,
  makeObservationEvidence,
  SourceDocumentId,
  type SourceDocument,
  validateObservationPayload,
  type ObservationPayload,
} from "@/domain/knowledge-acquisition";
import { OwnerId } from "@/domain/project";
import { makeConfidence } from "@/domain/shared";
import { PersistenceMappingError } from "../errors";
import { orThrowMapping } from "./shared";

const ownerOf = (raw: string) => orThrowMapping(OwnerId.parse(raw), `owner_id="${raw}"`);
const PAYLOAD_KINDS = new Set(["ENTITY", "MEMORY", "INSIGHT", "RELATIONSHIP"]);
const payloadOf = (raw: Prisma.JsonValue, field: string): ObservationPayload => {
  if (
    typeof raw !== "object" ||
    raw === null ||
    Array.isArray(raw) ||
    typeof raw.kind !== "string" ||
    !PAYLOAD_KINDS.has(raw.kind)
  ) {
    throw new PersistenceMappingError(`${field}.kind is unknown`);
  }
  return orThrowMapping(validateObservationPayload(raw as ObservationPayload), field);
};

export function toKnowledgeSource(row: KnowledgeSourceRow): KnowledgeSource {
  return {
    id: orThrowMapping(KnowledgeSourceId.parse(row.id), `knowledgeSource.id="${row.id}"`),
    ownerId: ownerOf(row.ownerId),
    name: row.name,
    sourceType: row.sourceType,
    origin: row.origin,
    sourceReliability: row.sourceReliability,
    status: row.status,
    createdAt: row.createdAt,
    lockVersion: row.lockVersion,
  };
}
export function toKnowledgeSourceFields(
  v: KnowledgeSource,
): Prisma.KnowledgeSourceUncheckedCreateInput {
  return {
    id: v.id,
    ownerId: v.ownerId,
    name: v.name,
    sourceType: v.sourceType,
    origin: v.origin,
    sourceReliability: v.sourceReliability,
    status: v.status,
    createdAt: v.createdAt,
    lockVersion: v.lockVersion,
  };
}
export function toSourceDocument(row: SourceDocumentRow): SourceDocument {
  return {
    id: orThrowMapping(SourceDocumentId.parse(row.id), `sourceDocument.id="${row.id}"`),
    ownerId: ownerOf(row.ownerId),
    knowledgeSourceId: orThrowMapping(
      KnowledgeSourceId.parse(row.knowledgeSourceId),
      `sourceDocument.knowledgeSourceId`,
    ),
    documentType: row.documentType,
    contentHash: row.contentHash,
    title: row.title,
    mediaType: row.mediaType,
    byteSize: row.byteSize,
    createdAt: row.createdAt,
  };
}
export function toSourceDocumentFields(
  v: SourceDocument,
): Prisma.SourceDocumentUncheckedCreateInput {
  return { ...v };
}
export function toAcquisitionRun(row: AcquisitionRunRow): AcquisitionRun {
  const empty =
    row.documentsProcessed === null &&
    row.observationsCreated === null &&
    row.failureCount === null;
  return {
    id: orThrowMapping(AcquisitionRunId.parse(row.id), `acquisitionRun.id`),
    ownerId: ownerOf(row.ownerId),
    knowledgeSourceId: orThrowMapping(
      KnowledgeSourceId.parse(row.knowledgeSourceId),
      `acquisitionRun.knowledgeSourceId`,
    ),
    extractor: row.extractor,
    extractorVersion: row.extractorVersion,
    status: row.status as AcquisitionRunStatus,
    startedAt: row.startedAt,
    finishedAt: row.finishedAt,
    summary: empty
      ? null
      : {
          documentsProcessed: row.documentsProcessed!,
          observationsCreated: row.observationsCreated!,
          failureCount: row.failureCount!,
        },
    createdAt: row.createdAt,
    lockVersion: row.lockVersion,
  };
}
export function toAcquisitionRunFields(
  v: AcquisitionRun,
): Prisma.AcquisitionRunUncheckedCreateInput {
  return {
    id: v.id,
    ownerId: v.ownerId,
    knowledgeSourceId: v.knowledgeSourceId,
    extractor: v.extractor,
    extractorVersion: v.extractorVersion,
    status: v.status,
    startedAt: v.startedAt,
    finishedAt: v.finishedAt,
    documentsProcessed: v.summary?.documentsProcessed ?? null,
    observationsCreated: v.summary?.observationsCreated ?? null,
    failureCount: v.summary?.failureCount ?? null,
    createdAt: v.createdAt,
    lockVersion: v.lockVersion,
  };
}
export function toKnowledgeObservation(row: KnowledgeObservationRow): KnowledgeObservation {
  const payload = payloadOf(row.payload, "knowledgeObservation.payload");
  if (row.observationType !== payload.kind) {
    throw new PersistenceMappingError(
      "knowledgeObservation.observationType does not match payload.kind",
    );
  }
  const location =
    row.location === null
      ? null
      : orThrowMapping(
          makeExtractionLocation(row.location as object),
          "knowledgeObservation.location",
        );
  return {
    id: orThrowMapping(KnowledgeObservationId.parse(row.id), "knowledgeObservation.id"),
    ownerId: ownerOf(row.ownerId),
    observationType: row.observationType,
    payload,
    evidence: makeObservationEvidence({
      sourceDocumentId: orThrowMapping(
        SourceDocumentId.parse(row.sourceDocumentId),
        "knowledgeObservation.sourceDocumentId",
      ),
      knowledgeSourceId: orThrowMapping(
        KnowledgeSourceId.parse(row.knowledgeSourceId),
        "knowledgeObservation.knowledgeSourceId",
      ),
      acquisitionRunId:
        row.acquisitionRunId === null
          ? null
          : orThrowMapping(
              AcquisitionRunId.parse(row.acquisitionRunId),
              "knowledgeObservation.acquisitionRunId",
            ),
      location,
    }),
    confidence:
      row.confidence === null
        ? null
        : orThrowMapping(makeConfidence(row.confidence), "knowledgeObservation.confidence"),
    createdBy: row.createdBy,
    status: row.status,
    createdAt: row.createdAt,
    lockVersion: row.lockVersion,
  };
}
export function toKnowledgeObservationFields(
  v: KnowledgeObservation,
): Prisma.KnowledgeObservationUncheckedCreateInput {
  return {
    id: v.id,
    ownerId: v.ownerId,
    observationType: v.observationType,
    payload: v.payload,
    sourceDocumentId: v.evidence.sourceDocumentId,
    knowledgeSourceId: v.evidence.knowledgeSourceId,
    acquisitionRunId: v.evidence.acquisitionRunId,
    location: v.evidence.location
      ? (v.evidence.location as unknown as Prisma.InputJsonObject)
      : undefined,
    confidence: v.confidence,
    createdBy: v.createdBy,
    status: v.status,
    createdAt: v.createdAt,
    lockVersion: v.lockVersion,
  };
}
export function toKnowledgeReview(row: KnowledgeReviewRow): KnowledgeReview {
  return {
    id: orThrowMapping(KnowledgeReviewId.parse(row.id), "knowledgeReview.id"),
    ownerId: ownerOf(row.ownerId),
    knowledgeObservationId: orThrowMapping(
      KnowledgeObservationId.parse(row.knowledgeObservationId),
      "knowledgeReview.knowledgeObservationId",
    ),
    outcome: row.outcome,
    reviewerId: ownerOf(row.reviewerId),
    note: row.note,
    editedPayload:
      row.editedPayload === null
        ? null
        : payloadOf(row.editedPayload, "knowledgeReview.editedPayload"),
    reviewedAt: row.reviewedAt,
    createdAt: row.createdAt,
  };
}
export function toKnowledgeReviewFields(
  v: KnowledgeReview,
): Prisma.KnowledgeReviewUncheckedCreateInput {
  return {
    id: v.id,
    ownerId: v.ownerId,
    knowledgeObservationId: v.knowledgeObservationId,
    outcome: v.outcome,
    reviewerId: v.reviewerId,
    note: v.note,
    editedPayload: v.editedPayload ?? undefined,
    reviewedAt: v.reviewedAt,
    createdAt: v.createdAt,
  };
}
