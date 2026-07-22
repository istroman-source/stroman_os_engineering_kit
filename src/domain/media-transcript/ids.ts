import { type Brand, defineId } from "@/domain/shared";

export type MediaAssetId = Brand<string, "MediaAssetId">;
export const MediaAssetId = defineId<"MediaAssetId">("MediaAssetId", "mast");
export type TranscriptDocumentId = Brand<string, "TranscriptDocumentId">;
export const TranscriptDocumentId = defineId<"TranscriptDocumentId">(
  "TranscriptDocumentId",
  "trdoc",
);
export type TranscriptSpeakerId = Brand<string, "TranscriptSpeakerId">;
export const TranscriptSpeakerId = defineId<"TranscriptSpeakerId">("TranscriptSpeakerId", "trspk");
export type TranscriptSegmentId = Brand<string, "TranscriptSegmentId">;
export const TranscriptSegmentId = defineId<"TranscriptSegmentId">("TranscriptSegmentId", "trseg");
