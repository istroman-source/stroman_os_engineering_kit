import { describe, expect, it } from "vitest";
import type { JWTPayload } from "jose";
import { type JwtVerifier, TokenInvalidError, TokenUnavailableError } from "./jwt-verifier";
import { SupabaseAuthenticator } from "./supabase-authenticator";

function authenticator(verify: JwtVerifier["verify"]): SupabaseAuthenticator {
  return new SupabaseAuthenticator({ verifier: { verify }, accessCookieName: "sos_at" });
}

function req(headers: Record<string, string>): Request {
  return new Request("http://localhost/api", { headers });
}

const okClaims: JWTPayload = { sub: "user-uuid", email: "chef@example.com" };

describe("SupabaseAuthenticator", () => {
  it("returns anonymous when no credential is presented", async () => {
    const out = await authenticator(async () => okClaims).authenticate(req({}));
    expect(out.kind).toBe("anonymous");
  });

  it("authenticates a valid cookie token and reports via=cookie", async () => {
    const out = await authenticator(async () => okClaims).authenticate(
      req({ cookie: "sos_at=valid" }),
    );
    expect(out).toMatchObject({
      kind: "authenticated",
      via: "cookie",
      principal: { provider: "SUPABASE", subject: "user-uuid" },
    });
  });

  it("authenticates a valid bearer token and reports via=bearer", async () => {
    const out = await authenticator(async () => okClaims).authenticate(
      req({ authorization: "Bearer valid" }),
    );
    expect(out).toMatchObject({ kind: "authenticated", via: "bearer" });
  });

  it("maps an invalid token to invalid", async () => {
    const out = await authenticator(async () => {
      throw new TokenInvalidError();
    }).authenticate(req({ cookie: "sos_at=bad" }));
    expect(out.kind).toBe("invalid");
  });

  it("maps a verification outage to unavailable (fail closed)", async () => {
    const out = await authenticator(async () => {
      throw new TokenUnavailableError();
    }).authenticate(req({ cookie: "sos_at=any" }));
    expect(out.kind).toBe("unavailable");
  });

  it("treats a signed-but-subjectless token as invalid", async () => {
    const out = await authenticator(async () => ({ email: "x@y.z" })).authenticate(
      req({ cookie: "sos_at=nosub" }),
    );
    expect(out.kind).toBe("invalid");
  });
});
