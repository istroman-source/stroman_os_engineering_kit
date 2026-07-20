import "server-only";

import { getSupabaseAuthConfig } from "./config";
import { SupabaseAuthGateway } from "./supabase/supabase-auth-gateway";
import { SupabaseAuthenticator } from "./supabase/supabase-authenticator";
import { createSupabaseJwtVerifier } from "./supabase/jwt-verifier";
import { cookieName } from "./cookies";
import type { AuthGateway, RequestAuthenticator } from "./types";

/**
 * Build the PRODUCTION request authenticator from validated env. This is the only
 * authenticator wired outside of tests; there is no header/query/flag that can
 * substitute a different one at runtime.
 */
export function createProductionAuthenticator(secure: boolean): RequestAuthenticator {
  const config = getSupabaseAuthConfig();
  const verifier = createSupabaseJwtVerifier({
    issuer: config.issuer,
    audience: config.audience,
    jwksUrl: config.jwksUrl,
    hs256Secret: config.hs256Secret,
  });
  return new SupabaseAuthenticator({ verifier, accessCookieName: cookieName("at", secure) });
}

/** Build the PRODUCTION email-OTP gateway from validated env. */
export function createProductionAuthGateway(): AuthGateway {
  const config = getSupabaseAuthConfig();
  return new SupabaseAuthGateway({ url: config.url, anonKey: config.anonKey });
}
