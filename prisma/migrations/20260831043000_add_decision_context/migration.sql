CREATE TYPE "DecisionOriginStage" AS ENUM ('MANUAL', 'DEVELOP', 'BUILD', 'EDIT');
CREATE TYPE "DecisionArtifactKind" AS ENUM ('MANUAL', 'CREATIVE_DIRECTION', 'SHOT_PLAN', 'EDIT_RECOMMENDATION');

ALTER TABLE "decisions"
ADD COLUMN "origin_stage" "DecisionOriginStage" NOT NULL DEFAULT 'MANUAL',
ADD COLUMN "artifact_kind" "DecisionArtifactKind" NOT NULL DEFAULT 'MANUAL',
ADD COLUMN "artifact_id" TEXT,
ADD COLUMN "artifact_version" INTEGER,
ADD COLUMN "needs_review" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN "review_reason" TEXT,
ADD COLUMN "advisory_tradeoff" TEXT,
ADD COLUMN "advisory_uncertainty" TEXT;

ALTER TABLE "decisions"
ADD CONSTRAINT "decisions_artifact_version_check"
CHECK ("artifact_version" IS NULL OR "artifact_version" > 0);

CREATE INDEX "decisions_project_id_origin_stage_needs_review_idx"
ON "decisions"("project_id", "origin_stage", "needs_review");
