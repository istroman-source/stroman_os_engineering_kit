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

export const serverEnvSchema = clientEnvSchema.extend({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  // Optional at this stage: no domain models depend on the database yet.
  DATABASE_URL: z.string().url().optional(),
  FEATURE_FLAGS: z.string().default(""),
  LOG_LEVEL: z.enum(["debug", "info", "warn", "error"]).default("info"),
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
