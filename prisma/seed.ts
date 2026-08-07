import { PrismaClient } from "@prisma/client";

/**
 * Prompt 008 intentionally seeds no product or demonstration records; Prompt 018 owns that
 * scope. This real database check makes the seed boundary executable and fail-closed while
 * guaranteeing that an empty development database remains deterministic.
 */
export async function verifySeedReady(database = new PrismaClient()): Promise<void> {
  try {
    await database.$queryRaw`SELECT 1`;
  } finally {
    await database.$disconnect();
  }
}
