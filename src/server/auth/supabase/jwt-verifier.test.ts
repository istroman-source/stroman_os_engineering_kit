// @vitest-environment node
import { generateKeyPair, SignJWT } from "jose";
import { describe, expect, it } from "vitest";
import {
  createSupabaseJwtVerifier,
  TokenInvalidError,
  TokenUnavailableError,
} from "./jwt-verifier";

// Deterministic, real cryptographic verification with a locally-held HS256 secret.
// This exercises the ACTUAL jose signature/claim checks (not a stub); it does not
// prove behavior against a live Supabase JWKS, which requires a real project.
const SECRET = "unit-test-hs256-secret-value-at-least-32-bytes";
const ISSUER = "https://ref.supabase.co/auth/v1";
const AUDIENCE = "authenticated";

function verifier() {
  return createSupabaseJwtVerifier({ issuer: ISSUER, audience: AUDIENCE, hs256Secret: SECRET });
}

async function sign(
  claims: Record<string, unknown>,
  opts: { issuer?: string; audience?: string; expiration?: string | number; secret?: string } = {},
): Promise<string> {
  const key = new TextEncoder().encode(opts.secret ?? SECRET);
  return new SignJWT(claims)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuer(opts.issuer ?? ISSUER)
    .setAudience(opts.audience ?? AUDIENCE)
    .setIssuedAt()
    .setExpirationTime(opts.expiration ?? "1h")
    .sign(key);
}

describe("createSupabaseJwtVerifier (HS256, real crypto)", () => {
  it("verifies a well-formed token and returns its claims", async () => {
    const token = await sign({ sub: "user-uuid", email: "chef@example.com" });
    const payload = await verifier().verify(token);
    expect(payload.sub).toBe("user-uuid");
    expect(payload.email).toBe("chef@example.com");
  });

  it("rejects an expired token as invalid", async () => {
    const token = await sign({ sub: "u" }, { expiration: Math.floor(Date.now() / 1000) - 60 });
    await expect(verifier().verify(token)).rejects.toBeInstanceOf(TokenInvalidError);
  });

  it("rejects a token signed with a different secret", async () => {
    const token = await sign({ sub: "u" }, { secret: "a-totally-different-secret-value-32bytes!" });
    await expect(verifier().verify(token)).rejects.toBeInstanceOf(TokenInvalidError);
  });

  it("rejects a wrong issuer and a wrong audience", async () => {
    const wrongIss = await sign({ sub: "u" }, { issuer: "https://evil.example/auth/v1" });
    const wrongAud = await sign({ sub: "u" }, { audience: "anon" });
    await expect(verifier().verify(wrongIss)).rejects.toBeInstanceOf(TokenInvalidError);
    await expect(verifier().verify(wrongAud)).rejects.toBeInstanceOf(TokenInvalidError);
  });

  it("rejects a structurally invalid token as invalid", async () => {
    await expect(verifier().verify("not-a-jwt")).rejects.toBeInstanceOf(TokenInvalidError);
  });

  it("rejects an `alg=none` unsecured token (algorithm allowlist)", async () => {
    const enc = (obj: unknown) => Buffer.from(JSON.stringify(obj)).toString("base64url");
    const header = enc({ alg: "none", typ: "JWT" });
    const payload = enc({
      sub: "u",
      iss: ISSUER,
      aud: AUDIENCE,
      exp: Math.floor(Date.now() / 1000) + 3600,
    });
    const unsecured = `${header}.${payload}.`;
    await expect(verifier().verify(unsecured)).rejects.toBeInstanceOf(TokenInvalidError);
  });

  it("throws when neither JWKS nor secret is configured", () => {
    expect(() => createSupabaseJwtVerifier({ issuer: ISSUER, audience: AUDIENCE })).toThrow();
  });

  it("distinguishes an availability failure from an invalid token", async () => {
    // A verifier whose JWKS source cannot be reached surfaces TokenUnavailableError,
    // so the caller fails closed with 503 rather than 401. The token uses an
    // allowlisted asymmetric alg (ES256) so verification proceeds to the (failing)
    // network fetch rather than being rejected earlier for a disallowed algorithm.
    const { privateKey } = await generateKeyPair("ES256");
    const token = await new SignJWT({ sub: "u" })
      .setProtectedHeader({ alg: "ES256" })
      .setIssuer(ISSUER)
      .setAudience(AUDIENCE)
      .setIssuedAt()
      .setExpirationTime("1h")
      .sign(privateKey);
    const unreachable = createSupabaseJwtVerifier({
      issuer: ISSUER,
      audience: AUDIENCE,
      jwksUrl: "http://127.0.0.1:1/jwks.json",
    });
    await expect(unreachable.verify(token)).rejects.toBeInstanceOf(TokenUnavailableError);
  });
});
