-- Trace accepted Knowledge Acquisition observations to materialized Memory records.
CREATE TABLE "observation_materializations" (
  "knowledge_observation_id" TEXT NOT NULL,
  "knowledge_review_id" TEXT NOT NULL,
  "record_type" "ObservationKind" NOT NULL,
  "record_id" TEXT NOT NULL,
  "owner_id" TEXT NOT NULL,
  "created_at" TIMESTAMPTZ(3) NOT NULL,
  CONSTRAINT "observation_materializations_pkey" PRIMARY KEY ("knowledge_observation_id", "record_type")
);

CREATE INDEX "observation_materializations_record_type_record_id_idx" ON "observation_materializations"("record_type", "record_id");
CREATE INDEX "observation_materializations_owner_id_idx" ON "observation_materializations"("owner_id");
CREATE INDEX "observation_materializations_knowledge_review_id_idx" ON "observation_materializations"("knowledge_review_id");

ALTER TABLE "observation_materializations" ADD CONSTRAINT "observation_materializations_knowledge_observation_id_fkey" FOREIGN KEY ("knowledge_observation_id") REFERENCES "knowledge_observations"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "observation_materializations" ADD CONSTRAINT "observation_materializations_knowledge_review_id_fkey" FOREIGN KEY ("knowledge_review_id") REFERENCES "knowledge_reviews"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
