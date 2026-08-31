ALTER TABLE "evidence_references"
  ADD COLUMN "frame_index" INTEGER,
  ADD COLUMN "frame_timestamp_ms" INTEGER,
  ADD COLUMN "frame_storage_key" TEXT,
  ADD COLUMN "frame_content_type" TEXT,
  ADD COLUMN "frame_byte_size" INTEGER,
  ADD COLUMN "frame_content_hash" TEXT;

ALTER TABLE "evidence_references"
  ADD CONSTRAINT "evidence_references_frame_shape_check" CHECK (
    (
      "frame_index" IS NULL AND
      "frame_timestamp_ms" IS NULL AND
      "frame_storage_key" IS NULL AND
      "frame_content_type" IS NULL AND
      "frame_byte_size" IS NULL AND
      "frame_content_hash" IS NULL
    ) OR (
      "provenance_kind" = 'MEDIA_ASSET' AND
      "transcript_document_id" IS NULL AND
      "transcript_segment_id" IS NULL AND
      "frame_index" >= 0 AND
      "frame_timestamp_ms" >= 0 AND
      "frame_storage_key" IS NOT NULL AND
      "frame_content_type" IN ('image/jpeg', 'image/png', 'image/webp') AND
      "frame_byte_size" > 0 AND
      "frame_content_hash" IS NOT NULL
    )
  );

CREATE INDEX "evidence_references_media_asset_id_frame_timestamp_ms_idx"
  ON "evidence_references"("media_asset_id", "frame_timestamp_ms");
