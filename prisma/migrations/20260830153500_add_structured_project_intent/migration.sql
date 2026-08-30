ALTER TABLE "creative_briefs"
  ADD COLUMN "runtime_target" TEXT NOT NULL DEFAULT '',
  ADD COLUMN "delivery_platform" TEXT NOT NULL DEFAULT '',
  ADD COLUMN "references" TEXT NOT NULL DEFAULT '',
  ADD COLUMN "restrictions" TEXT NOT NULL DEFAULT '',
  ADD COLUMN "client_requirements" TEXT NOT NULL DEFAULT '',
  ADD COLUMN "non_negotiables" TEXT NOT NULL DEFAULT '',
  ADD COLUMN "success_criteria" TEXT NOT NULL DEFAULT '';

CREATE TABLE "creative_brief_revisions" (
  "id" TEXT NOT NULL,
  "creative_brief_id" TEXT NOT NULL,
  "project_id" TEXT NOT NULL,
  "version" INTEGER NOT NULL,
  "snapshot" JSONB NOT NULL,
  "created_at" TIMESTAMPTZ(3) NOT NULL,
  CONSTRAINT "creative_brief_revisions_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "creative_brief_revisions_creative_brief_id_version_key"
  ON "creative_brief_revisions"("creative_brief_id", "version");
CREATE INDEX "creative_brief_revisions_project_id_version_idx"
  ON "creative_brief_revisions"("project_id", "version");

ALTER TABLE "creative_brief_revisions"
  ADD CONSTRAINT "creative_brief_revisions_creative_brief_id_fkey"
  FOREIGN KEY ("creative_brief_id") REFERENCES "creative_briefs"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "creative_brief_revisions"
  ADD CONSTRAINT "creative_brief_revisions_project_id_fkey"
  FOREIGN KEY ("project_id") REFERENCES "projects"("id") ON DELETE CASCADE ON UPDATE CASCADE;
