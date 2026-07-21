import { PrismaClient } from "@prisma/client";

/** A Prisma client bound to the integration test database (DATABASE_URL). */
export function createTestPrisma(): PrismaClient {
  return new PrismaClient();
}

/** Truncate all tables between tests for isolation. CASCADE handles FKs. */
export async function resetDatabase(prisma: PrismaClient): Promise<void> {
  await prisma.$executeRawUnsafe(
    'TRUNCATE TABLE "knowledge_reviews","knowledge_observations","acquisition_runs","source_documents","knowledge_sources","insight_memories","insights","relationships","memories","sources","entities","creative_briefs","decision_evidence","decision_options","decisions","evaluation_scores","evaluations","rubric_criteria","rubrics","content_items","projects","user_identities","users" RESTART IDENTITY CASCADE',
  );
}
