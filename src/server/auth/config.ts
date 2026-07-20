import "server-only";

import { getServerEnv } from "@/lib/env/env.server";

/** True when session cookies must use `Secure` + the `__Host-` prefix (production). */
export function isCookieSecure(): boolean {
  return process.env.NODE_ENV === "production";
}

/**
 * Allowed browser origins for CSRF/Origin verification. Prefers the explicit
 * `APP_ALLOWED_ORIGINS` allowlist; otherwise falls back to the app's own public
 * origin. Deployments behind a proxy must set `APP_ALLOWED_ORIGINS`.
 */
export function getAllowedOrigins(): readonly string[] {
  const env = getServerEnv();
  const configured = env.APP_ALLOWED_ORIGINS.split(",")
    .map((value) => value.trim())
    .filter((value) => value !== "");
  if (configured.length > 0) return configured;
  try {
    return [new URL(env.NEXT_PUBLIC_APP_URL).origin];
  } catch {
    return [];
  }
}

/**
 * The same-origin URL the provider email link redirects back to. Prefers an
 * explicit `SUPABASE_EMAIL_REDIRECT_URL`; otherwise derives `/auth/callback` from
 * the app's public origin. This exact value must be allowlisted in the Supabase
 * project's Redirect URLs.
 */
export function getEmailRedirectUrl(): string {
  const env = getServerEnv();
  if (env.SUPABASE_EMAIL_REDIRECT_URL) return env.SUPABASE_EMAIL_REDIRECT_URL;
  return `${new URL(env.NEXT_PUBLIC_APP_URL).origin}/auth/callback`;
}

export interface SupabaseAuthConfig {
  readonly url: string;
  readonly anonKey: string;
  readonly issuer: string;
  readonly audience: string;
  readonly jwksUrl?: string;
  readonly hs256Secret?: string;
}

/**
 * Assemble the Supabase auth configuration from validated env. Throws if required
 * settings are absent — the production authenticator/gateway must never be built
 * half-configured (fail closed). In tests this is never called because the
 * authenticator/gateway are injected via composition overrides.
 */
export function getSupabaseAuthConfig(): SupabaseAuthConfig {
  const env = getServerEnv();
  if (!env.SUPABASE_URL || !env.SUPABASE_ANON_KEY) {
    throw new Error(
      "Supabase authentication is not configured (SUPABASE_URL / SUPABASE_ANON_KEY).",
    );
  }
  const base = env.SUPABASE_URL.replace(/\/$/, "");
  return {
    url: base,
    anonKey: env.SUPABASE_ANON_KEY,
    issuer: `${base}/auth/v1`,
    audience: env.SUPABASE_JWT_AUD,
    jwksUrl: env.SUPABASE_JWT_SECRET ? undefined : `${base}/auth/v1/.well-known/jwks.json`,
    hs256Secret: env.SUPABASE_JWT_SECRET,
  };
}
