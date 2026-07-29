import type {
  MediaAsset,
  MediaAssetId,
  TranscriptDocument,
  TranscriptDocumentId,
} from "@/domain/media-transcript";
import type { OwnerId, ProjectId } from "@/domain/project";

export type TranscriptFormat = "srt" | "vtt" | "json" | "text";
export type SourceImportStatus =
  "PROCESSING" | "COMPLETED" | "RETRYABLE_FAILURE" | "TERMINAL_FAILURE";

export interface SourceImportReceipt {
  readonly id: string;
  readonly ownerId: OwnerId;
  readonly projectId: ProjectId;
  readonly idempotencyKey: string;
  readonly status: SourceImportStatus;
  readonly sourceName: string;
  readonly sourceKind: "MEDIA" | "TRANSCRIPT";
  readonly contentType: string;
  readonly byteSize: number;
  readonly contentHash: string;
  readonly storageKey: string;
  readonly transcriptFormat: TranscriptFormat | null;
  readonly failureCode: string | null;
  readonly mediaAssetId: MediaAssetId | null;
  readonly transcriptDocumentId: TranscriptDocumentId | null;
  readonly createdAt: Date;
  readonly updatedAt: Date;
}

export interface SourceImportRepository {
  findByKey(projectId: ProjectId, key: string): Promise<SourceImportReceipt | null>;
  listByProject(projectId: ProjectId): Promise<readonly SourceImportReceipt[]>;
  completeAtomically(input: {
    receipt: SourceImportReceipt;
    media: MediaAsset;
    transcript: TranscriptDocument | null;
  }): Promise<SourceImportReceipt>;
}

export interface SourceStorage {
  put(key: string, bytes: Uint8Array): Promise<{ readonly leaseId: string }>;
  retain(key: string, leaseId: string): Promise<void>;
  discard(key: string, leaseId: string): Promise<void>;
}
