CREATE TYPE "AnalysisRunSourceKind" AS ENUM ('LEGACY', 'TRANSCRIPT', 'VISUAL_MEDIA');

ALTER TABLE "analysis_runs"
ADD COLUMN "source_kind" "AnalysisRunSourceKind" NOT NULL DEFAULT 'LEGACY';

CREATE INDEX "analysis_runs_project_id_source_kind_version_idx"
ON "analysis_runs"("project_id", "source_kind", "version");
