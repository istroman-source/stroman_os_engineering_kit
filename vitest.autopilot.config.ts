import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    include: ["scripts/autopilot/**/*.test.ts"],
    environment: "node",
    testTimeout: 10_000,
  },
});
