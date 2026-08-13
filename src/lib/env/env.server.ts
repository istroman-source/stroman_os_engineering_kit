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
    /** Verified email used only to claim the singleton initial-owner grant. */
    STROMAN_PRIVATE_BETA_OWNER_EMAIL: z.string().email().optional(),
    /** Safe deployment identity surfaced by health endpoints. */
    STROMAN_RELEASE_SHA: z
      .string()
      .regex(/^[0-9a-f]{40}$/i)
      .optional(),
    /** Persistent runtime path for imported source material. */
    STROMAN_SOURCE_STORAGE_PATH: z.string().min(1).optional(),
    /** Hosted creative reasoning is mandatory for the private web release. */
    STROMAN_CREATIVE_REASONING_PROVIDER: z
      .enum(["auto", "openai", "deterministic"])
      .default("auto"),
    STROMAN_CREATIVE_MODEL: z.string().min(1).default("gpt-5.4"),
    OPENAI_API_KEY: z.string().min(1).optional(),
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
    const required: ReadonlyArray<keyof typeof env> = [
      "DATABASE_URL",
      "APP_ALLOWED_ORIGINS",
      "SUPABASE_EMAIL_REDIRECT_URL",
      "STROMAN_PRIVATE_BETA_OWNER_EMAIL",
      "STROMAN_RELEASE_SHA",
      "STROMAN_SOURCE_STORAGE_PATH",
      "OPENAI_API_KEY",
    ];
    for (const name of required) {
      if (!env[name]) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: [name],
          message: `${name} is required in production.`,
        });
      }
    }
    if (!env.NEXT_PUBLIC_APP_URL.startsWith("https://")) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["NEXT_PUBLIC_APP_URL"],
        message: "NEXT_PUBLIC_APP_URL must use HTTPS in production.",
      });
    }
    if (env.SUPABASE_EMAIL_REDIRECT_URL) {
      const appOrigin = new URL(env.NEXT_PUBLIC_APP_URL).origin;
      const redirect = new URL(env.SUPABASE_EMAIL_REDIRECT_URL);
      if (redirect.origin !== appOrigin || redirect.pathname !== "/auth/callback") {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["SUPABASE_EMAIL_REDIRECT_URL"],
          message: "SUPABASE_EMAIL_REDIRECT_URL must be the app's same-origin /auth/callback URL.",
        });
      }
    }
    if (env.STROMAN_CREATIVE_REASONING_PROVIDER !== "openai") {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["STROMAN_CREATIVE_REASONING_PROVIDER"],
        message: "Hosted OpenAI creative reasoning is required in production.",
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
