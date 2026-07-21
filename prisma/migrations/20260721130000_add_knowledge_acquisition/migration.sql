-- Knowledge Acquisition: persisted sources, documents, runs, observations, and reviews.

CREATE TYPE "KnowledgeSourceType" AS ENUM ('UPLOAD', 'WEB_PAGE', 'MANUAL');
CREATE TYPE "SourceReliability" AS ENUM ('VERIFIED', 'HIGH', 'MEDIUM', 'LOW', 'UNKNOWN');
CREATE TYPE "KnowledgeSourceStatus" AS ENUM ('ACTIVE', 'PAUSED', 'ARCHIVED');
CREATE TYPE "DocumentType" AS ENUM ('TRANSCRIPT', 'ARTICLE', 'WEB_PAGE', 'SOCIAL_POST', 'PDF', 'VIDEO', 'NOTE');
CREATE TYPE "AcquisitionRunStatus" AS ENUM ('PENDING', 'RUNNING', 'SUCCEEDED', 'PARTIALLY_SUCCEEDED', 'FAILED');
CREATE TYPE "ObservationKind" AS ENUM ('ENTITY', 'MEMORY', 'INSIGHT', 'RELATIONSHIP');
CREATE TYPE "ObservationOrigin" AS ENUM ('AI', 'HUMAN', 'IMPORT');
CREATE TYPE "ObservationStatus" AS ENUM ('PENDING_REVIEW', 'ACCEPTED', 'REJECTED');
CREATE TYPE "ReviewOutcome" AS ENUM ('ACCEPT', 'EDIT_AND_ACCEPT', 'REJECT');

