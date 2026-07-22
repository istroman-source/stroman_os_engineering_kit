import type {
  MediaAsset as MediaAssetRow,
  Prisma,
  TranscriptDocument as TranscriptDocumentRow,
  TranscriptSegment as TranscriptSegmentRow,
  TranscriptSpeaker as TranscriptSpeakerRow,
} from "@prisma/client";
import {
  MediaAssetId,
  TranscriptDocumentId,
  TranscriptSegmentId,
  TranscriptSpeakerId,
  createMediaAsset,
  createTranscriptDocument,
  type MediaAsset,
  type TranscriptDocument,
} from "@/domain/media-transcript";
import { OwnerId, ProjectId } from "@/domain/project";
import { orThrowMapping } from "./shared";

export interface TranscriptDocumentRowWithChildren extends TranscriptDocumentRow {
  readonly speakers: readonly TranscriptSpeakerRow[];
  readonly segments: readonly TranscriptSegmentRow[];
}

export function toMediaAsset(row: MediaAssetRow): MediaAsset {
  return orThrowMapping(
    createMediaAsset({
      id: orThrowMapping(MediaAssetId.parse(row.id), "mediaAsset.id"),
      ownerId: orThrowMapping(OwnerId.parse(row.ownerId), "mediaAsset.ownerId"),
      projectId: orThrowMapping(ProjectId.parse(row.projectId), "mediaAsset.projectId"),
      fileName: row.fileName,
      mediaType: row.mediaType,
      byteSize: row.byteSize,
      contentHash: row.contentHash,
      now: row.createdAt,
    }),
    "mediaAsset",
  );
}

export function toMediaAssetFields(value: MediaAsset): Prisma.MediaAssetUncheckedCreateInput {
  return {
    id: value.id,
    ownerId: value.ownerId,
    projectId: value.projectId,
    fileName: value.fileName,
    mediaType: value.mediaType,
    byteSize: value.byteSize,
    contentHash: value.contentHash,
    createdAt: value.createdAt,
  };
}

export function toTranscriptDocument(row: TranscriptDocumentRowWithChildren): TranscriptDocument {
  return orThrowMapping(
    createTranscriptDocument({
      id: orThrowMapping(TranscriptDocumentId.parse(row.id), "transcriptDocument.id"),
      ownerId: orThrowMapping(OwnerId.parse(row.ownerId), "transcriptDocument.ownerId"),
      projectId: orThrowMapping(ProjectId.parse(row.projectId), "transcriptDocument.projectId"),
      mediaAssetId: orThrowMapping(
        MediaAssetId.parse(row.mediaAssetId),
        "transcriptDocument.mediaAssetId",
      ),
      title: row.title,
      speakers: row.speakers.map((speaker) => ({
        id: orThrowMapping(TranscriptSpeakerId.parse(speaker.id), "transcriptSpeaker.id"),
        label: speaker.label,
      })),
      segments: row.segments.map((segment) => ({
        id: orThrowMapping(TranscriptSegmentId.parse(segment.id), "transcriptSegment.id"),
        sequence: segment.sequence,
        speakerId:
          segment.speakerId === null
            ? null
            : orThrowMapping(
                TranscriptSpeakerId.parse(segment.speakerId),
                "transcriptSegment.speakerId",
              ),
        text: segment.text,
        startMs: segment.startMs,
        endMs: segment.endMs,
      })),
      now: row.createdAt,
    }),
    "transcriptDocument",
  );
}

export function toTranscriptDocumentFields(
  value: TranscriptDocument,
): Prisma.TranscriptDocumentUncheckedCreateInput {
  return {
    id: value.id,
    ownerId: value.ownerId,
    projectId: value.projectId,
    mediaAssetId: value.mediaAssetId,
    title: value.title,
    createdAt: value.createdAt,
  };
}

export function toTranscriptSpeakerRows(
  value: TranscriptDocument,
): Prisma.TranscriptSpeakerCreateManyInput[] {
  return value.speakers.map((speaker) => ({
    transcriptDocumentId: value.id,
    id: speaker.id,
    label: speaker.label,
  }));
}

export function toTranscriptSegmentRows(
  value: TranscriptDocument,
): Prisma.TranscriptSegmentCreateManyInput[] {
  return value.segments.map((segment) => ({
    transcriptDocumentId: value.id,
    id: segment.id,
    sequence: segment.sequence,
    speakerId: segment.speakerId,
    text: segment.text,
    startMs: segment.startMs,
    endMs: segment.endMs,
  }));
}
