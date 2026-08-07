import { spawnSync } from "node:child_process";
import {
  assertSafeLocalDatabase,
  parseDatabaseMaintenanceArgs,
} from "../src/infrastructure/persistence/database-maintenance";
import { verifySeedReady } from "../prisma/seed";

async function main(): Promise<void> {
  const operation = parseDatabaseMaintenanceArgs(process.argv.slice(2));
  const target = assertSafeLocalDatabase({
    databaseUrl: process.env.DATABASE_URL,
    nodeEnv: process.env.NODE_ENV,
  });

  if (operation === "reset") {
    const result = spawnSync("npx", ["prisma", "migrate", "reset", "--force", "--skip-seed"], {
      env: process.env,
      stdio: "inherit",
    });
    if (result.error) throw result.error;
    if (result.status !== 0) process.exit(result.status ?? 1);
  }

  await verifySeedReady();
  console.log(`Database ${operation} completed for local database ${target.databaseName}.`);
  console.log("No product records seeded; demonstration data is owned by Prompt 018.");
}

void main().catch((error: unknown) => {
  const message = error instanceof Error ? error.message : "Database maintenance failed";
  console.error(message);
  process.exitCode = 1;
});
