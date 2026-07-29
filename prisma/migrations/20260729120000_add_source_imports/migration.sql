CREATE TYPE "SourceImportStatus" AS ENUM (
  'PROCESSING',
  'COMPLETED',
  'RETRYABLE_FAILURE',
  'TERMINAL_FAILURE'
);

CREATE TABLE "source_imports" (
  "id" TEXT NOT NULL,
  "owner_id" TEXT NOT NULL,
  "project_id" TEXT NOT NULL,
  "idempotency_key" TEXT NOT NULL,
  "status" "SourceImportStatus" NOT NULL,
  "source_name" TEXT NOT NULL,
  "source_kind" TEXT NOT NULL,
  "content_type" TEXT NOT NULL,
  "byte_size" INTEGER NOT NULL,
  "content_hash" TEXT NOT NULL,
  "storage_key" TEXT NOT NULL,
  "transcript_format" TEXT,
  "failure_code" TEXT,
  "media_asset_id" TEXT,
  "transcript_document_id" TEXT,
  "created_at" TIMESTAMPTZ(3) NOT NULL,
  "updated_at" TIMESTAMPTZ(3) NOT NULL,
  CONSTRAINT "source_imports_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "source_imports_size_check" CHECK ("byte_size" >= 0),
  CONSTRAINT "source_imports_completion_check" CHECK (
    ("status" = 'COMPLETED' AND "media_asset_id" IS NOT NULL AND "failure_code" IS NULL)
    OR ("status" <> 'COMPLETED' AND "transcript_document_id" IS NULL)
  )
);

CREATE UNIQUE INDEX "source_imports_project_id_idempotency_key_key"
  ON "source_imports"("project_id", "idempotency_key");
CREATE UNIQUE INDEX "source_imports_id_owner_id_project_id_key"
  ON "source_imports"("id", "owner_id", "project_id");
CREATE UNIQUE INDEX "source_imports_media_asset_id_key"
  ON "source_imports"("media_asset_id");
CREATE UNIQUE INDEX "source_imports_transcript_document_id_key"
  ON "source_imports"("transcript_document_id");
CREATE UNIQUE INDEX "source_imports_media_asset_alignment_key"
  ON "source_imports"("media_asset_id", "owner_id", "project_id");
CREATE UNIQUE INDEX "source_imports_transcript_alignment_key"
  ON "source_imports"("transcript_document_id", "owner_id", "project_id", "media_asset_id");
CREATE INDEX "source_imports_project_id_created_at_idx"
  ON "source_imports"("project_id", "created_at");

ALTER TABLE "source_imports" ADD CONSTRAINT "source_imports_project_id_owner_id_fkey"
  FOREIGN KEY ("project_id", "owner_id") REFERENCES "projects"("id", "owner_id")
  ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "source_imports" ADD CONSTRAINT "source_imports_media_asset_alignment_fkey"
  FOREIGN KEY ("media_asset_id", "owner_id", "project_id")
  REFERENCES "media_assets"("id", "owner_id", "project_id")
  ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "source_imports" ADD CONSTRAINT "source_imports_transcript_alignment_fkey"
  FOREIGN KEY ("transcript_document_id", "owner_id", "project_id", "media_asset_id")
  REFERENCES "transcript_documents"("id", "owner_id", "project_id", "media_asset_id")
  ON DELETE RESTRICT ON UPDATE CASCADE;
