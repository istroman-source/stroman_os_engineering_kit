import type { MediaAsset, TranscriptDocument } from "@/domain/media-transcript";
export type MediaAssetView = Omit<MediaAsset, "ownerId">;
export type TranscriptDocumentView = Omit<TranscriptDocument, "ownerId">;
export function toMediaAssetView(v: MediaAsset): MediaAssetView {
  const { ownerId, ...view } = v;
  void ownerId;
  return view;
}
export function toTranscriptDocumentView(v: TranscriptDocument): TranscriptDocumentView {
  const { ownerId, ...view } = v;
  void ownerId;
  return view;
}
