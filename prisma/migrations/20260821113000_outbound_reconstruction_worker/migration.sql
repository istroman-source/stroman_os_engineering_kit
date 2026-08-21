-- Outbound Mac workers lease durable jobs from Stroman instead of requiring an
-- internet-reachable tunnel. A lost lease is safely reclaimable after expiry.
ALTER TABLE "location_reconstruction_jobs"
  ADD COLUMN "worker_lease_id" TEXT,
  ADD COLUMN "worker_lease_expires_at" TIMESTAMPTZ(3);

CREATE INDEX "location_reconstruction_jobs_provider_key_status_worker_lease_expires_at_idx"
  ON "location_reconstruction_jobs"("provider_key", "status", "worker_lease_expires_at");
