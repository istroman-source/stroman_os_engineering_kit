CREATE TYPE "IntegrationSyncStatus" AS ENUM ('SUCCEEDED', 'FAILED');

CREATE TABLE "audit_events" (
  "id" TEXT NOT NULL,
  "owner_id" TEXT NOT NULL,
  "project_id" TEXT NOT NULL,
  "actor_id" TEXT NOT NULL,
  "action" TEXT NOT NULL,
  "subject_type" TEXT NOT NULL,
  "subject_id" TEXT NOT NULL,
  "occurred_at" TIMESTAMPTZ(3) NOT NULL,
  CONSTRAINT "audit_events_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "audit_events_text_bounds" CHECK (char_length("action") BETWEEN 1 AND 120 AND char_length("subject_type") BETWEEN 1 AND 80 AND char_length("subject_id") BETWEEN 1 AND 200),
  CONSTRAINT "audit_events_project_owner_fkey" FOREIGN KEY ("project_id", "owner_id") REFERENCES "projects"("id", "owner_id") ON DELETE RESTRICT ON UPDATE CASCADE
);

CREATE TABLE "external_connections" (
  "id" TEXT NOT NULL,
  "owner_id" TEXT NOT NULL,
  "project_id" TEXT NOT NULL,
  "provider" TEXT NOT NULL,
  "external_account_id" TEXT NOT NULL,
  "display_name" TEXT NOT NULL,
  "created_at" TIMESTAMPTZ(3) NOT NULL,
  CONSTRAINT "external_connections_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "external_connections_text_bounds" CHECK (char_length("provider") BETWEEN 1 AND 80 AND char_length("external_account_id") BETWEEN 1 AND 200 AND char_length("display_name") BETWEEN 1 AND 160),
  CONSTRAINT "external_connections_project_owner_fkey" FOREIGN KEY ("project_id", "owner_id") REFERENCES "projects"("id", "owner_id") ON DELETE RESTRICT ON UPDATE CASCADE
);

CREATE UNIQUE INDEX "external_connections_id_owner_id_project_id_key" ON "external_connections"("id", "owner_id", "project_id");

CREATE TABLE "integration_sync_runs" (
  "id" TEXT NOT NULL,
  "connection_id" TEXT NOT NULL,
  "owner_id" TEXT NOT NULL,
  "project_id" TEXT NOT NULL,
  "request_key" TEXT NOT NULL,
  "status" "IntegrationSyncStatus" NOT NULL,
  "failure_code" TEXT,
  "started_at" TIMESTAMPTZ(3) NOT NULL,
  "completed_at" TIMESTAMPTZ(3) NOT NULL,
  CONSTRAINT "integration_sync_runs_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "integration_sync_runs_shape" CHECK (("status" = 'FAILED') = ("failure_code" IS NOT NULL) AND "completed_at" >= "started_at" AND char_length("request_key") BETWEEN 1 AND 200 AND ("failure_code" IS NULL OR char_length("failure_code") BETWEEN 1 AND 80)),
  CONSTRAINT "integration_sync_runs_project_owner_fkey" FOREIGN KEY ("project_id", "owner_id") REFERENCES "projects"("id", "owner_id") ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT "integration_sync_runs_connection_fkey" FOREIGN KEY ("connection_id", "owner_id", "project_id") REFERENCES "external_connections"("id", "owner_id", "project_id") ON DELETE RESTRICT ON UPDATE CASCADE
);

CREATE UNIQUE INDEX "integration_sync_runs_id_connection_id_owner_id_project_id_key" ON "integration_sync_runs"("id", "connection_id", "owner_id", "project_id");

CREATE TABLE "external_identifiers" (
  "id" TEXT NOT NULL,
  "sync_run_id" TEXT NOT NULL,
  "connection_id" TEXT NOT NULL,
  "owner_id" TEXT NOT NULL,
  "project_id" TEXT NOT NULL,
  "resource_type" TEXT NOT NULL,
  "resource_id" TEXT NOT NULL,
  "external_id" TEXT NOT NULL,
  "created_at" TIMESTAMPTZ(3) NOT NULL,
  CONSTRAINT "external_identifiers_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "external_identifiers_text_bounds" CHECK (char_length("resource_type") BETWEEN 1 AND 80 AND char_length("resource_id") BETWEEN 1 AND 200 AND char_length("external_id") BETWEEN 1 AND 300),
  CONSTRAINT "external_identifiers_project_owner_fkey" FOREIGN KEY ("project_id", "owner_id") REFERENCES "projects"("id", "owner_id") ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT "external_identifiers_connection_fkey" FOREIGN KEY ("connection_id", "owner_id", "project_id") REFERENCES "external_connections"("id", "owner_id", "project_id") ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT "external_identifiers_sync_run_fkey" FOREIGN KEY ("sync_run_id", "connection_id", "owner_id", "project_id") REFERENCES "integration_sync_runs"("id", "connection_id", "owner_id", "project_id") ON DELETE RESTRICT ON UPDATE CASCADE
);

CREATE UNIQUE INDEX "external_connections_project_id_provider_external_account_id_key" ON "external_connections"("project_id", "provider", "external_account_id");
CREATE INDEX "external_connections_project_id_created_at_id_idx" ON "external_connections"("project_id", "created_at", "id");
CREATE UNIQUE INDEX "integration_sync_runs_connection_id_request_key_key" ON "integration_sync_runs"("connection_id", "request_key");
CREATE INDEX "integration_sync_runs_connection_id_completed_at_id_idx" ON "integration_sync_runs"("connection_id", "completed_at", "id");
CREATE UNIQUE INDEX "external_identifiers_connection_id_resource_type_resource_id_key" ON "external_identifiers"("connection_id", "resource_type", "resource_id");
CREATE UNIQUE INDEX "external_identifiers_connection_id_external_id_key" ON "external_identifiers"("connection_id", "external_id");
CREATE INDEX "external_identifiers_sync_run_id_idx" ON "external_identifiers"("sync_run_id");
CREATE INDEX "external_identifiers_project_id_resource_type_resource_id_idx" ON "external_identifiers"("project_id", "resource_type", "resource_id");
CREATE INDEX "audit_events_project_id_occurred_at_id_idx" ON "audit_events"("project_id", "occurred_at", "id");
