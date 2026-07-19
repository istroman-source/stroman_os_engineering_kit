import { z } from "zod";
import { EnvironmentValidationError, issuesFromZodError } from "./error";

/**
 * Client-safe environment.
 *
 * Only `NEXT_PUBLIC_*` variables belong here — these are inlined into the client
 * bundle by Next.js and are safe to expose. Server secrets live in
 * `env.server.ts`, which is guarded so it can never be imported into client code.
 */

export const clientEnvSchema = z.object({
  NEXT_PUBLIC_APP_URL: z.string().url().default("http://localhost:3000"),
});

export type ClientEnv = z.infer<typeof clientEnvSchema>;

export function parseClientEnv(
  source: Record<string, string | undefined> = process.env,
): ClientEnv {
  const parsed = clientEnvSchema.safeParse(source);
  if (!parsed.success) {
    throw new EnvironmentValidationError(issuesFromZodError(parsed.error));
  }
  return parsed.data;
}

let cached: ClientEnv | undefined;

export function getClientEnv(): ClientEnv {
  cached ??= parseClientEnv();
  return cached;
}

/** Reset the memoized client environment. Tests only. */
export function resetClientEnvCache(): void {
  cached = undefined;
}
