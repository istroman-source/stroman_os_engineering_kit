import type { ExtractionLocation } from "./extraction-location";
import type { AcquisitionRunId, KnowledgeSourceId, SourceDocumentId } from "./ids";

/**
 * Cohesive provenance for a knowledge observation: where it came from. Groups the
 * originating document and source (always present) with the acquisition run (when
 * one produced it) and the precise in-document location (when known), leaving room
 * for future provenance fields without scattering them across the observation.
 */
export interface ObservationEvidence {
  readonly sourceDocumentId: SourceDocumentId;
  readonly knowledgeSourceId: KnowledgeSourceId;
  readonly acquisitionRunId: AcquisitionRunId | null;
  readonly location: ExtractionLocation | null;
}

export interface ObservationEvidenceInput {
  readonly sourceDocumentId: SourceDocumentId;
  readonly knowledgeSourceId: KnowledgeSourceId;
  readonly acquisitionRunId?: AcquisitionRunId | null;
  readonly location?: ExtractionLocation | null;
}

/**
 * Assemble an evidence value object. The document and source are required (branded
 * ids, validated upstream); the run and location are optional. The location, when
 * present, must already have been validated via `makeExtractionLocation`.
 */
export function makeObservationEvidence(input: ObservationEvidenceInput): ObservationEvidence {
  return {
    sourceDocumentId: input.sourceDocumentId,
    knowledgeSourceId: input.knowledgeSourceId,
    acquisitionRunId: input.acquisitionRunId ?? null,
    location: input.location ?? null,
  };
}
