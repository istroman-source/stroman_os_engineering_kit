ALTER TABLE "rubric_criteria"
  ADD CONSTRAINT "rubric_criteria_rubric_id_id_key" UNIQUE ("rubric_id", "id");

ALTER TABLE "evaluations"
  ADD CONSTRAINT "evaluations_id_project_id_rubric_id_key" UNIQUE ("id", "project_id", "rubric_id");

ALTER TABLE "evaluation_scores"
  ADD CONSTRAINT "evaluation_scores_evaluation_id_criterion_id_score_key" UNIQUE ("evaluation_id", "criterion_id", "score");

CREATE TABLE "review_runs" (
  "id" TEXT NOT NULL,
  "project_id" TEXT NOT NULL,
  "rubric_id" TEXT NOT NULL,
  "evaluation_id" TEXT NOT NULL,
  "reviewer_id" TEXT NOT NULL,
  "completed_at" TIMESTAMPTZ(3) NOT NULL,
  CONSTRAINT "review_runs_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "review_runs_id_rubric_id_evaluation_id_key" UNIQUE ("id", "rubric_id", "evaluation_id"),
  CONSTRAINT "review_runs_project_id_reviewer_id_fkey" FOREIGN KEY ("project_id", "reviewer_id") REFERENCES "projects"("id", "owner_id") ON DELETE RESTRICT,
  CONSTRAINT "review_runs_rubric_id_fkey" FOREIGN KEY ("rubric_id") REFERENCES "rubrics"("id") ON DELETE RESTRICT,
  CONSTRAINT "review_runs_evaluation_alignment_fkey" FOREIGN KEY ("evaluation_id", "project_id", "rubric_id") REFERENCES "evaluations"("id", "project_id", "rubric_id") ON DELETE RESTRICT
);

CREATE TABLE "review_score_overrides" (
  "review_run_id" TEXT NOT NULL,
  "rubric_id" TEXT NOT NULL,
  "evaluation_id" TEXT NOT NULL,
  "criterion_id" TEXT NOT NULL,
  "original_score" INTEGER NOT NULL,
  "override_score" INTEGER NOT NULL,
  "rationale" TEXT NOT NULL,
  CONSTRAINT "review_score_overrides_pkey" PRIMARY KEY ("review_run_id", "criterion_id"),
  CONSTRAINT "review_score_overrides_scores_check" CHECK ("original_score" BETWEEN 1 AND 10 AND "override_score" BETWEEN 1 AND 10 AND "original_score" <> "override_score"),
  CONSTRAINT "review_score_overrides_rationale_check" CHECK (char_length(btrim("rationale")) BETWEEN 1 AND 2000),
  CONSTRAINT "review_score_overrides_run_fkey" FOREIGN KEY ("review_run_id", "rubric_id", "evaluation_id") REFERENCES "review_runs"("id", "rubric_id", "evaluation_id") ON DELETE CASCADE,
  CONSTRAINT "review_score_overrides_criterion_fkey" FOREIGN KEY ("rubric_id", "criterion_id") REFERENCES "rubric_criteria"("rubric_id", "id") ON DELETE RESTRICT,
  CONSTRAINT "review_score_overrides_source_score_fkey" FOREIGN KEY ("evaluation_id", "criterion_id", "original_score") REFERENCES "evaluation_scores"("evaluation_id", "criterion_id", "score") ON DELETE RESTRICT
);

CREATE INDEX "review_runs_project_id_completed_at_idx" ON "review_runs"("project_id", "completed_at");
CREATE INDEX "review_runs_evaluation_id_idx" ON "review_runs"("evaluation_id");
CREATE INDEX "review_score_overrides_rubric_id_criterion_id_idx" ON "review_score_overrides"("rubric_id", "criterion_id");
