import { type Brand, defineId } from "@/domain/shared";

/** Identifiers for the Knowledge Acquisition domain. */
export type KnowledgeSourceId = Brand<string, "KnowledgeSourceId">;
export const KnowledgeSourceId = defineId<"KnowledgeSourceId">("KnowledgeSourceId", "ksrc");

export type SourceDocumentId = Brand<string, "SourceDocumentId">;
export const SourceDocumentId = defineId<"SourceDocumentId">("SourceDocumentId", "sdoc");

export type AcquisitionRunId = Brand<string, "AcquisitionRunId">;
export const AcquisitionRunId = defineId<"AcquisitionRunId">("AcquisitionRunId", "arun");

export type KnowledgeObservationId = Brand<string, "KnowledgeObservationId">;
export const KnowledgeObservationId = defineId<"KnowledgeObservationId">(
  "KnowledgeObservationId",
  "kobs",
);

export type KnowledgeReviewId = Brand<string, "KnowledgeReviewId">;
export const KnowledgeReviewId = defineId<"KnowledgeReviewId">("KnowledgeReviewId", "krev");
