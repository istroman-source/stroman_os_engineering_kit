import type { OwnerId, ProjectId } from "@/domain/project";
import type {
  MediaAssetId,
  TranscriptDocumentId,
  TranscriptSegmentId,
} from "@/domain/media-transcript";
import type { EvidenceReferenceId } from "./ids";

export type EvidenceProvenance =
  | {
      readonly kind: "MEDIA_ASSET";
      readonly mediaAssetId: MediaAssetId;
    }
  | {
      readonly kind: "TRANSCRIPT_SEGMENT";
      readonly mediaAssetId: MediaAssetId;
      readonly transcriptDocumentId: TranscriptDocumentId;
      readonly transcriptSegmentId: TranscriptSegmentId;
    };

export interface EvidenceReference {
  readonly id: EvidenceReferenceId;
  readonly ownerId: OwnerId;
  readonly projectId: ProjectId;
  readonly provenance: EvidenceProvenance;
  readonly createdAt: Date;
}

export interface CreateEvidenceReferenceInput {
  readonly id: EvidenceReferenceId;
  readonly ownerId: OwnerId;
  readonly projectId: ProjectId;
  readonly provenance: EvidenceProvenance;
  readonly now: Date;
}

export function createEvidenceReference(input: CreateEvidenceReferenceInput): EvidenceReference {
  const provenance: EvidenceProvenance =
    input.provenance.kind === "MEDIA_ASSET"
      ? { kind: "MEDIA_ASSET", mediaAssetId: input.provenance.mediaAssetId }
      : {
          kind: "TRANSCRIPT_SEGMENT",
          mediaAssetId: input.provenance.mediaAssetId,
          transcriptDocumentId: input.provenance.transcriptDocumentId,
          transcriptSegmentId: input.provenance.transcriptSegmentId,
        };
  return {
    id: input.id,
    ownerId: input.ownerId,
    projectId: input.projectId,
    provenance,
    createdAt: input.now,
  };
}
