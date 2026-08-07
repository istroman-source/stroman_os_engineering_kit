CREATE TYPE "RetrospectiveStatus" AS ENUM ('DRAFT', 'APPROVED');
CREATE TYPE "LessonCategory" AS ENUM ('WORKED', 'FAILED', 'SURPRISED', 'UNUSED_FOOTAGE', 'CLIENT_FEEDBACK', 'AUDIENCE_RESPONSE', 'TIME_SINK', 'REPEAT', 'AVOID');

CREATE TABLE "retrospectives" (
  "id" TEXT NOT NULL,
  "owner_id" TEXT NOT NULL,
  "project_id" TEXT NOT NULL,
  "objective" TEXT NOT NULL,
  "outcome" TEXT NOT NULL,
  "constraints" TEXT,
  "status" "RetrospectiveStatus" NOT NULL,
  "created_at" TIMESTAMPTZ(3) NOT NULL,
  "approved_at" TIMESTAMPTZ(3),
  "approved_by" TEXT,
  "lock_version" INTEGER NOT NULL DEFAULT 1,
  CONSTRAINT "retrospectives_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "retrospectives_id_owner_id_project_id_key" UNIQUE ("id", "owner_id", "project_id"),
  CONSTRAINT "retrospectives_project_owner_fkey" FOREIGN KEY ("project_id", "owner_id") REFERENCES "projects"("id", "owner_id") ON DELETE RESTRICT,
  CONSTRAINT "retrospectives_context_check" CHECK (char_length(btrim("objective")) BETWEEN 1 AND 1000 AND char_length(btrim("outcome")) BETWEEN 1 AND 2000 AND ("constraints" IS NULL OR char_length(btrim("constraints")) BETWEEN 1 AND 2000)),
  CONSTRAINT "retrospectives_approval_shape_check" CHECK (("status" = 'DRAFT' AND "approved_at" IS NULL AND "approved_by" IS NULL) OR ("status" = 'APPROVED' AND "approved_at" IS NOT NULL AND "approved_at" >= "created_at" AND "approved_by" = "owner_id")),
  CONSTRAINT "retrospectives_lock_version_check" CHECK ("lock_version" > 0)
);

CREATE TABLE "lessons" (
  "id" TEXT NOT NULL,
  "retrospective_id" TEXT NOT NULL,
  "category" "LessonCategory" NOT NULL,
  "content" TEXT NOT NULL,
  "position" INTEGER NOT NULL,
  CONSTRAINT "lessons_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "lessons_retrospective_id_position_key" UNIQUE ("retrospective_id", "position"),
  CONSTRAINT "lessons_retrospective_id_fkey" FOREIGN KEY ("retrospective_id") REFERENCES "retrospectives"("id") ON DELETE CASCADE,
  CONSTRAINT "lessons_content_check" CHECK (char_length(btrim("content")) BETWEEN 1 AND 4000),
  CONSTRAINT "lessons_position_check" CHECK ("position" >= 0)
);

CREATE INDEX "retrospectives_project_id_created_at_idx" ON "retrospectives"("project_id", "created_at");
CREATE INDEX "lessons_retrospective_id_idx" ON "lessons"("retrospective_id");
