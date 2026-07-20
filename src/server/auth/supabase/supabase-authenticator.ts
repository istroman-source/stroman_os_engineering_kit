import type { AuthOutcome, RequestAuthenticator } from "../types";
import { principalFromClaims } from "./claims";
import { type JwtVerifier, TokenUnavailableError } from "./jwt-verifier";
import { extractAccessToken } from "./token-source";

export interface SupabaseAuthenticatorDeps {
  readonly verifier: JwtVerifier;
  /** Cookie name the browser session access token is stored under (env-derived). */
  readonly accessCookieName: string;
}

/**
 * The concrete Supabase request authenticator. It extracts the access token
 * (bearer or cookie), verifies it cryptographically, and maps verified claims to
 * a provider-neutral principal. It NEVER trusts a caller-supplied identity header;
 * identity comes only from a valid signed token. Fail-closed: no token →
 * anonymous, bad token → invalid, verification outage → unavailable.
 */
export class SupabaseAuthenticator implements RequestAuthenticator {
  constructor(private readonly deps: SupabaseAuthenticatorDeps) {}

  async authenticate(req: Request): Promise<AuthOutcome> {
    const extracted = extractAccessToken(req, this.deps.accessCookieName);
    if (!extracted) return { kind: "anonymous" };

    let claims;
    try {
      claims = await this.deps.verifier.verify(extracted.token);
    } catch (error) {
      if (error instanceof TokenUnavailableError) return { kind: "unavailable" };
      return { kind: "invalid" };
    }

    const principal = principalFromClaims(claims as Record<string, unknown>);
    if (!principal) return { kind: "invalid" };
    return { kind: "authenticated", principal, via: extracted.via };
  }
}
