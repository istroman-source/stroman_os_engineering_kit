import { defineConfig, devices } from "@playwright/test";

const PORT = Number(process.env.PLAYWRIGHT_PORT ?? "3000");
const baseURL = `http://localhost:${PORT}`;

/**
 * Playwright end-to-end configuration.
 * Boots the production build and runs smoke tests against the app shell.
 */
export default defineConfig({
  testDir: "./e2e",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  reporter: process.env.CI ? "github" : "list",
  use: {
    baseURL,
    trace: "on-first-retry",
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
    {
      name: "mobile-chromium",
      use: { ...devices["Pixel 5"], viewport: { width: 390, height: 844 } },
    },
  ],
  webServer: {
    // Webpack avoids Turbopack's local CSS worker port on restricted macOS
    // runners. The release Docker image is still built with the default compiler.
    command: "npm run build -- --webpack && npm run start",
    url: baseURL,
    env: {
      PORT: String(PORT),
      NEXT_PUBLIC_APP_URL: "https://e2e.stroman.invalid",
      DATABASE_URL: "postgresql://e2e:e2e@localhost:54329/e2e",
      SUPABASE_URL: "https://e2e.supabase.invalid",
      SUPABASE_ANON_KEY: "synthetic-e2e-key",
      APP_ALLOWED_ORIGINS: baseURL,
      SUPABASE_EMAIL_REDIRECT_URL: "https://e2e.stroman.invalid/auth/callback",
      STROMAN_PRIVATE_BETA_OWNER_EMAIL: "owner@e2e.invalid",
      STROMAN_RELEASE_SHA: "0000000000000000000000000000000000000000",
      STROMAN_SOURCE_STORAGE_PATH: "/private/tmp/stroman-e2e-source-imports",
      STROMAN_CREATIVE_REASONING_PROVIDER: "openai",
      STROMAN_CREATIVE_MODEL: "gpt-5.4",
      OPENAI_API_KEY: "synthetic-e2e-key",
    },
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
});
