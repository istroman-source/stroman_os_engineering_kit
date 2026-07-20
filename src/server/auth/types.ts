import type { VerifiedPrincipal } from "@/application/identity";

/** How a caller presented credentials. Determines CSRF handling. */
export type CredentialSource = "cookie" | "bearer";

/**
 * The result of attempting to authenticate a request from its credentials alone
 * (before any internal identity lookup). Fail-closed by design: every non-success
 * is an explicit, distinct kind, never a silent fallback to an actor.
 *
 * - `anonymous`   — no credentials presented → 401 AUTHENTICATION_REQUIRED
 * - `authenticated` — credentials verified → proceed to internal identity mapping
 * - `invalid`     — credentials present but invalid/expired → 401 INVALID_SESSION
 * - `unavailable` — verification could not run (provider outage) → 503
 */
export type AuthOutcome =
  | { readonly kind: "anonymous" }
  | {
      readonly kind: "authenticated";
      readonly principal: VerifiedPrincipal;
      readonly via: CredentialSource;
    }
  | { readonly kind: "invalid" }
  | { readonly kind: "unavailable" };

/**
 * Provider-neutral port that turns an inbound HTTP request into an `AuthOutcome`
 * by verifying its credentials. The production implementation verifies a
 * Supabase-issued JWT (cookie or bearer); tests inject a deterministic double.
 * No provider SDK type crosses this boundary.
 */
export interface RequestAuthenticator {
  authenticate(req: Request): Promise<AuthOutcome>;
}

/** A verified provider session's tokens, provider-neutral. */
export interface ProviderSession {
  readonly accessToken: string;
  readonly refreshToken: string;
  readonly expiresInSeconds: number;
}

/** Outcome of requesting an email OTP. Neutral to avoid account enumeration. */
export type StartOtpOutcome =
  { readonly kind: "sent" } | { readonly kind: "rate_limited" } | { readonly kind: "unavailable" };

/** Outcome of verifying an email OTP. */
export type VerifyOtpOutcome =
  | { readonly kind: "verified"; readonly session: ProviderSession }
  | { readonly kind: "invalid" }
  | { readonly kind: "rate_limited" }
  | { readonly kind: "unavailable" };

/**
 * Provider-neutral port for the passwordless email-OTP flow. The production
 * implementation calls Supabase Auth; tests inject a fake. Never exposes provider
 * error detail to callers.
 */
export interface AuthGateway {
  /** `redirectTo` is the same-origin URL the emailed link should return to. */
  startEmailOtp(email: string, redirectTo?: string): Promise<StartOtpOutcome>;
  verifyEmailOtp(email: string, token: string): Promise<VerifyOtpOutcome>;
  /**
   * Exchange a refresh token for a fresh session (rotating both tokens). Returns
   * null when the refresh token is invalid/expired (the caller then fails closed).
   */
  refreshSession(refreshToken: string): Promise<ProviderSession | null>;
  signOut(accessToken: string): Promise<void>;
}
