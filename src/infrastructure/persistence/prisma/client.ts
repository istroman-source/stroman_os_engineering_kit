import "server-only";

import { PrismaClient } from "@prisma/client";

/**
 * Prisma client lifecycle. Server-only. A single client is reused across the
 * process; in development the instance is cached on `globalThis` so hot reload
 * does not create a new client (and connection) on every change.
 *
 * Query logging is disabled by default so query parameters (which may contain
 * private content) are never written to logs; only warnings and errors are logged.
 *
 * Adapters receive a client by constructor injection (see repositories); this
 * singleton is the default wiring for a long-lived server process. Serverless
 * deployments should review connection handling before adopting it.
 */
export function createPrismaClient(): PrismaClient {
  return new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["warn", "error"] : ["error"],
  });
}

const globalForPrisma = globalThis as unknown as { stromanPrisma?: PrismaClient };

export const prisma: PrismaClient = globalForPrisma.stromanPrisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.stromanPrisma = prisma;
}
