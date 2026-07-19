import { execSync } from "node:child_process";
import { startEmbeddedPostgres } from "./embedded-postgres";

/**
 * Vitest global setup for integration tests: start a real PostgreSQL on the fixed
 * test port, apply all migrations with `prisma migrate deploy`, and tear the
 * server down afterwards. Fails loudly (throws) if the database cannot start or
 * migrations cannot apply — integration tests are never silently skipped.
 */
const PORT = 54329;
const DATABASE = "stroman_test";

export default async function globalSetup(): Promise<() => Promise<void>> {
  const postgres = await startEmbeddedPostgres({ port: PORT, database: DATABASE });

  execSync("npx prisma migrate deploy", {
    env: { ...process.env, DATABASE_URL: postgres.url },
    stdio: "inherit",
  });

  return async () => {
    await postgres.stop();
  };
}
