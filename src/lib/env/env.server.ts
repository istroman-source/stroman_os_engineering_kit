import "server-only";

import { z } from "zod";
import { clientEnvSchema } from "./env.client";
import { EnvironmentValidationError, issuesFromZodError } from "./error";

/**
 * Server-only environment.
 *
 * Extends the client schema with server secrets (e.g. DATABASE_URL). The
 * `server-only` import makes any attempt to bundle this into client code a build
 * error, so secrets can never leak to the browser.
 */

export const serverEnvSchema = clientEnvSchema
  .extend({
    NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
    // Optional at this stage: no domain models depend on the database yet.
    DATABASE_URL: z.string().url().optional(),
    FEATURE_FLAGS: z.string().default(""),
    LOG_LEVEL: z.enum(["debug", "info", "warn", "error"]).default("info"),

    // --- Authentication (Supabase Auth). Required in production; optional in
    // development/test where the authenticator is provided by test composition. ---
    /** Supabase project URL, e.g. https://<ref>.supabase.co */
    SUPABASE_URL: z.string().url().optional(),
    /** Publishable anon/publishable key (safe to send as the auth `apikey`). */
    SUPABASE_ANON_KEY: z.string().min(1).optional(),
    /** Optional legacy shared JWT secret (HS256). Prefer JWKS via SUPABASE_URL. */
    SUPABASE_JWT_SECRET: z.string().min(1).optional(),
    /** Expected JWT audience (Supabase default: "authenticated"). */
    SUPABASE_JWT_AUD: z.string().min(1).default("authenticated"),
    /** Comma-separated allowed browser origins for CSRF/Origin checks. */
    APP_ALLOWED_ORIGINS: z.string().default(""),
    /** Same-origin callback the provider email link returns to (defaults derived). */
    SUPABASE_EMAIL_REDIRECT_URL: z.string().url().optional(),
  })
  .superRefine((env, ctx) => {
    // Fail closed at startup if production is missing required auth configuration,
    // rather than silently accepting requests with no way to verify identity.
    if (env.NODE_ENV !== "production") return;
    if (!env.SUPABASE_URL) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["SUPABASE_URL"],
        message: "SUPABASE_URL is required in production.",
      });
    }
    if (!env.SUPABASE_ANON_KEY) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["SUPABASE_ANON_KEY"],
        message: "SUPABASE_ANON_KEY is required in production.",
      });
    }
  });

export type ServerEnv = z.infer<typeof serverEnvSchema>;

export function parseServerEnv(
  source: Record<string, string | undefined> = process.env,
): ServerEnv {
  const parsed = serverEnvSchema.safeParse(source);
  if (!parsed.success) {
    throw new EnvironmentValidationError(issuesFromZodError(parsed.error));
  }
  return parsed.data;
}

let cached: ServerEnv | undefined;

export function getServerEnv(): ServerEnv {
  cached ??= parseServerEnv();
  return cached;
}

/** Reset the memoized server environment. Tests only. */
export function resetServerEnvCache(): void {
  cached = undefined;
}
