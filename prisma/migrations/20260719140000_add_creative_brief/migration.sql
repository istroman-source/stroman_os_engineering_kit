-- CreateTable
CREATE TABLE "creative_briefs" (
    "id" TEXT NOT NULL,
    "project_id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "client" TEXT NOT NULL,
    "project_type" TEXT NOT NULL,
    "creative_goal" TEXT NOT NULL,
    "target_audience" TEXT NOT NULL,
    "desired_emotion" TEXT NOT NULL,
    "context" TEXT NOT NULL,
    "created_at" TIMESTAMPTZ(3) NOT NULL,
    "updated_at" TIMESTAMPTZ(3) NOT NULL,
    "lock_version" INTEGER NOT NULL DEFAULT 1,

    CONSTRAINT "creative_briefs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "creative_briefs_project_id_key" ON "creative_briefs"("project_id");

-- AddForeignKey
ALTER TABLE "creative_briefs" ADD CONSTRAINT "creative_briefs_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "projects"("id") ON DELETE CASCADE ON UPDATE CASCADE;
