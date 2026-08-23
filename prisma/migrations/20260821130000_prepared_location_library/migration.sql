CREATE TYPE "PreparedLocationStatus" AS ENUM ('DRAFT', 'UPLOADING', 'PROCESSING', 'READY', 'NEEDS_ATTENTION', 'FAILED');
CREATE TYPE "PreparedLocationInputKind" AS ENUM ('GLB', 'PHOTOS');

CREATE TABLE "prepared_locations" (
  "id" TEXT NOT NULL,
  "owner_id" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "input_kind" "PreparedLocationInputKind" NOT NULL,
  "status" "PreparedLocationStatus" NOT NULL,
  "environment" JSONB,
  "failure_code" TEXT,
  "created_at" TIMESTAMPTZ(3) NOT NULL,
  "updated_at" TIMESTAMPTZ(3) NOT NULL,
  "lock_version" INTEGER NOT NULL DEFAULT 1,
  CONSTRAINT "prepared_locations_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "prepared_locations_owner_id_fkey" FOREIGN KEY ("owner_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

CREATE TABLE "prepared_location_inputs" (
  "id" TEXT NOT NULL,
  "prepared_location_id" TEXT NOT NULL,
  "kind" TEXT NOT NULL,
  "file_name" TEXT NOT NULL,
  "content_type" TEXT NOT NULL,
  "byte_size" INTEGER NOT NULL,
  "content_hash" TEXT NOT NULL,
  "storage_key" TEXT NOT NULL,
  "created_at" TIMESTAMPTZ(3) NOT NULL,
  CONSTRAINT "prepared_location_inputs_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "prepared_location_inputs_prepared_location_id_fkey" FOREIGN KEY ("prepared_location_id") REFERENCES "prepared_locations"("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

CREATE UNIQUE INDEX "prepared_location_inputs_prepared_location_id_content_hash_key" ON "prepared_location_inputs"("prepared_location_id", "content_hash");
CREATE INDEX "prepared_locations_owner_id_status_updated_at_idx" ON "prepared_locations"("owner_id", "status", "updated_at");
CREATE INDEX "prepared_location_inputs_prepared_location_id_created_at_idx" ON "prepared_location_inputs"("prepared_location_id", "created_at");
