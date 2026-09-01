CREATE TYPE "CreativeDevelopmentStatus" AS ENUM ('DRAFT', 'PROCESSING', 'READY', 'FAILED');

ALTER TABLE "creative_briefs"
  ADD COLUMN "development_status" "CreativeDevelopmentStatus" NOT NULL DEFAULT 'DRAFT',
  ADD COLUMN "development_error" TEXT,
  ADD COLUMN "development_started_at" TIMESTAMPTZ(3);

UPDATE "creative_briefs"
SET "development_status" = CASE
  WHEN "blueprint" IS NOT NULL THEN 'READY'::"CreativeDevelopmentStatus"
  ELSE 'DRAFT'::"CreativeDevelopmentStatus"
END;
