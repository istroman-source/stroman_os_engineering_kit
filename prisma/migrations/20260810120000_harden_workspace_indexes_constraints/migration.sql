-- Prompt 017: make owner scoping a PostgreSQL invariant for legacy owner-scoped
-- domains. These constraints reject cross-owner references even when a caller
-- bypasses application repositories.

-- Composite candidate keys support owner-aligned foreign keys.
CREATE UNIQUE INDEX "entities_id_owner_id_key" ON "entities"("id", "owner_id");
CREATE UNIQUE INDEX "sources_id_owner_id_key" ON "sources"("id", "owner_id");
CREATE UNIQUE INDEX "memories_id_owner_id_key" ON "memories"("id", "owner_id");
CREATE UNIQUE INDEX "insights_id_owner_id_key" ON "insights"("id", "owner_id");
CREATE UNIQUE INDEX "story_angles_id_owner_id_key" ON "story_angles"("id", "owner_id");
CREATE UNIQUE INDEX "knowledge_sources_id_owner_id_key" ON "knowledge_sources"("id", "owner_id");
CREATE UNIQUE INDEX "source_documents_id_owner_id_knowledge_source_id_key" ON "source_documents"("id", "owner_id", "knowledge_source_id");
CREATE UNIQUE INDEX "acquisition_runs_id_owner_id_knowledge_source_id_key" ON "acquisition_runs"("id", "owner_id", "knowledge_source_id");
CREATE UNIQUE INDEX "knowledge_observations_id_owner_id_key" ON "knowledge_observations"("id", "owner_id");
CREATE UNIQUE INDEX "knowledge_reviews_knowledge_observation_id_owner_id_key" ON "knowledge_reviews"("knowledge_observation_id", "owner_id");
CREATE UNIQUE INDEX "knowledge_reviews_id_owner_id_key" ON "knowledge_reviews"("id", "owner_id");

-- Replace id-only relationships with owner-aligned relationships.
ALTER TABLE "memories" DROP CONSTRAINT "memories_entity_id_fkey";
ALTER TABLE "memories" DROP CONSTRAINT "memories_source_id_fkey";
ALTER TABLE "relationships" DROP CONSTRAINT "relationships_from_entity_id_fkey";
ALTER TABLE "relationships" DROP CONSTRAINT "relationships_to_entity_id_fkey";
ALTER TABLE "story_angles" DROP CONSTRAINT "story_angles_project_id_fkey";
ALTER TABLE "story_evidence" DROP CONSTRAINT "story_evidence_story_angle_id_fkey";
ALTER TABLE "story_evidence" DROP CONSTRAINT "story_evidence_memory_id_fkey";
ALTER TABLE "story_evidence" DROP CONSTRAINT "story_evidence_insight_id_fkey";
ALTER TABLE "story_critiques" DROP CONSTRAINT "story_critiques_story_angle_id_fkey";
ALTER TABLE "source_documents" DROP CONSTRAINT "source_documents_knowledge_source_id_fkey";
ALTER TABLE "acquisition_runs" DROP CONSTRAINT "acquisition_runs_knowledge_source_id_fkey";
ALTER TABLE "knowledge_observations" DROP CONSTRAINT "knowledge_observations_source_document_id_fkey";
ALTER TABLE "knowledge_observations" DROP CONSTRAINT "knowledge_observations_knowledge_source_id_fkey";
ALTER TABLE "knowledge_observations" DROP CONSTRAINT "knowledge_observations_acquisition_run_id_fkey";
ALTER TABLE "knowledge_reviews" DROP CONSTRAINT "knowledge_reviews_knowledge_observation_id_fkey";
ALTER TABLE "observation_materializations" DROP CONSTRAINT "observation_materializations_knowledge_observation_id_fkey";
ALTER TABLE "observation_materializations" DROP CONSTRAINT "observation_materializations_knowledge_review_id_fkey";

