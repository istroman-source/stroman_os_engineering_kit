import { PrismaClient } from "@prisma/client";

/** A Prisma client bound to the integration test database (DATABASE_URL). */
export function createTestPrisma(): PrismaClient {
  return new PrismaClient();
}

/** Truncate all tables between tests for isolation. CASCADE handles FKs. */
export async function resetDatabase(prisma: PrismaClient): Promise<void> {
  await prisma.$executeRawUnsafe(
    'TRUNCATE TABLE "decision_options","decisions","evaluation_scores","evaluations","rubric_criteria","rubrics","content_items","projects" RESTART IDENTITY CASCADE',
  );
}
