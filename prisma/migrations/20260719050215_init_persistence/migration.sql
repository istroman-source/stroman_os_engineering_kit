-- CreateEnum
CREATE TYPE "ProjectStatus" AS ENUM ('DRAFT', 'ACTIVE', 'COMPLETED', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "ContentStatus" AS ENUM ('DRAFT', 'PUBLISHED', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "ContentType" AS ENUM ('FIRST_PRINCIPLE', 'PROTOCOL', 'STANDARD', 'ENGINE', 'TOOL', 'PLAYBOOK', 'RUBRIC', 'DECISION_TREE', 'CASE_STUDY', 'TAXONOMY_TERM', 'AI_MODULE');

-- CreateEnum
CREATE TYPE "DecisionStatus" AS ENUM ('PROPOSED', 'DECIDED');

-- CreateEnum
CREATE TYPE "ReviewerType" AS ENUM ('HUMAN', 'AI');

-- CreateTable
CREATE TABLE "projects" (
    "id" TEXT NOT NULL,
    "owner_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "status" "ProjectStatus" NOT NULL,
    "created_at" TIMESTAMPTZ(3) NOT NULL,
    "updated_at" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "projects_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "content_items" (
    "id" TEXT NOT NULL,
    "type" "ContentType" NOT NULL,
    "slug" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "status" "ContentStatus" NOT NULL,
    "version" INTEGER NOT NULL,
    "created_at" TIMESTAMPTZ(3) NOT NULL,
    "updated_at" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "content_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "rubrics" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "title" TEXT NOT NULL,

    CONSTRAINT "rubrics_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "rubric_criteria" (
    "id" TEXT NOT NULL,
    "rubric_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "weight" DOUBLE PRECISION NOT NULL,
    "anchor_one" TEXT NOT NULL,
    "anchor_five" TEXT NOT NULL,
    "anchor_ten" TEXT NOT NULL,
    "position" INTEGER NOT NULL,

    CONSTRAINT "rubric_criteria_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "evaluations" (
    "id" TEXT NOT NULL,
    "project_id" TEXT NOT NULL,
    "rubric_id" TEXT NOT NULL,
    "reviewer_type" "ReviewerType" NOT NULL,
    "reviewer_id" TEXT,
    "created_at" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "evaluations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "evaluation_scores" (
    "evaluation_id" TEXT NOT NULL,
    "criterion_id" TEXT NOT NULL,
    "score" INTEGER NOT NULL,
    "justification" TEXT NOT NULL,

    CONSTRAINT "evaluation_scores_pkey" PRIMARY KEY ("evaluation_id","criterion_id")
);

-- CreateTable
CREATE TABLE "decisions" (
    "id" TEXT NOT NULL,
    "project_id" TEXT NOT NULL,
    "question" TEXT NOT NULL,
    "status" "DecisionStatus" NOT NULL,
    "selected_option_id" TEXT,
    "decided_by" TEXT,
    "decision_rationale" TEXT,
    "advisory_recommended_option_id" TEXT,
    "advisory_rationale" TEXT,
    "advisory_confidence" DOUBLE PRECISION,
    "created_at" TIMESTAMPTZ(3) NOT NULL,
    "decided_at" TIMESTAMPTZ(3),

    CONSTRAINT "decisions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "decision_options" (
    "decision_id" TEXT NOT NULL,
    "id" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "rationale" TEXT,
    "position" INTEGER NOT NULL,

    CONSTRAINT "decision_options_pkey" PRIMARY KEY ("decision_id","id")
);

-- CreateIndex
CREATE INDEX "projects_owner_id_idx" ON "projects"("owner_id");

-- CreateIndex
CREATE UNIQUE INDEX "content_items_slug_key" ON "content_items"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "rubrics_slug_key" ON "rubrics"("slug");

-- CreateIndex
CREATE INDEX "rubric_criteria_rubric_id_idx" ON "rubric_criteria"("rubric_id");

-- CreateIndex
CREATE INDEX "evaluations_project_id_idx" ON "evaluations"("project_id");

-- CreateIndex
CREATE INDEX "decisions_project_id_idx" ON "decisions"("project_id");

-- AddForeignKey
ALTER TABLE "rubric_criteria" ADD CONSTRAINT "rubric_criteria_rubric_id_fkey" FOREIGN KEY ("rubric_id") REFERENCES "rubrics"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "evaluations" ADD CONSTRAINT "evaluations_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "projects"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "evaluations" ADD CONSTRAINT "evaluations_rubric_id_fkey" FOREIGN KEY ("rubric_id") REFERENCES "rubrics"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "evaluation_scores" ADD CONSTRAINT "evaluation_scores_evaluation_id_fkey" FOREIGN KEY ("evaluation_id") REFERENCES "evaluations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "decisions" ADD CONSTRAINT "decisions_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "projects"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "decision_options" ADD CONSTRAINT "decision_options_decision_id_fkey" FOREIGN KEY ("decision_id") REFERENCES "decisions"("id") ON DELETE CASCADE ON UPDATE CASCADE;
