import type { ProjectId } from "@/domain/project";
import type { MediaAssetId, TranscriptDocumentId } from "./ids";
import type { MediaAsset } from "./media-asset";
import type { TranscriptDocument } from "./transcript-document";
export interface MediaAssetRepository {
  insert(value: MediaAsset): Promise<void>;
  findById(id: MediaAssetId): Promise<MediaAsset | null>;
  listByProject(projectId: ProjectId): Promise<readonly MediaAsset[]>;
}
export interface TranscriptDocumentRepository {
  insert(value: TranscriptDocument): Promise<void>;
  findById(id: TranscriptDocumentId): Promise<TranscriptDocument | null>;
  listByProject(projectId: ProjectId): Promise<readonly TranscriptDocument[]>;
  findByMediaAsset(id: MediaAssetId): Promise<TranscriptDocument | null>;
}