CREATE TABLE "knowledge_sources" (
  "id" TEXT NOT NULL, "owner_id" TEXT NOT NULL, "name" TEXT NOT NULL,
  "source_type" "KnowledgeSourceType" NOT NULL, "origin" TEXT,
  "source_reliability" "SourceReliability" NOT NULL, "status" "KnowledgeSourceStatus" NOT NULL,
  "created_at" TIMESTAMPTZ(3) NOT NULL, "lock_version" INTEGER NOT NULL DEFAULT 1,
  CONSTRAINT "knowledge_sources_pkey" PRIMARY KEY ("id")
);
CREATE TABLE "source_documents" (
  "id" TEXT NOT NULL, "owner_id" TEXT NOT NULL, "knowledge_source_id" TEXT NOT NULL,
  "document_type" "DocumentType" NOT NULL, "content_hash" TEXT NOT NULL, "title" TEXT NOT NULL,
  "media_type" TEXT, "byte_size" INTEGER, "created_at" TIMESTAMPTZ(3) NOT NULL,
  CONSTRAINT "source_documents_pkey" PRIMARY KEY ("id")
);
CREATE TABLE "acquisition_runs" (
  "id" TEXT NOT NULL, "owner_id" TEXT NOT NULL, "knowledge_source_id" TEXT NOT NULL,
  "extractor" TEXT NOT NULL, "extractor_version" TEXT NOT NULL, "status" "AcquisitionRunStatus" NOT NULL,
  "started_at" TIMESTAMPTZ(3), "finished_at" TIMESTAMPTZ(3), "documents_processed" INTEGER,
  "observations_created" INTEGER, "failure_count" INTEGER, "created_at" TIMESTAMPTZ(3) NOT NULL,
  "lock_version" INTEGER NOT NULL DEFAULT 1, CONSTRAINT "acquisition_runs_pkey" PRIMARY KEY ("id")
);
CREATE TABLE "knowledge_observations" (
  "id" TEXT NOT NULL, "owner_id" TEXT NOT NULL, "observation_type" "ObservationKind" NOT NULL,
  "payload" JSONB NOT NULL, "source_document_id" TEXT NOT NULL, "knowledge_source_id" TEXT NOT NULL,
  "acquisition_run_id" TEXT, "location" JSONB, "confidence" DOUBLE PRECISION,
  "created_by" "ObservationOrigin" NOT NULL, "status" "ObservationStatus" NOT NULL,
  "created_at" TIMESTAMPTZ(3) NOT NULL, "lock_version" INTEGER NOT NULL DEFAULT 1,
  CONSTRAINT "knowledge_observations_pkey" PRIMARY KEY ("id")
);
CREATE TABLE "knowledge_reviews" (
  "id" TEXT NOT NULL, "owner_id" TEXT NOT NULL, "knowledge_observation_id" TEXT NOT NULL,
  "outcome" "ReviewOutcome" NOT NULL, "reviewer_id" TEXT NOT NULL, "note" TEXT,
  "edited_payload" JSONB, "reviewed_at" TIMESTAMPTZ(3) NOT NULL, "created_at" TIMESTAMPTZ(3) NOT NULL,
  CONSTRAINT "knowledge_reviews_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "knowledge_sources_owner_id_idx" ON "knowledge_sources"("owner_id");
CREATE UNIQUE INDEX "source_documents_knowledge_source_id_content_hash_key" ON "source_documents"("knowledge_source_id", "content_hash");
CREATE INDEX "source_documents_owner_id_idx" ON "source_documents"("owner_id");
CREATE INDEX "source_documents_knowledge_source_id_idx" ON "source_documents"("knowledge_source_id");
CREATE INDEX "acquisition_runs_owner_id_idx" ON "acquisition_runs"("owner_id");
CREATE INDEX "acquisition_runs_knowledge_source_id_idx" ON "acquisition_runs"("knowledge_source_id");
CREATE INDEX "knowledge_observations_owner_id_idx" ON "knowledge_observations"("owner_id");
CREATE INDEX "knowledge_observations_source_document_id_idx" ON "knowledge_observations"("source_document_id");
CREATE INDEX "knowledge_observations_acquisition_run_id_idx" ON "knowledge_observations"("acquisition_run_id");
CREATE INDEX "knowledge_observations_knowledge_source_id_idx" ON "knowledge_observations"("knowledge_source_id");
CREATE UNIQUE INDEX "knowledge_reviews_knowledge_observation_id_key" ON "knowledge_reviews"("knowledge_observation_id");
CREATE INDEX "knowledge_reviews_owner_id_idx" ON "knowledge_reviews"("owner_id");

ALTER TABLE "source_documents" ADD CONSTRAINT "source_documents_knowledge_source_id_fkey" FOREIGN KEY ("knowledge_source_id") REFERENCES "knowledge_sources"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "acquisition_runs" ADD CONSTRAINT "acquisition_runs_knowledge_source_id_fkey" FOREIGN KEY ("knowledge_source_id") REFERENCES "knowledge_sources"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "knowledge_observations" ADD CONSTRAINT "knowledge_observations_source_document_id_fkey" FOREIGN KEY ("source_document_id") REFERENCES "source_documents"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "knowledge_observations" ADD CONSTRAINT "knowledge_observations_knowledge_source_id_fkey" FOREIGN KEY ("knowledge_source_id") REFERENCES "knowledge_sources"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "knowledge_observations" ADD CONSTRAINT "knowledge_observations_acquisition_run_id_fkey" FOREIGN KEY ("acquisition_run_id") REFERENCES "acquisition_runs"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "knowledge_reviews" ADD CONSTRAINT "knowledge_reviews_knowledge_observation_id_fkey" FOREIGN KEY ("knowledge_observation_id") REFERENCES "knowledge_observations"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "knowledge_observations" ADD CONSTRAINT "knowledge_observations_confidence_range" CHECK ("confidence" IS NULL OR ("confidence" >= 0 AND "confidence" <= 1));
ALTER TABLE "acquisition_runs"
  ADD CONSTRAINT "acquisition_runs_documents_processed_nonnegative" CHECK ("documents_processed" IS NULL OR "documents_processed" >= 0),
  ADD CONSTRAINT "acquisition_runs_observations_created_nonnegative" CHECK ("observations_created" IS NULL OR "observations_created" >= 0),
  ADD CONSTRAINT "acquisition_runs_failure_count_nonnegative" CHECK ("failure_count" IS NULL OR "failure_count" >= 0);
ALTER TABLE "knowledge_reviews" ADD CONSTRAINT "knowledge_reviews_outcome_payload" CHECK (("outcome" = 'EDIT_AND_ACCEPT' AND "edited_payload" IS NOT NULL) OR ("outcome" IN ('ACCEPT','REJECT') AND "edited_payload" IS NULL));
