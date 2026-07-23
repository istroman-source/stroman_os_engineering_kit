CREATE TYPE "AnalysisRunStatus" AS ENUM ('PENDING', 'RUNNING', 'COMPLETED', 'FAILED');
CREATE TYPE "AnalysisOutputKind" AS ENUM ('OBSERVATION', 'INFERENCE', 'THEME', 'NARRATIVE', 'EDIT_RECOMMENDATION', 'PROMPT');

CREATE TABLE "analysis_runs" (
  "id" TEXT NOT NULL,
  "owner_id" TEXT NOT NULL,
  "project_id" TEXT NOT NULL,
  "version" INTEGER NOT NULL,
  "status" "AnalysisRunStatus" NOT NULL,
  "failure_reason" TEXT,
  "created_at" TIMESTAMPTZ(3) NOT NULL,
  "started_at" TIMESTAMPTZ(3),
  "completed_at" TIMESTAMPTZ(3),
  CONSTRAINT "analysis_runs_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "analysis_runs_version_positive" CHECK ("version" > 0),
  CONSTRAINT "analysis_runs_lifecycle_shape" CHECK (
    ("status" = 'PENDING' AND "started_at" IS NULL AND "completed_at" IS NULL AND "failure_reason" IS NULL) OR
    ("status" = 'RUNNING' AND "started_at" IS NOT NULL AND "completed_at" IS NULL AND "failure_reason" IS NULL) OR
    ("status" = 'COMPLETED' AND "started_at" IS NOT NULL AND "completed_at" IS NOT NULL AND "failure_reason" IS NULL) OR
    ("status" = 'FAILED' AND "started_at" IS NOT NULL AND "completed_at" IS NOT NULL AND "failure_reason" IS NOT NULL)
  )
);

CREATE UNIQUE INDEX "analysis_runs_project_id_version_key" ON "analysis_runs"("project_id", "version");
CREATE INDEX "analysis_runs_project_id_created_at_idx" ON "analysis_runs"("project_id", "created_at");
ALTER TABLE "analysis_runs" ADD CONSTRAINT "analysis_runs_project_alignment_fkey"
  FOREIGN KEY ("project_id", "owner_id") REFERENCES "projects"("id", "owner_id") ON DELETE RESTRICT ON UPDATE CASCADE;

CREATE TABLE "analysis_outputs" (
  "id" TEXT NOT NULL,
  "analysis_run_id" TEXT NOT NULL,
  "kind" "AnalysisOutputKind" NOT NULL,
  "content" TEXT NOT NULL,
  "confidence" DOUBLE PRECISION,
  "created_at" TIMESTAMPTZ(3) NOT NULL,
  CONSTRAINT "analysis_outputs_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "analysis_outputs_confidence_range" CHECK ("confidence" IS NULL OR ("confidence" >= 0 AND "confidence" <= 1))
);
CREATE INDEX "analysis_outputs_analysis_run_id_kind_idx" ON "analysis_outputs"("analysis_run_id", "kind");
ALTER TABLE "analysis_outputs" ADD CONSTRAINT "analysis_outputs_analysis_run_id_fkey"
  FOREIGN KEY ("analysis_run_id") REFERENCES "analysis_runs"("id") ON DELETE CASCADE ON UPDATE CASCADE;

CREATE TABLE "analysis_output_evidence" (
  "analysis_output_id" TEXT NOT NULL,
  "evidence_reference_id" TEXT NOT NULL,
  "position" INTEGER NOT NULL,
  CONSTRAINT "analysis_output_evidence_pkey" PRIMARY KEY ("analysis_output_id", "evidence_reference_id"),
  CONSTRAINT "analysis_output_evidence_position_nonnegative" CHECK ("position" >= 0)
);
CREATE UNIQUE INDEX "analysis_output_evidence_analysis_output_id_position_key" ON "analysis_output_evidence"("analysis_output_id", "position");
ALTER TABLE "analysis_output_evidence" ADD CONSTRAINT "analysis_output_evidence_output_fkey"
  FOREIGN KEY ("analysis_output_id") REFERENCES "analysis_outputs"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "analysis_output_evidence" ADD CONSTRAINT "analysis_output_evidence_reference_fkey"
  FOREIGN KEY ("evidence_reference_id") REFERENCES "evidence_references"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

CREATE TABLE "analysis_recommendations" (
  "id" TEXT NOT NULL,
  "analysis_run_id" TEXT NOT NULL,
  "title" TEXT NOT NULL,
  "rationale" TEXT NOT NULL,
  "confidence" DOUBLE PRECISION NOT NULL,
  "decision_id" TEXT,
  "created_at" TIMESTAMPTZ(3) NOT NULL,
  CONSTRAINT "analysis_recommendations_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "analysis_recommendations_confidence_range" CHECK ("confidence" >= 0 AND "confidence" <= 1)
);
CREATE INDEX "analysis_recommendations_analysis_run_id_idx" ON "analysis_recommendations"("analysis_run_id");
CREATE INDEX "analysis_recommendations_decision_id_idx" ON "analysis_recommendations"("decision_id");
ALTER TABLE "analysis_recommendations" ADD CONSTRAINT "analysis_recommendations_analysis_run_id_fkey"
  FOREIGN KEY ("analysis_run_id") REFERENCES "analysis_runs"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "analysis_recommendations" ADD CONSTRAINT "analysis_recommendations_decision_id_fkey"
  FOREIGN KEY ("decision_id") REFERENCES "decisions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

CREATE TABLE "analysis_recommendation_evidence" (
  "analysis_recommendation_id" TEXT NOT NULL,
  "evidence_reference_id" TEXT NOT NULL,
  "position" INTEGER NOT NULL,
  CONSTRAINT "analysis_recommendation_evidence_pkey" PRIMARY KEY ("analysis_recommendation_id", "evidence_reference_id"),
  CONSTRAINT "analysis_recommendation_evidence_position_nonnegative" CHECK ("position" >= 0)
);
CREATE UNIQUE INDEX "analysis_recommendation_evidence_recommendation_position_key" ON "analysis_recommendation_evidence"("analysis_recommendation_id", "position");
ALTER TABLE "analysis_recommendation_evidence" ADD CONSTRAINT "analysis_recommendation_evidence_recommendation_fkey"
  FOREIGN KEY ("analysis_recommendation_id") REFERENCES "analysis_recommendations"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "analysis_recommendation_evidence" ADD CONSTRAINT "analysis_recommendation_evidence_reference_fkey"
  FOREIGN KEY ("evidence_reference_id") REFERENCES "evidence_references"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
