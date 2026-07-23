CREATE TYPE "EvidenceProvenanceKind" AS ENUM ('MEDIA_ASSET', 'TRANSCRIPT_SEGMENT');

CREATE UNIQUE INDEX "transcript_documents_id_owner_id_project_id_media_asset_id_key"
ON "transcript_documents"("id", "owner_id", "project_id", "media_asset_id");

CREATE TABLE "evidence_references" (
  "id" TEXT NOT NULL,
  "owner_id" TEXT NOT NULL,
  "project_id" TEXT NOT NULL,
  "provenance_kind" "EvidenceProvenanceKind" NOT NULL,
  "media_asset_id" TEXT NOT NULL,
  "transcript_document_id" TEXT,
  "transcript_segment_id" TEXT,
  "created_at" TIMESTAMPTZ(3) NOT NULL,
  CONSTRAINT "evidence_references_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "evidence_references_provenance_shape" CHECK (
    ("provenance_kind" = 'MEDIA_ASSET' AND "transcript_document_id" IS NULL AND "transcript_segment_id" IS NULL)
    OR
    ("provenance_kind" = 'TRANSCRIPT_SEGMENT' AND "transcript_document_id" IS NOT NULL AND "transcript_segment_id" IS NOT NULL)
  )
);

CREATE INDEX "evidence_references_project_id_created_at_idx"
ON "evidence_references"("project_id", "created_at");
CREATE INDEX "evidence_references_media_asset_id_created_at_idx"
ON "evidence_references"("media_asset_id", "created_at");
CREATE INDEX "evidence_references_transcript_document_id_created_at_idx"
ON "evidence_references"("transcript_document_id", "created_at");

ALTER TABLE "evidence_references" ADD CONSTRAINT "evidence_references_project_alignment_fkey"
FOREIGN KEY ("project_id", "owner_id") REFERENCES "projects"("id", "owner_id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "evidence_references" ADD CONSTRAINT "evidence_references_media_alignment_fkey"
FOREIGN KEY ("media_asset_id", "owner_id", "project_id") REFERENCES "media_assets"("id", "owner_id", "project_id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "evidence_references" ADD CONSTRAINT "evidence_references_transcript_alignment_fkey"
FOREIGN KEY ("transcript_document_id", "owner_id", "project_id", "media_asset_id") REFERENCES "transcript_documents"("id", "owner_id", "project_id", "media_asset_id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "evidence_references" ADD CONSTRAINT "evidence_references_segment_fkey"
FOREIGN KEY ("transcript_document_id", "transcript_segment_id") REFERENCES "transcript_segments"("transcript_document_id", "id") ON DELETE RESTRICT ON UPDATE CASCADE;
