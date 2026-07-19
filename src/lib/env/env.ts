import { z } from "zod";

/**
 * Environment validation.
 *
 * The process environment is untyped and untrusted. This module is the single
 * place it is parsed and validated, producing a typed, safe `Env`. Parsing is
 * lazy (via getEnv) so merely importing this module never throws — callers opt
 * in when they actually need configuration.
 */

export const envSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  NEXT_PUBLIC_APP_URL: z.string().url().default("http://localhost:3000"),
  // Optional at this stage: no domain models depend on the database yet.
  DATABASE_URL: z.string().url().optional(),
  FEATURE_FLAGS: z.string().default(""),
  LOG_LEVEL: z.enum(["debug", "info", "warn", "error"]).default("info"),
});

export type Env = z.infer<typeof envSchema>;

export class EnvironmentValidationError extends Error {
  readonly issues: readonly string[];
  constructor(issues: readonly string[]) {
    super(`Invalid environment configuration:\n${issues.map((i) => `  - ${i}`).join("\n")}`);
    this.name = "EnvironmentValidationError";
    this.issues = issues;
  }
}

/** Validate a source of environment variables into a typed Env. */
export function parseEnv(source: Record<string, string | undefined> = process.env): Env {
  const parsed = envSchema.safeParse(source);
  if (!parsed.success) {
    const issues = parsed.error.issues.map(
      (issue) => `${issue.path.join(".") || "(root)"}: ${issue.message}`,
    );
    throw new EnvironmentValidationError(issues);
  }
  return parsed.data;
}

let cached: Env | undefined;

/** Return the validated environment, memoized after first successful parse. */
export function getEnv(): Env {
  cached ??= parseEnv();
  return cached;
}

/** Reset the memoized environment. Intended for tests only. */
export function resetEnvCache(): void {
  cached = undefined;
}
