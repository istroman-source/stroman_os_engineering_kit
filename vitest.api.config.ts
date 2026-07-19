import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";

/**
 * Real HTTP + PostgreSQL tests for the API delivery layer. Route handlers are
 * invoked with actual Request objects and hit a real database (started by the
 * shared global setup). Run with `npm run test:api`.
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
    include: ["src/**/*.api.test.ts"],
    globalSetup: ["./test/db/global-setup.ts"],
    env: {
      DATABASE_URL: TEST_DATABASE_URL,
      NODE_ENV: "test",
    },
    fileParallelism: false,
    hookTimeout: 60_000,
    testTimeout: 30_000,
  },
});
