-- Preserve the exact quality-gated creative result shown to the filmmaker.
ALTER TABLE "creative_briefs"
ADD COLUMN "blueprint" JSONB,
ADD COLUMN "reasoning_provider" TEXT;
