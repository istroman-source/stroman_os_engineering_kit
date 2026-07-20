import { createRemoteJWKSet, errors as joseErrors, type JWTPayload, jwtVerify } from "jose";

/**
 * Verifies a Supabase-issued JWT. Uses the industry-standard `jose` library — no
 * custom cryptography. Supabase's asymmetric keys are fetched from the project's
 * JWKS endpoint (and cached by `jose`); the legacy shared HS256 secret is also
 * supported for projects that have not migrated. Issuer and audience are always
 * enforced.
 */
export interface SupabaseJwtVerifierConfig {
  readonly issuer: string;
  readonly audience: string;
  /** JWKS endpoint for asymmetric verification (preferred). */
  readonly jwksUrl?: string;
  /** Legacy shared secret for HS256 verification. */
  readonly hs256Secret?: string;
}

/** The token is present but not valid (bad signature, expired, wrong claims). */
export class TokenInvalidError extends Error {
  constructor() {
    super("token invalid");
    this.name = "TokenInvalidError";
  }
}

/** Verification could not be completed (e.g. JWKS could not be fetched). */
export class TokenUnavailableError extends Error {
  constructor() {
    super("token verification unavailable");
    this.name = "TokenUnavailableError";
  }
}

export interface JwtVerifier {
  verify(token: string): Promise<JWTPayload>;
}

// jose error codes that mean the TOKEN is bad (not that verification failed to
// run). Anything else (e.g. a JWKS network/timeout error) is treated as an
// availability problem so the caller can fail closed with 503 rather than 401.
const INVALID_TOKEN_CODES = new Set([
  "ERR_JWT_EXPIRED",
  "ERR_JWT_CLAIM_VALIDATION_FAILED",
  "ERR_JWT_INVALID",
  "ERR_JWS_INVALID",
  "ERR_JWS_SIGNATURE_VERIFICATION_FAILED",
  "ERR_JWKS_NO_MATCHING_KEY",
  "ERR_JWKS_MULTIPLE_MATCHING_KEYS",
  // A token whose `alg` is outside our allowlist (e.g. `none`, or HS256 forged
  // against a public key) is an invalid token, not an availability failure.
  "ERR_JOSE_ALG_NOT_ALLOWED",
]);

// Explicit algorithm allowlists (defense against algorithm-confusion / `alg=none`).
// Supabase asymmetric signing keys are RSA (RS256) or Elliptic Curve (ES256);
// legacy projects use a shared HS256 secret. Verified against Supabase JWT docs
// on 2026-07-19.
const ASYMMETRIC_ALGS = ["RS256", "ES256"] as const;
const SYMMETRIC_ALGS = ["HS256"] as const;

function classify(error: unknown): TokenInvalidError | TokenUnavailableError {
  if (error instanceof joseErrors.JOSEError && INVALID_TOKEN_CODES.has(error.code)) {
    return new TokenInvalidError();
  }
  return new TokenUnavailableError();
}

/**
 * Build a verifier from configuration. Prefers JWKS (asymmetric); falls back to
 * the HS256 secret. Throws on construction if neither is configured.
 */
export function createSupabaseJwtVerifier(config: SupabaseJwtVerifierConfig): JwtVerifier {
  const base = { issuer: config.issuer, audience: config.audience } as const;

  if (config.jwksUrl) {
    const jwks = createRemoteJWKSet(new URL(config.jwksUrl));
    // Pin algorithms so a token cannot dictate a weaker/`none` algorithm or an
    // HS256-vs-RS256 confusion attack against the public JWKS key.
    const options = { ...base, algorithms: [...ASYMMETRIC_ALGS] };
    return {
      async verify(token) {
        try {
          const { payload } = await jwtVerify(token, jwks, options);
          return payload;
        } catch (error) {
          throw classify(error);
        }
      },
    };
  }

  if (config.hs256Secret) {
    const secret = new TextEncoder().encode(config.hs256Secret);
    const options = { ...base, algorithms: [...SYMMETRIC_ALGS] };
    return {
      async verify(token) {
        try {
          const { payload } = await jwtVerify(token, secret, options);
          return payload;
        } catch (error) {
          throw classify(error);
        }
      },
    };
  }

  throw new Error("Supabase JWT verifier requires either a JWKS URL or an HS256 secret");
}
