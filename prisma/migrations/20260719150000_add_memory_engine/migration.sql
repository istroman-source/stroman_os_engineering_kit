-- CreateTable
CREATE TABLE "entities" (
    "id" TEXT NOT NULL,
    "owner_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "kind" TEXT NOT NULL,
    "created_at" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "entities_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sources" (
    "id" TEXT NOT NULL,
    "owner_id" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "source_type" TEXT NOT NULL,
    "url" TEXT,
    "detail" TEXT,
    "created_at" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "sources_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "memories" (
    "id" TEXT NOT NULL,
    "owner_id" TEXT NOT NULL,
    "entity_id" TEXT NOT NULL,
    "source_id" TEXT,
    "content" TEXT NOT NULL,
    "created_at" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "memories_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "relationships" (
    "id" TEXT NOT NULL,
    "owner_id" TEXT NOT NULL,
    "from_entity_id" TEXT NOT NULL,
    "to_entity_id" TEXT NOT NULL,
    "relation_type" TEXT NOT NULL,
    "created_at" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "relationships_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "insights" (
    "id" TEXT NOT NULL,
    "owner_id" TEXT NOT NULL,
    "statement" TEXT NOT NULL,
    "confidence" DOUBLE PRECISION NOT NULL,
    "evidence" TEXT,
    "created_at" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "insights_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "insight_memories" (
    "insight_id" TEXT NOT NULL,
    "memory_id" TEXT NOT NULL,

    CONSTRAINT "insight_memories_pkey" PRIMARY KEY ("insight_id","memory_id")
);

-- CreateIndex
CREATE INDEX "entities_owner_id_idx" ON "entities"("owner_id");

-- CreateIndex
CREATE INDEX "sources_owner_id_idx" ON "sources"("owner_id");

-- CreateIndex
CREATE INDEX "memories_owner_id_idx" ON "memories"("owner_id");

-- CreateIndex
CREATE INDEX "memories_entity_id_idx" ON "memories"("entity_id");

-- CreateIndex
CREATE INDEX "memories_source_id_idx" ON "memories"("source_id");

-- CreateIndex
CREATE INDEX "relationships_owner_id_idx" ON "relationships"("owner_id");

-- CreateIndex
CREATE INDEX "relationships_from_entity_id_idx" ON "relationships"("from_entity_id");

-- CreateIndex
CREATE INDEX "relationships_to_entity_id_idx" ON "relationships"("to_entity_id");

-- CreateIndex
CREATE INDEX "insights_owner_id_idx" ON "insights"("owner_id");

-- CreateIndex
CREATE INDEX "insight_memories_memory_id_idx" ON "insight_memories"("memory_id");

-- AddForeignKey
ALTER TABLE "memories" ADD CONSTRAINT "memories_entity_id_fkey" FOREIGN KEY ("entity_id") REFERENCES "entities"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "memories" ADD CONSTRAINT "memories_source_id_fkey" FOREIGN KEY ("source_id") REFERENCES "sources"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "relationships" ADD CONSTRAINT "relationships_from_entity_id_fkey" FOREIGN KEY ("from_entity_id") REFERENCES "entities"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "relationships" ADD CONSTRAINT "relationships_to_entity_id_fkey" FOREIGN KEY ("to_entity_id") REFERENCES "entities"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "insight_memories" ADD CONSTRAINT "insight_memories_insight_id_fkey" FOREIGN KEY ("insight_id") REFERENCES "insights"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "insight_memories" ADD CONSTRAINT "insight_memories_memory_id_fkey" FOREIGN KEY ("memory_id") REFERENCES "memories"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
