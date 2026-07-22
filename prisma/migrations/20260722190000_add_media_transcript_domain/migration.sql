CREATE UNIQUE INDEX "projects_id_owner_id_key" ON "projects"("id", "owner_id");

CREATE TABLE "media_assets" (
  "id" TEXT NOT NULL,
  "owner_id" TEXT NOT NULL,
  "project_id" TEXT NOT NULL,
  "file_name" TEXT NOT NULL,
  "media_type" TEXT NOT NULL,
  "byte_size" INTEGER NOT NULL,
  "content_hash" TEXT NOT NULL,
  "created_at" TIMESTAMPTZ(3) NOT NULL,
  CONSTRAINT "media_assets_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "media_assets_byte_size_nonnegative" CHECK ("byte_size" >= 0)
);

CREATE TABLE "transcript_documents" (
  "id" TEXT NOT NULL,
  "owner_id" TEXT NOT NULL,
  "project_id" TEXT NOT NULL,
  "media_asset_id" TEXT NOT NULL,
  "title" TEXT NOT NULL,
  "created_at" TIMESTAMPTZ(3) NOT NULL,
  CONSTRAINT "transcript_documents_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "transcript_speakers" (
  "transcript_document_id" TEXT NOT NULL,
  "id" TEXT NOT NULL,
  "label" TEXT NOT NULL,
  CONSTRAINT "transcript_speakers_pkey" PRIMARY KEY ("transcript_document_id", "id")
);

CREATE TABLE "transcript_segments" (
  "transcript_document_id" TEXT NOT NULL,
  "id" TEXT NOT NULL,
  "sequence" INTEGER NOT NULL,
  "speaker_id" TEXT,
  "text" TEXT NOT NULL,
  "start_ms" INTEGER,
  "end_ms" INTEGER,
  CONSTRAINT "transcript_segments_pkey" PRIMARY KEY ("transcript_document_id", "id"),
  CONSTRAINT "transcript_segments_sequence_nonnegative" CHECK ("sequence" >= 0),
  CONSTRAINT "transcript_segments_timestamps_paired" CHECK (("start_ms" IS NULL) = ("end_ms" IS NULL)),
  CONSTRAINT "transcript_segments_timestamps_nonnegative" CHECK (("start_ms" IS NULL) OR ("start_ms" >= 0 AND "end_ms" >= 0)),
  CONSTRAINT "transcript_segments_timestamp_order" CHECK (("start_ms" IS NULL) OR ("end_ms" > "start_ms"))
);

CREATE UNIQUE INDEX "media_assets_id_owner_id_project_id_key" ON "media_assets"("id", "owner_id", "project_id");
CREATE INDEX "media_assets_project_id_idx" ON "media_assets"("project_id");
CREATE UNIQUE INDEX "transcript_documents_media_asset_id_key" ON "transcript_documents"("media_asset_id");
CREATE UNIQUE INDEX "transcript_documents_media_asset_id_owner_id_project_id_key" ON "transcript_documents"("media_asset_id", "owner_id", "project_id");
CREATE INDEX "transcript_documents_project_id_idx" ON "transcript_documents"("project_id");
CREATE INDEX "transcript_documents_media_asset_id_idx" ON "transcript_documents"("media_asset_id");
CREATE INDEX "transcript_speakers_transcript_document_id_idx" ON "transcript_speakers"("transcript_document_id");
CREATE UNIQUE INDEX "transcript_segments_transcript_document_id_sequence_key" ON "transcript_segments"("transcript_document_id", "sequence");
CREATE INDEX "transcript_segments_transcript_document_id_sequence_idx" ON "transcript_segments"("transcript_document_id", "sequence");

ALTER TABLE "media_assets" ADD CONSTRAINT "media_assets_project_id_owner_id_fkey" FOREIGN KEY ("project_id", "owner_id") REFERENCES "projects"("id", "owner_id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "transcript_documents" ADD CONSTRAINT "transcript_documents_project_id_owner_id_fkey" FOREIGN KEY ("project_id", "owner_id") REFERENCES "projects"("id", "owner_id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "transcript_documents" ADD CONSTRAINT "transcript_documents_media_asset_alignment_fkey" FOREIGN KEY ("media_asset_id", "owner_id", "project_id") REFERENCES "media_assets"("id", "owner_id", "project_id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "transcript_speakers" ADD CONSTRAINT "transcript_speakers_transcript_document_id_fkey" FOREIGN KEY ("transcript_document_id") REFERENCES "transcript_documents"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "transcript_segments" ADD CONSTRAINT "transcript_segments_transcript_document_id_fkey" FOREIGN KEY ("transcript_document_id") REFERENCES "transcript_documents"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "transcript_segments" ADD CONSTRAINT "transcript_segments_speaker_fkey" FOREIGN KEY ("transcript_document_id", "speaker_id") REFERENCES "transcript_speakers"("transcript_document_id", "id") ON DELETE RESTRICT ON UPDATE CASCADE;
