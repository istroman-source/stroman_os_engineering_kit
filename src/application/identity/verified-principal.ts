import type { AuthProvider } from "@/domain/identity";

/**
 * A caller identity that has ALREADY been cryptographically verified by an
 * authentication adapter (e.g. a validated Supabase JWT). It is provider-neutral:
 * the application never sees provider tokens, cookies, or SDK types — only this.
 *
 * `subject` is the provider's stable subject identifier (never used directly as a
 * business id). `email` is whatever verified address the provider asserted, or
 * null; it is retained for audit only and is not an authorization key.
 */
export interface VerifiedPrincipal {
  readonly provider: AuthProvider;
  readonly subject: string;
  readonly email: string | null;
}
