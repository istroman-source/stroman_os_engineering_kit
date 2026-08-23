CREATE TABLE "prepared_location_reconstruction_jobs" (
  "id" TEXT NOT NULL,
  "owner_id" TEXT NOT NULL,
  "prepared_location_id" TEXT NOT NULL,
  "provider_key" TEXT NOT NULL,
  "status" "LocationReconstructionStatus" NOT NULL,
  "failure_code" TEXT,
  "worker_lease_id" TEXT,
  "worker_lease_expires_at" TIMESTAMPTZ(3),
  "created_at" TIMESTAMPTZ(3) NOT NULL,
  "updated_at" TIMESTAMPTZ(3) NOT NULL,
  "completed_at" TIMESTAMPTZ(3),
  "lock_version" INTEGER NOT NULL DEFAULT 1,
  CONSTRAINT "prepared_location_reconstruction_jobs_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "prepared_location_reconstruction_jobs_prepared_location_id_fkey" FOREIGN KEY ("prepared_location_id") REFERENCES "prepared_locations"("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
CREATE INDEX "prepared_location_reconstruction_jobs_owner_id_created_at_idx" ON "prepared_location_reconstruction_jobs"("owner_id", "created_at");
CREATE INDEX "prepared_location_reconstruction_jobs_provider_key_status_worker_lease_expires_at_idx" ON "prepared_location_reconstruction_jobs"("provider_key", "status", "worker_lease_expires_at");
-- One room can have only one live build. The partial index makes concurrent
-- browser submissions an honest conflict instead of two competing Mac jobs.
CREATE UNIQUE INDEX "prepared_location_reconstruction_jobs_one_active_per_location" ON "prepared_location_reconstruction_jobs"("prepared_location_id") WHERE "status" IN ('SUBMITTING', 'PROCESSING');
