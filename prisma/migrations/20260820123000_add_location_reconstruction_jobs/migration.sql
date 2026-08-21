CREATE TYPE "LocationReconstructionStatus" AS ENUM (
  'SUBMITTING',
  'PROCESSING',
  'SUCCEEDED',
  'FAILED',
  'EXPIRED'
);

CREATE TABLE "location_reconstruction_jobs" (
  "id" TEXT NOT NULL,
  "owner_id" TEXT NOT NULL,
  "project_id" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "provider_key" TEXT NOT NULL,
  "provider_job_id" TEXT,
  "status" "LocationReconstructionStatus" NOT NULL,
  "photos" JSONB NOT NULL,
  "environment_id" TEXT,
  "failure_code" TEXT,
  "created_at" TIMESTAMPTZ(3) NOT NULL,
  "updated_at" TIMESTAMPTZ(3) NOT NULL,
  "completed_at" TIMESTAMPTZ(3),
  "lock_version" INTEGER NOT NULL DEFAULT 1,
  CONSTRAINT "location_reconstruction_jobs_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "location_reconstruction_jobs_project_id_owner_id_fkey"
    FOREIGN KEY ("project_id", "owner_id")
    REFERENCES "projects"("id", "owner_id")
    ON DELETE RESTRICT ON UPDATE CASCADE
);

CREATE UNIQUE INDEX "location_reconstruction_jobs_id_owner_id_project_id_key"
  ON "location_reconstruction_jobs"("id", "owner_id", "project_id");
CREATE UNIQUE INDEX "location_reconstruction_jobs_provider_key_provider_job_id_key"
  ON "location_reconstruction_jobs"("provider_key", "provider_job_id");
CREATE INDEX "location_reconstruction_jobs_project_id_created_at_idx"
  ON "location_reconstruction_jobs"("project_id", "created_at");
