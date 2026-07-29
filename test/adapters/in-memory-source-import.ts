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
  readonly leases = new Map<string, { key: string; retained: boolean }>();
  discardCount = 0;
  private sequence = 0;

  async put(key: string, bytes: Uint8Array): Promise<{ readonly leaseId: string }> {
    const existing = this.values.get(key);
    if (existing && !bytesEqual(existing, bytes)) throw new Error("integrity mismatch");
    if (!existing) this.values.set(key, Uint8Array.from(bytes));
    const leaseId = `lease-${++this.sequence}`;
    this.leases.set(leaseId, { key, retained: false });
    return { leaseId };
  }

  async retain(key: string, leaseId: string): Promise<void> {
    const lease = this.leases.get(leaseId);
    if (!lease || lease.key !== key) throw new Error("unknown lease");
    lease.retained = true;
  }

  async discard(key: string, leaseId: string): Promise<void> {
    const lease = this.leases.get(leaseId);
    if (!lease || lease.key !== key) throw new Error("unknown lease");
    this.discardCount += 1;
    this.leases.delete(leaseId);
    const matching = [...this.leases.values()].filter((value) => value.key === key);
    if (!matching.some((value) => value.retained) && matching.length === 0) this.values.delete(key);
  }
}

function bytesEqual(left: Uint8Array, right: Uint8Array): boolean {
  return left.length === right.length && left.every((value, index) => value === right[index]);
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
    if (
      [...this.receipts.values()].some(
        (value) =>
          value.projectId === input.receipt.projectId &&
          value.idempotencyKey === input.receipt.idempotencyKey,
      )
    )
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
