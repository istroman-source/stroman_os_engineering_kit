-- Optimistic-concurrency token for mutable aggregate roots. Distinct from the
-- content_items.version domain revision count. Defaults to 1 for any existing
-- rows (there are none in production yet) and for inserts that omit it.

ALTER TABLE "projects" ADD COLUMN "lock_version" INTEGER NOT NULL DEFAULT 1;
ALTER TABLE "content_items" ADD COLUMN "lock_version" INTEGER NOT NULL DEFAULT 1;
ALTER TABLE "decisions" ADD COLUMN "lock_version" INTEGER NOT NULL DEFAULT 1;
