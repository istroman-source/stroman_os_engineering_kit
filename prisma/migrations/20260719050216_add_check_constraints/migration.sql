-- Hand-authored migration: numeric integrity CHECK constraints.
-- Rationale: the Prisma schema language cannot express CHECK constraints, but
-- these invariants are important enough to enforce in the database (defence in
-- depth beyond domain validation). Applied via `prisma migrate deploy`.
-- Note: `prisma migrate dev` cannot represent CHECK constraints in the schema, so
-- it may report drift; the canonical workflow for this project uses
-- `migrate deploy` (see docs/PERSISTENCE_ARCHITECTURE.md).

ALTER TABLE "rubric_criteria"
  ADD CONSTRAINT "rubric_criteria_weight_positive" CHECK ("weight" > 0);

ALTER TABLE "evaluation_scores"
  ADD CONSTRAINT "evaluation_scores_score_range" CHECK ("score" >= 1 AND "score" <= 10);

ALTER TABLE "content_items"
  ADD CONSTRAINT "content_items_version_positive" CHECK ("version" >= 1);

ALTER TABLE "decisions"
  ADD CONSTRAINT "decisions_advisory_confidence_range"
  CHECK ("advisory_confidence" IS NULL OR ("advisory_confidence" >= 0 AND "advisory_confidence" <= 1));
