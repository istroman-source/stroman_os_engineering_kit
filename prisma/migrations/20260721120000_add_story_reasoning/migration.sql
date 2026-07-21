-- Story Reasoning Engine: story angles, cited evidence, and scored critiques.
-- Hand-authored to include a partial unique index and CHECK constraints that the
-- Prisma schema language cannot express. Applied via `prisma migrate deploy`.

-- CreateEnum
CREATE TYPE "StoryAngleStatus" AS ENUM ('DRAFT', 'EVALUATED', 'SELECTED', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "EvidenceRole" AS ENUM ('PRIMARY', 'SUPPORTING', 'CONTEXTUAL', 'COUNTERPOINT');

-- CreateEnum
CREATE TYPE "StoryRecommendation" AS ENUM ('SELECT', 'REVISE', 'ARCHIVE');

-- CreateEnum
CREATE TYPE "CriticType" AS ENUM ('AI', 'HUMAN');

-- CreateTable
CREATE TABLE "story_angles" (
    "id" TEXT NOT NULL,
    "owner_id" TEXT NOT NULL,
    "project_id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "theme" TEXT NOT NULL,
    "premise" TEXT NOT NULL,
    "audience_promise" TEXT NOT NULL,
    "central_question" TEXT NOT NULL,
    "status" "StoryAngleStatus" NOT NULL,
    "created_at" TIMESTAMPTZ(3) NOT NULL,
    "lock_version" INTEGER NOT NULL DEFAULT 1,

    CONSTRAINT "story_angles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "story_evidence" (
    "id" TEXT NOT NULL,
    "owner_id" TEXT NOT NULL,
    "story_angle_id" TEXT NOT NULL,
    "memory_id" TEXT,
    "insight_id" TEXT,
    "role" "EvidenceRole" NOT NULL,
    "reason" TEXT NOT NULL,
    "created_at" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "story_evidence_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "story_critiques" (
    "id" TEXT NOT NULL,
    "owner_id" TEXT NOT NULL,
    "story_angle_id" TEXT NOT NULL,
    "critic_type" "CriticType" NOT NULL,
    "critic_id" TEXT,
    "evidence_strength" INTEGER NOT NULL,
    "emotional_potential" INTEGER NOT NULL,
    "visual_potential" INTEGER NOT NULL,
    "brand_alignment" INTEGER NOT NULL,
    "originality" INTEGER NOT NULL,
    "interview_potential" INTEGER NOT NULL,
    "strengths" TEXT NOT NULL,
    "weaknesses" TEXT NOT NULL,
    "recommendation" "StoryRecommendation" NOT NULL,
    "rationale" TEXT NOT NULL,
    "created_at" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "story_critiques_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "story_angles_owner_id_idx" ON "story_angles"("owner_id");

-- CreateIndex
CREATE INDEX "story_angles_project_id_idx" ON "story_angles"("project_id");

-- CreateIndex (partial unique): at most one SELECTED angle per project.
CREATE UNIQUE INDEX "story_angles_one_selected_per_project"
    ON "story_angles"("project_id")
    WHERE "status" = 'SELECTED';

-- CreateIndex
CREATE INDEX "story_evidence_owner_id_idx" ON "story_evidence"("owner_id");

-- CreateIndex
CREATE INDEX "story_evidence_story_angle_id_idx" ON "story_evidence"("story_angle_id");

-- CreateIndex
CREATE INDEX "story_evidence_memory_id_idx" ON "story_evidence"("memory_id");

-- CreateIndex
CREATE INDEX "story_evidence_insight_id_idx" ON "story_evidence"("insight_id");

-- CreateIndex
CREATE INDEX "story_critiques_owner_id_idx" ON "story_critiques"("owner_id");

-- CreateIndex
CREATE INDEX "story_critiques_story_angle_id_idx" ON "story_critiques"("story_angle_id");

-- AddForeignKey
ALTER TABLE "story_angles" ADD CONSTRAINT "story_angles_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "projects"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "story_evidence" ADD CONSTRAINT "story_evidence_story_angle_id_fkey" FOREIGN KEY ("story_angle_id") REFERENCES "story_angles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "story_evidence" ADD CONSTRAINT "story_evidence_memory_id_fkey" FOREIGN KEY ("memory_id") REFERENCES "memories"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "story_evidence" ADD CONSTRAINT "story_evidence_insight_id_fkey" FOREIGN KEY ("insight_id") REFERENCES "insights"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "story_critiques" ADD CONSTRAINT "story_critiques_story_angle_id_fkey" FOREIGN KEY ("story_angle_id") REFERENCES "story_angles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Story evidence must reference EXACTLY ONE of a memory or an insight.
ALTER TABLE "story_evidence"
  ADD CONSTRAINT "story_evidence_exactly_one_reference"
  CHECK (("memory_id" IS NULL) <> ("insight_id" IS NULL));

-- Each critique dimension is an integer score on the 1..10 scale.
ALTER TABLE "story_critiques"
  ADD CONSTRAINT "story_critiques_evidence_strength_range" CHECK ("evidence_strength" >= 1 AND "evidence_strength" <= 10),
  ADD CONSTRAINT "story_critiques_emotional_potential_range" CHECK ("emotional_potential" >= 1 AND "emotional_potential" <= 10),
  ADD CONSTRAINT "story_critiques_visual_potential_range" CHECK ("visual_potential" >= 1 AND "visual_potential" <= 10),
  ADD CONSTRAINT "story_critiques_brand_alignment_range" CHECK ("brand_alignment" >= 1 AND "brand_alignment" <= 10),
  ADD CONSTRAINT "story_critiques_originality_range" CHECK ("originality" >= 1 AND "originality" <= 10),
  ADD CONSTRAINT "story_critiques_interview_potential_range" CHECK ("interview_potential" >= 1 AND "interview_potential" <= 10);

-- A HUMAN critique must name its critic; an AI critique must not.
ALTER TABLE "story_critiques"
  ADD CONSTRAINT "story_critiques_critic_authority"
  CHECK (
    ("critic_type" = 'HUMAN' AND "critic_id" IS NOT NULL) OR
    ("critic_type" = 'AI' AND "critic_id" IS NULL)
  );
