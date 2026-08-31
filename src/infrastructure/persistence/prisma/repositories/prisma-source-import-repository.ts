import type { PrismaClient } from "@prisma/client";
import { z } from "zod";
import type { SourceImportReceipt, SourceImportRepository } from "@/domain/source-import";
import { MediaAssetId, TranscriptDocumentId } from "@/domain/media-transcript";
import { OwnerId, ProjectId } from "@/domain/project";
import { PersistenceMappingError, translatePrismaError } from "../errors";
import {
  toMediaAssetFields,
  toTranscriptDocumentFields,
  toTranscriptSegmentRows,
  toTranscriptSpeakerRows,
} from "../mappers/media-transcript-mappers";

const ReceiptRow = z.object({
  id: z.string().min(1),
  ownerId: z.string().min(1),
  projectId: z.string().min(1),
  idempotencyKey: z.string().min(1),
  status: z.enum(["PROCESSING", "COMPLETED", "RETRYABLE_FAILURE", "TERMINAL_FAILURE"]),
  sourceName: z.string().min(1),
  sourceKind: z.enum(["MEDIA", "TRANSCRIPT"]),
  contentType: z.string().min(1),
  byteSize: z.number().int().nonnegative(),
  contentHash: z.string().min(1),
  storageKey: z.string().min(1),
  transcriptFormat: z.enum(["srt", "vtt", "json", "text"]).nullable(),
  failureCode: z.string().nullable(),
  mediaAssetId: z.string().nullable(),
  transcriptDocumentId: z.string().nullable(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export function toSourceImportReceipt(row: unknown): SourceImportReceipt {
  const parsed = ReceiptRow.safeParse(row);
  if (!parsed.success)
    throw new PersistenceMappingError("Source import row violated its persisted contract");
  const value = parsed.data;
  if (value.status === "COMPLETED" && value.mediaAssetId === null)
    throw new PersistenceMappingError("Completed source import has no media asset");
  return {
    ...value,
    ownerId: OwnerId.unsafe(value.ownerId),
    projectId: ProjectId.unsafe(value.projectId),
    mediaAssetId: value.mediaAssetId ? MediaAssetId.unsafe(value.mediaAssetId) : null,
    transcriptDocumentId: value.transcriptDocumentId
      ? TranscriptDocumentId.unsafe(value.transcriptDocumentId)
      : null,
  };
}

export class PrismaSourceImportRepository implements SourceImportRepository {
  constructor(private readonly db: PrismaClient) {}

  async findById(id: string): Promise<SourceImportReceipt | null> {
    try {
      const row = await this.db.sourceImport.findUnique({ where: { id } });
      return row ? toSourceImportReceipt(row) : null;
    } catch (error) {
      throw translatePrismaError(error);
    }
  }

  async findByKey(projectId: ProjectId, key: string): Promise<SourceImportReceipt | null> {
    try {
      const row = await this.db.sourceImport.findUnique({
        where: { projectId_idempotencyKey: { projectId, idempotencyKey: key } },
      });
      return row ? toSourceImportReceipt(row) : null;
    } catch (error) {
      throw translatePrismaError(error);
    }
  }

  async listByProject(projectId: ProjectId): Promise<readonly SourceImportReceipt[]> {
    try {
      const rows = await this.db.sourceImport.findMany({
        where: { projectId },
        orderBy: [{ createdAt: "asc" }, { id: "asc" }],
      });
      return rows.map(toSourceImportReceipt);
    } catch (error) {
      throw translatePrismaError(error);
    }
  }

  async start(receipt: SourceImportReceipt): Promise<SourceImportReceipt> {
    try {
      const row = await this.db.sourceImport.create({
        data: {
          id: receipt.id,
          ownerId: receipt.ownerId,
          projectId: receipt.projectId,
          idempotencyKey: receipt.idempotencyKey,
          status: "PROCESSING",
          sourceName: receipt.sourceName,
          sourceKind: receipt.sourceKind,
          contentType: receipt.contentType,
          byteSize: receipt.byteSize,
          contentHash: receipt.contentHash,
          storageKey: receipt.storageKey,
          transcriptFormat: receipt.transcriptFormat,
          failureCode: null,
          mediaAssetId: null,
          transcriptDocumentId: null,
          createdAt: receipt.createdAt,
          updatedAt: receipt.updatedAt,
        },
      });
      return toSourceImportReceipt(row);
    } catch (error) {
      throw translatePrismaError(error);
    }
  }

  async claimRetry(
    id: string,
    projectId: ProjectId,
    now: Date,
  ): Promise<SourceImportReceipt | null> {
    try {
      const claimed = await this.db.sourceImport.updateMany({
        where: { id, projectId, status: "RETRYABLE_FAILURE" },
        data: { status: "PROCESSING", failureCode: null, updatedAt: now },
      });
      if (claimed.count !== 1) return null;
      const row = await this.db.sourceImport.findUniqueOrThrow({ where: { id } });
      return toSourceImportReceipt(row);
    } catch (error) {
      throw translatePrismaError(error);
    }
  }

  async markFailure(input: {
    id: string;
    projectId: ProjectId;
    status: "RETRYABLE_FAILURE" | "TERMINAL_FAILURE";
    failureCode: string;
    now: Date;
  }): Promise<SourceImportReceipt> {
    try {
      const row = await this.db.sourceImport.update({
        where: { id: input.id, projectId: input.projectId },
        data: {
          status: input.status,
          failureCode: input.failureCode,
          updatedAt: input.now,
        },
      });
      return toSourceImportReceipt(row);
    } catch (error) {
      throw translatePrismaError(error);
    }
  }

  async completeAtomically(input: {
    receipt: SourceImportReceipt;
    media: Parameters<typeof toMediaAssetFields>[0];
    transcript: Parameters<typeof toTranscriptDocumentFields>[0] | null;
  }): Promise<SourceImportReceipt> {
    try {
      const row = await this.db.$transaction(async (tx) => {
        await tx.mediaAsset.create({ data: toMediaAssetFields(input.media) });
        if (input.transcript) {
          await tx.transcriptDocument.create({
            data: toTranscriptDocumentFields(input.transcript),
          });
          if (input.transcript.speakers.length)
            await tx.transcriptSpeaker.createMany({
              data: toTranscriptSpeakerRows(input.transcript),
            });
          await tx.transcriptSegment.createMany({
            data: toTranscriptSegmentRows(input.transcript),
          });
        }
        return tx.sourceImport.update({
          where: { id: input.receipt.id, projectId: input.receipt.projectId },
          data: {
            status: "COMPLETED",
            failureCode: null,
            mediaAssetId: input.media.id,
            transcriptDocumentId: input.transcript?.id ?? null,
            updatedAt: input.receipt.updatedAt,
          },
        });
      });
      return toSourceImportReceipt(row);
    } catch (error) {
      throw translatePrismaError(error);
    }
  }
}
