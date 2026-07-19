import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";

/**
 * Integration tests against a REAL PostgreSQL (started by the global setup via
 * embedded-postgres). Run with `npm run test:integration`. These are separate
 * from the fast unit suite so unit runs need no database.
 */
const TEST_DATABASE_URL = "postgresql://stroman:stroman@localhost:54329/stroman_test?schema=public";

export default defineConfig({
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
      "@test": fileURLToPath(new URL("./test", import.meta.url)),
      "server-only": fileURLToPath(new URL("./test/server-only-stub.ts", import.meta.url)),
    },
  },
  test: {
    environment: "node",
    include: ["src/**/*.integration.test.ts"],
    globalSetup: ["./test/db/global-setup.ts"],
    env: {
      DATABASE_URL: TEST_DATABASE_URL,
      NODE_ENV: "test",
    },
    // One shared PostgreSQL server; run test files sequentially so they do not
    // truncate each other's data mid-run.
    fileParallelism: false,
    hookTimeout: 60_000,
    testTimeout: 30_000,
  },
});
