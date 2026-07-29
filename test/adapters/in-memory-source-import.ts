import { ConflictError } from "@/lib/errors";
import type {
  SourceImportReceipt,
  SourceImportRepository,
  SourceStorage,
} from "@/domain/source-import";
import type { MediaAsset, TranscriptDocument } from "@/domain/media-transcript";
import type { ProjectId } from "@/domain/project";

export class InMemorySourceStorage implements SourceStorage {
  readonly values = new Map<string, Uint8Array>();
  async put(key: string, bytes: Uint8Array): Promise<void> {
    this.values.set(key, Uint8Array.from(bytes));
  }
  async remove(key: string): Promise<void> {
    this.values.delete(key);
  }
}

export class InMemorySourceImportRepository implements SourceImportRepository {
  readonly receipts = new Map<string, SourceImportReceipt>();
  readonly media = new Map<string, MediaAsset>();
  readonly transcripts = new Map<string, TranscriptDocument>();
  failNext = false;

  async findByKey(projectId: ProjectId, key: string): Promise<SourceImportReceipt | null> {
    return (
      [...this.receipts.values()].find(
        (value) => value.projectId === projectId && value.idempotencyKey === key,
      ) ?? null
    );
  }

  async listByProject(projectId: ProjectId): Promise<readonly SourceImportReceipt[]> {
    return [...this.receipts.values()]
      .filter((value) => value.projectId === projectId)
      .sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime() || a.id.localeCompare(b.id));
  }

  async completeAtomically(input: {
    receipt: SourceImportReceipt;
    media: MediaAsset;
    transcript: TranscriptDocument | null;
  }): Promise<SourceImportReceipt> {
    if (this.failNext) {
      this.failNext = false;
      throw new Error("injected atomic failure");
    }
    if (await this.findByKey(input.receipt.projectId, input.receipt.idempotencyKey))
      throw new ConflictError("Duplicate import");
    const completed: SourceImportReceipt = {
      ...input.receipt,
      status: "COMPLETED",
      mediaAssetId: input.media.id,
      transcriptDocumentId: input.transcript?.id ?? null,
    };
    this.media.set(input.media.id, input.media);
    if (input.transcript) this.transcripts.set(input.transcript.id, input.transcript);
    this.receipts.set(completed.id, completed);
    return completed;
  }
}
