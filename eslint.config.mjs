import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";
import eslintConfigPrettier from "eslint-config-prettier";

/**
 * ESLint flat configuration.
 *
 * Beyond Next.js defaults, this encodes the architectural dependency rule
 * from `docs/ARCHITECTURE.md` as lint errors so boundaries are enforced
 * mechanically rather than by convention:
 *
 *   - The domain layer (`src/domain`) may not import framework, provider, or
 *     UI code. It stays pure and portable.
 *   - The UI layer (`src/ui`, `src/app`) may not import server-only code
 *     directly; it must go through typed contracts.
 */
const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,

  // Domain layer must remain pure: no React, Next, Prisma, or provider SDKs.
  {
    files: ["src/domain/**/*.{ts,tsx}"],
    rules: {
      "no-restricted-imports": [
        "error",
        {
          patterns: [
            {
              group: [
                "react",
                "react-dom",
                "next",
                "next/*",
                "@prisma/client",
                "@/ui",
                "@/ui/*",
                "@/app",
                "@/app/*",
                "@/server",
                "@/server/*",
                // Infrastructure library modules the domain must not depend on.
                "@/lib/env",
                "@/lib/env/*",
                "@/lib/logging",
                "@/lib/logging/*",
                "@/lib/config",
                "@/lib/config/*",
                "@/lib/feature-flags",
                "@/lib/feature-flags/*",
                // Provider / infrastructure SDKs (must live behind adapters).
                "openai",
                "@anthropic-ai/*",
                "@google/*",
                "@aws-sdk/*",
                "ioredis",
                "bullmq",
                "pg",
                "server-only",
              ],
              message:
                "The domain layer must stay pure. Do not import framework, provider, server, UI, or infrastructure (env/logging/config) modules here. The domain may use @/lib/result, @/lib/errors, @/lib/id, and @/lib/datetime.",
            },
          ],
        },
      ],
    },
  },

  // Application layer: framework-, persistence-, and provider-independent.
  {
    files: ["src/application/**/*.{ts,tsx}"],
    rules: {
      "no-restricted-imports": [
        "error",
        {
          patterns: [
            {
              group: [
                "react",
                "react-dom",
                "next",
                "next/*",
                "@prisma/client",
                "@/ui",
                "@/ui/*",
                "@/app",
                "@/app/*",
                "@/server",
                "@/server/*",
                "@/lib/env",
                "@/lib/env/*",
                "@/lib/logging",
                "@/lib/logging/*",
                "@/lib/config",
                "@/lib/config/*",
                "@/lib/feature-flags",
                "@/lib/feature-flags/*",
                "openai",
                "@anthropic-ai/*",
                "@google/*",
                "@aws-sdk/*",
                "ioredis",
                "bullmq",
                "pg",
                "server-only",
              ],
              message:
                "The application layer must stay framework-, persistence-, and provider-independent. Depend on @/domain, application-owned ports, and @/lib/{result,errors,id,datetime} only.",
            },
          ],
        },
      ],
    },
  },

  // UI/app layers must not reach into server-only internals directly.
  {
    files: ["src/ui/**/*.{ts,tsx}", "src/app/**/*.{ts,tsx}"],
    rules: {
      "no-restricted-imports": [
        "error",
        {
          patterns: [
            {
              group: ["@/server/*/internal", "@/server/**/internal/*"],
              message:
                "Do not import server internals from UI. Use an exported service contract instead.",
            },
          ],
        },
      ],
    },
  },

  // Prettier owns formatting; disable ESLint rules that would conflict.
  eslintConfigPrettier,

  globalIgnores([
    ".next/**",
    "out/**",
    "build/**",
    "coverage/**",
    "playwright-report/**",
    "test-results/**",
    "next-env.d.ts",
  ]),
]);

export default eslintConfig;