ALTER TABLE "memories" ADD CONSTRAINT "memories_entity_id_owner_id_fkey" FOREIGN KEY ("entity_id", "owner_id") REFERENCES "entities"("id", "owner_id") ON DELETE RESTRICT ON UPDATE CASCADE;
-- PostgreSQL 15+ column-list SET NULL preserves the existing provenance cleanup
-- behavior without clearing the required owner_id scope column.
ALTER TABLE "memories" ADD CONSTRAINT "memories_source_id_owner_id_fkey" FOREIGN KEY ("source_id", "owner_id") REFERENCES "sources"("id", "owner_id") ON DELETE SET NULL ("source_id") ON UPDATE CASCADE;
ALTER TABLE "relationships" ADD CONSTRAINT "relationships_from_entity_id_owner_id_fkey" FOREIGN KEY ("from_entity_id", "owner_id") REFERENCES "entities"("id", "owner_id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "relationships" ADD CONSTRAINT "relationships_to_entity_id_owner_id_fkey" FOREIGN KEY ("to_entity_id", "owner_id") REFERENCES "entities"("id", "owner_id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "story_angles" ADD CONSTRAINT "story_angles_project_id_owner_id_fkey" FOREIGN KEY ("project_id", "owner_id") REFERENCES "projects"("id", "owner_id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "story_evidence" ADD CONSTRAINT "story_evidence_story_angle_id_owner_id_fkey" FOREIGN KEY ("story_angle_id", "owner_id") REFERENCES "story_angles"("id", "owner_id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "story_evidence" ADD CONSTRAINT "story_evidence_memory_id_owner_id_fkey" FOREIGN KEY ("memory_id", "owner_id") REFERENCES "memories"("id", "owner_id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "story_evidence" ADD CONSTRAINT "story_evidence_insight_id_owner_id_fkey" FOREIGN KEY ("insight_id", "owner_id") REFERENCES "insights"("id", "owner_id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "story_critiques" ADD CONSTRAINT "story_critiques_story_angle_id_owner_id_fkey" FOREIGN KEY ("story_angle_id", "owner_id") REFERENCES "story_angles"("id", "owner_id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "source_documents" ADD CONSTRAINT "source_documents_knowledge_source_id_owner_id_fkey" FOREIGN KEY ("knowledge_source_id", "owner_id") REFERENCES "knowledge_sources"("id", "owner_id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "acquisition_runs" ADD CONSTRAINT "acquisition_runs_knowledge_source_id_owner_id_fkey" FOREIGN KEY ("knowledge_source_id", "owner_id") REFERENCES "knowledge_sources"("id", "owner_id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "knowledge_observations" ADD CONSTRAINT "knowledge_observations_source_document_alignment_fkey" FOREIGN KEY ("source_document_id", "owner_id", "knowledge_source_id") REFERENCES "source_documents"("id", "owner_id", "knowledge_source_id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "knowledge_observations" ADD CONSTRAINT "knowledge_observations_knowledge_source_alignment_fkey" FOREIGN KEY ("knowledge_source_id", "owner_id") REFERENCES "knowledge_sources"("id", "owner_id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "knowledge_observations" ADD CONSTRAINT "knowledge_observations_acquisition_run_alignment_fkey" FOREIGN KEY ("acquisition_run_id", "owner_id", "knowledge_source_id") REFERENCES "acquisition_runs"("id", "owner_id", "knowledge_source_id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "knowledge_reviews" ADD CONSTRAINT "knowledge_reviews_observation_owner_fkey" FOREIGN KEY ("knowledge_observation_id", "owner_id") REFERENCES "knowledge_observations"("id", "owner_id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "observation_materializations" ADD CONSTRAINT "observation_materializations_observation_owner_fkey" FOREIGN KEY ("knowledge_observation_id", "owner_id") REFERENCES "knowledge_observations"("id", "owner_id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "observation_materializations" ADD CONSTRAINT "observation_materializations_review_owner_fkey" FOREIGN KEY ("knowledge_review_id", "owner_id") REFERENCES "knowledge_reviews"("id", "owner_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- Query-backed indexes match repository filters followed by deterministic time ordering.
DROP INDEX "entities_owner_id_idx";
DROP INDEX "sources_owner_id_idx";
DROP INDEX "memories_owner_id_idx";
DROP INDEX "memories_entity_id_idx";
DROP INDEX "memories_source_id_idx";
DROP INDEX "relationships_owner_id_idx";
DROP INDEX "relationships_from_entity_id_idx";
DROP INDEX "relationships_to_entity_id_idx";
DROP INDEX "insights_owner_id_idx";
DROP INDEX "story_angles_owner_id_idx";
DROP INDEX "story_angles_project_id_idx";
DROP INDEX "story_evidence_owner_id_idx";
DROP INDEX "story_evidence_story_angle_id_idx";
DROP INDEX "story_evidence_memory_id_idx";
DROP INDEX "story_evidence_insight_id_idx";
DROP INDEX "story_critiques_owner_id_idx";
DROP INDEX "story_critiques_story_angle_id_idx";
DROP INDEX "knowledge_sources_owner_id_idx";
DROP INDEX "source_documents_owner_id_idx";
DROP INDEX "source_documents_knowledge_source_id_idx";
DROP INDEX "acquisition_runs_owner_id_idx";
DROP INDEX "acquisition_runs_knowledge_source_id_idx";
DROP INDEX "knowledge_observations_owner_id_idx";
DROP INDEX "knowledge_observations_source_document_id_idx";
DROP INDEX "knowledge_observations_acquisition_run_id_idx";
DROP INDEX "knowledge_observations_knowledge_source_id_idx";
DROP INDEX "knowledge_reviews_owner_id_idx";
DROP INDEX "observation_materializations_owner_id_idx";
DROP INDEX "observation_materializations_knowledge_review_id_idx";

CREATE INDEX "entities_owner_id_created_at_idx" ON "entities"("owner_id", "created_at");
CREATE INDEX "sources_owner_id_created_at_idx" ON "sources"("owner_id", "created_at");
CREATE INDEX "memories_owner_id_created_at_idx" ON "memories"("owner_id", "created_at");
CREATE INDEX "memories_entity_id_owner_id_idx" ON "memories"("entity_id", "owner_id");
CREATE INDEX "memories_entity_id_created_at_idx" ON "memories"("entity_id", "created_at");
CREATE INDEX "memories_source_id_owner_id_idx" ON "memories"("source_id", "owner_id");
CREATE INDEX "memories_source_id_created_at_idx" ON "memories"("source_id", "created_at");
CREATE INDEX "relationships_owner_id_created_at_idx" ON "relationships"("owner_id", "created_at");
CREATE INDEX "relationships_from_entity_id_owner_id_idx" ON "relationships"("from_entity_id", "owner_id");
CREATE INDEX "relationships_from_entity_id_created_at_idx" ON "relationships"("from_entity_id", "created_at");
CREATE INDEX "relationships_to_entity_id_owner_id_idx" ON "relationships"("to_entity_id", "owner_id");
CREATE INDEX "relationships_to_entity_id_created_at_idx" ON "relationships"("to_entity_id", "created_at");
CREATE INDEX "insights_owner_id_created_at_idx" ON "insights"("owner_id", "created_at");
CREATE INDEX "story_angles_owner_id_created_at_idx" ON "story_angles"("owner_id", "created_at");
CREATE INDEX "story_angles_project_id_created_at_idx" ON "story_angles"("project_id", "created_at");
CREATE INDEX "story_evidence_owner_id_created_at_idx" ON "story_evidence"("owner_id", "created_at");
CREATE INDEX "story_evidence_story_angle_id_owner_id_idx" ON "story_evidence"("story_angle_id", "owner_id");
CREATE INDEX "story_evidence_story_angle_id_created_at_idx" ON "story_evidence"("story_angle_id", "created_at");
CREATE INDEX "story_evidence_memory_id_owner_id_idx" ON "story_evidence"("memory_id", "owner_id");
CREATE INDEX "story_evidence_insight_id_owner_id_idx" ON "story_evidence"("insight_id", "owner_id");
CREATE INDEX "story_critiques_owner_id_created_at_idx" ON "story_critiques"("owner_id", "created_at");
CREATE INDEX "story_critiques_story_angle_id_owner_id_idx" ON "story_critiques"("story_angle_id", "owner_id");
CREATE INDEX "story_critiques_story_angle_id_created_at_idx" ON "story_critiques"("story_angle_id", "created_at");
CREATE INDEX "knowledge_sources_owner_id_created_at_idx" ON "knowledge_sources"("owner_id", "created_at");
CREATE INDEX "source_documents_owner_id_created_at_idx" ON "source_documents"("owner_id", "created_at");
CREATE INDEX "source_documents_knowledge_source_id_created_at_idx" ON "source_documents"("knowledge_source_id", "created_at");
CREATE INDEX "acquisition_runs_owner_id_created_at_idx" ON "acquisition_runs"("owner_id", "created_at");
CREATE INDEX "acquisition_runs_knowledge_source_id_created_at_idx" ON "acquisition_runs"("knowledge_source_id", "created_at");
CREATE INDEX "knowledge_observations_owner_id_created_at_idx" ON "knowledge_observations"("owner_id", "created_at");
CREATE INDEX "knowledge_observations_document_alignment_idx" ON "knowledge_observations"("source_document_id", "owner_id", "knowledge_source_id");
CREATE INDEX "knowledge_observations_source_document_id_created_at_idx" ON "knowledge_observations"("source_document_id", "created_at");
CREATE INDEX "knowledge_observations_run_alignment_idx" ON "knowledge_observations"("acquisition_run_id", "owner_id", "knowledge_source_id");
CREATE INDEX "knowledge_observations_acquisition_run_id_created_at_idx" ON "knowledge_observations"("acquisition_run_id", "created_at");
CREATE INDEX "knowledge_observations_knowledge_source_id_owner_id_idx" ON "knowledge_observations"("knowledge_source_id", "owner_id");
CREATE INDEX "knowledge_reviews_owner_id_reviewed_at_idx" ON "knowledge_reviews"("owner_id", "reviewed_at");
CREATE INDEX "observation_materializations_owner_id_created_at_idx" ON "observation_materializations"("owner_id", "created_at");
CREATE INDEX "observation_materializations_knowledge_review_id_owner_id_idx" ON "observation_materializations"("knowledge_review_id", "owner_id");
