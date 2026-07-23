import type { ProjectId } from "@/domain/project";
import type { MediaAssetId, TranscriptDocumentId } from "@/domain/media-transcript";
import type { EvidenceReference } from "./evidence-reference";
import type { EvidenceReferenceId } from "./ids";

export interface EvidenceReferenceRepository {
  insert(value: EvidenceReference): Promise<void>;
  findById(id: EvidenceReferenceId): Promise<EvidenceReference | null>;
  listByProject(projectId: ProjectId): Promise<readonly EvidenceReference[]>;
  listByMediaAsset(mediaAssetId: MediaAssetId): Promise<readonly EvidenceReference[]>;
  listByTranscriptDocument(
    transcriptDocumentId: TranscriptDocumentId,
  ): Promise<readonly EvidenceReference[]>;
}
