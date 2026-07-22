import type { PrismaClient } from "@prisma/client";
import type {
  MediaAsset,
  MediaAssetId,
  MediaAssetRepository,
  TranscriptDocument,
  TranscriptDocumentId,
  TranscriptDocumentRepository,
} from "@/domain/media-transcript";
import type { ProjectId } from "@/domain/project";
import { translatePrismaError } from "../errors";
import {
  toMediaAsset,
  toMediaAssetFields,
  toTranscriptDocument,
  toTranscriptDocumentFields,
  toTranscriptSegmentRows,
  toTranscriptSpeakerRows,
} from "../mappers/media-transcript-mappers";

const transcriptChildren = {
  speakers: { orderBy: { id: "asc" as const } },
  segments: { orderBy: [{ sequence: "asc" as const }, { id: "asc" as const }] },
};

export class PrismaMediaAssetRepository implements MediaAssetRepository {
  constructor(private readonly db: PrismaClient) {}

  async insert(value: MediaAsset): Promise<void> {
    try {
      await this.db.mediaAsset.create({ data: toMediaAssetFields(value) });
    } catch (error) {
      throw translatePrismaError(error);
    }
  }

  async findById(id: MediaAssetId): Promise<MediaAsset | null> {
    try {
      const row = await this.db.mediaAsset.findUnique({ where: { id } });
      return row === null ? null : toMediaAsset(row);
    } catch (error) {
      throw translatePrismaError(error);
    }
  }

  async listByProject(projectId: ProjectId): Promise<readonly MediaAsset[]> {
    try {
      const rows = await this.db.mediaAsset.findMany({
        where: { projectId },
        orderBy: [{ createdAt: "asc" }, { id: "asc" }],
      });
      return rows.map(toMediaAsset);
    } catch (error) {
      throw translatePrismaError(error);
    }
  }
}

export class PrismaTranscriptDocumentRepository implements TranscriptDocumentRepository {
  constructor(private readonly db: PrismaClient) {}

  async insert(value: TranscriptDocument): Promise<void> {
    try {
      await this.db.$transaction(async (tx) => {
        await tx.transcriptDocument.create({ data: toTranscriptDocumentFields(value) });
        if (value.speakers.length > 0)
          await tx.transcriptSpeaker.createMany({ data: toTranscriptSpeakerRows(value) });
        await tx.transcriptSegment.createMany({ data: toTranscriptSegmentRows(value) });
      });
    } catch (error) {
      throw translatePrismaError(error);
    }
  }

  async findById(id: TranscriptDocumentId): Promise<TranscriptDocument | null> {
    try {
      const row = await this.db.transcriptDocument.findUnique({
        where: { id },
        include: transcriptChildren,
      });
      return row === null ? null : toTranscriptDocument(row);
    } catch (error) {
      throw translatePrismaError(error);
    }
  }

  async listByProject(projectId: ProjectId): Promise<readonly TranscriptDocument[]> {
    try {
      const rows = await this.db.transcriptDocument.findMany({
        where: { projectId },
        include: transcriptChildren,
        orderBy: [{ createdAt: "asc" }, { id: "asc" }],
      });
      return rows.map(toTranscriptDocument);
    } catch (error) {
      throw translatePrismaError(error);
    }
  }

  async findByMediaAsset(mediaAssetId: MediaAssetId): Promise<TranscriptDocument | null> {
    try {
      const row = await this.db.transcriptDocument.findUnique({
        where: { mediaAssetId },
        include: transcriptChildren,
      });
      return row === null ? null : toTranscriptDocument(row);
    } catch (error) {
      throw translatePrismaError(error);
    }
  }
}
