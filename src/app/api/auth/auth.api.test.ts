import type { PrismaClient } from "@prisma/client";
import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it } from "vitest";
import {
  resetAuthForTests,
  setAuthGatewayForTests,
  setRequestAuthenticatorForTests,
} from "@/server/composition";
import { createTestPrisma, resetDatabase } from "@test/db/integration-helpers";
import { FakeAuthGateway, FixedAuthenticator, TestAuthenticator } from "@test/adapters/test-auth";
import { call, TEST_ORIGIN } from "@test/http/call";
import { POST as createProject, GET as listProjects } from "../v1/projects/route";
import { GET as getProject } from "../v1/projects/[projectId]/route";
import { POST as activateProject } from "../v1/projects/[projectId]/activate/route";
import { POST as startOtp } from "./start/route";
import { POST as verifyOtp } from "./verify/route";
import { POST as authCallback } from "./callback/route";
import { GET as sessionRoute } from "./session/route";
import { POST as signOut } from "./sign-out/route";

const A = "subject-a";
const B = "subject-b";

let prisma: PrismaClient;

beforeAll(() => {
  prisma = createTestPrisma();
});
afterAll(async () => {
  resetAuthForTests();
  await prisma.$disconnect();
});
beforeEach(async () => {
  await resetDatabase(prisma);
  setRequestAuthenticatorForTests(new TestAuthenticator());
  setAuthGatewayForTests(new FakeAuthGateway());
});
afterEach(() => {
  resetAuthForTests();
});

async function makeProjectAs(principal: string): Promise<string> {
  const res = await call(createProject, { method: "POST", principal, json: { name: "P" } });
  expect(res.status).toBe(201);
  return (res.body as { id: string }).id;
}

describe("protected routes — authentication", () => {
  it("rejects with no credentials (401 AUTHENTICATION_REQUIRED)", async () => {
    const res = await call(getProject, { params: { projectId: "proj_ZZZZZZZZ" } });
    expect(res.status).toBe(401);
    expect((res.body as { error: { code: string } }).error.code).toBe("AUTHENTICATION_REQUIRED");
  });

  it("rejects invalid/expired credentials (401 INVALID_SESSION)", async () => {
    setRequestAuthenticatorForTests(new FixedAuthenticator({ kind: "invalid" }));
    const res = await call(createProject, { method: "POST", principal: A, json: { name: "X" } });
    expect(res.status).toBe(401);
    expect((res.body as { error: { code: string } }).error.code).toBe("INVALID_SESSION");
  });

  it("fails closed when the provider is unavailable (503)", async () => {
    setRequestAuthenticatorForTests(new FixedAuthenticator({ kind: "unavailable" }));
    const res = await call(createProject, { method: "POST", principal: A, json: { name: "X" } });
    expect(res.status).toBe(503);
    expect((res.body as { error: { code: string } }).error.code).toBe("AUTHENTICATION_UNAVAILABLE");
  });

  it("the former X-Stroman-Actor-Id header grants no access", async () => {
    const res = await call(createProject, {
      method: "POST",
      json: { name: "X" },
      headers: { "x-stroman-actor-id": "usr_AAAAAAAA" },
    });
    expect(res.status).toBe(401);
  });
});

describe("authorization — ownership", () => {
  it("creates a project under the authenticated owner and lists only theirs", async () => {
    await makeProjectAs(A);
    await makeProjectAs(A);
    await makeProjectAs(B);
    const mine = await call(listProjects, { principal: A });
    expect((mine.body as { items: unknown[] }).items).toHaveLength(2);
    const theirs = await call(listProjects, { principal: B });
    expect((theirs.body as { items: unknown[] }).items).toHaveLength(1);
  });

  it("User A cannot read or mutate User B's resource (403)", async () => {
    const projectId = await makeProjectAs(B);
    const read = await call(getProject, { principal: A, params: { projectId } });
    expect(read.status).toBe(403);
    const mutate = await call(activateProject, {
      method: "POST",
      principal: A,
      params: { projectId },
      ifMatch: '"project:1"',
    });
    expect(mutate.status).toBe(403);
  });

  it("body cannot override the owner (strict schema → 400)", async () => {
    const res = await call(createProject, {
      method: "POST",
      principal: A,
      json: { name: "X", ownerId: "usr_ATTACKER" },
    });
    expect(res.status).toBe(400);
  });

  it("rejects a disabled account (403 ACCOUNT_DISABLED)", async () => {
    await makeProjectAs(A); // provisions the user
    const identity = await prisma.userIdentity.findFirstOrThrow({
      where: { provider: "SUPABASE", providerSubject: A },
    });
    await prisma.user.update({ where: { id: identity.userId }, data: { status: "DISABLED" } });
    const res = await call(listProjects, { principal: A });
    expect(res.status).toBe(403);
    expect((res.body as { error: { code: string } }).error.code).toBe("ACCOUNT_DISABLED");
  });

  it("provisions identity race-safely (concurrent first requests → one user)", async () => {
    const results = await Promise.all(
      Array.from({ length: 6 }, () =>
        call(createProject, { method: "POST", principal: "subject-race", json: { name: "P" } }),
      ),
    );
    expect(results.every((r) => r.status === 201)).toBe(true);
    const users = await prisma.user.count();
    const identities = await prisma.userIdentity.count();
    expect(users).toBe(1);
    expect(identities).toBe(1);
  });
});

describe("CSRF (cookie sessions)", () => {
  it("rejects a cookie-authenticated mutation with a foreign/absent origin (403)", async () => {
    const foreign = await call(createProject, {
      method: "POST",
      principal: A,
      via: "cookie",
      origin: "https://evil.example.com",
      json: { name: "X" },
    });
    expect(foreign.status).toBe(403);
    expect((foreign.body as { error: { code: string } }).error.code).toBe(
      "REQUEST_ORIGIN_REJECTED",
    );

    const noOrigin = await call(createProject, {
      method: "POST",
      principal: A,
      via: "cookie",
      origin: null,
      json: { name: "X" },
    });
    expect(noOrigin.status).toBe(403);
  });

  it("allows a same-origin cookie mutation", async () => {
    const res = await call(createProject, {
      method: "POST",
      principal: A,
      via: "cookie",
      origin: TEST_ORIGIN,
      json: { name: "X" },
    });
    expect(res.status).toBe(201);
  });

  it("exempts bearer-authenticated mutations from the Origin check", async () => {
    const res = await call(createProject, {
      method: "POST",
      principal: A,
      via: "bearer",
      origin: null,
      json: { name: "X" },
    });
    expect(res.status).toBe(201);
  });
});

describe("email OTP endpoints", () => {
  it("start returns a neutral message and does not reveal account existence", async () => {
    const gateway = new FakeAuthGateway({ start: { kind: "sent" } });
    setAuthGatewayForTests(gateway);
    const res = await call(startOtp, {
      method: "POST",
      origin: TEST_ORIGIN,
      json: { email: "Chef@Example.com" },
    });
    expect(res.status).toBe(200);
    expect((res.body as { message: string }).message).toMatch(/if the address/i);
    // Email is normalized before reaching the provider.
    expect(gateway.startCalls).toEqual(["chef@example.com"]);
  });

  it("start maps provider rate limiting to 429", async () => {
    setAuthGatewayForTests(new FakeAuthGateway({ start: { kind: "rate_limited" } }));
    const res = await call(startOtp, { method: "POST", json: { email: "a@b.co" } });
    expect(res.status).toBe(429);
  });

  it("verify sets secure HttpOnly session cookies on success", async () => {
    const res = await call(verifyOtp, {
      method: "POST",
      json: { email: "a@b.co", token: "123456" },
    });
    expect(res.status).toBe(200);
    expect((res.body as { authenticated: boolean }).authenticated).toBe(true);
    const setCookies = res.headers.getSetCookie();
    const joined = setCookies.join("\n");
    expect(setCookies).toHaveLength(2);
    expect(joined).toContain("sos_at=");
    expect(joined).toContain("sos_rt=");
    expect(joined).toContain("HttpOnly");
    expect(joined).toContain("SameSite=Lax");
    // The session tokens live only in cookies, never in the JSON body.
    expect(res.body).toEqual({ authenticated: true });
  });

  it("verify maps an invalid code to 401 INVALID_OTP", async () => {
    setAuthGatewayForTests(new FakeAuthGateway({ verify: { kind: "invalid" } }));
    const res = await call(verifyOtp, {
      method: "POST",
      json: { email: "a@b.co", token: "000000" },
    });
    expect(res.status).toBe(401);
    expect((res.body as { error: { code: string } }).error.code).toBe("INVALID_OTP");
  });

  it("session reports authentication state without leaking identity", async () => {
    const anon = await call(sessionRoute, {});
    expect((anon.body as { authenticated: boolean }).authenticated).toBe(false);
    const authed = await call(sessionRoute, { principal: A });
    expect((authed.body as { authenticated: boolean }).authenticated).toBe(true);
    expect(Object.keys(authed.body as object)).toEqual(["authenticated"]);
  });

  it("sign-out clears cookies and is CSRF-protected", async () => {
    const secureName = "sos_at"; // dev/test cookie name
    // A cookie-bearing sign-out from a foreign origin is rejected.
    const forged = await call(signOut, {
      method: "POST",
      origin: "https://evil.example.com",
      cookie: `${secureName}=some-token`,
    });
    expect(forged.status).toBe(403);

    // Same-origin sign-out clears both cookies (idempotent).
    const ok = await call(signOut, {
      method: "POST",
      origin: TEST_ORIGIN,
      cookie: `${secureName}=some-token`,
    });
    expect(ok.status).toBe(200);
    expect(ok.headers.getSetCookie().join("\n")).toContain("Max-Age=0");
  });
});

describe("server-side session refresh (persistent auth)", () => {
  it("refreshes a stale session from the refresh cookie and re-issues both cookies", async () => {
    // The primary credential is absent/expired (no x-test-principal → anonymous),
    // but a valid refresh cookie is present. The gateway hands back a fresh access
    // token whose value is the subject the TestAuthenticator will verify.
    setAuthGatewayForTests(
      new FakeAuthGateway({
        refresh: { accessToken: A, refreshToken: "rotated-rt", expiresInSeconds: 3600 },
      }),
    );
    const res = await call(listProjects, { cookie: "sos_rt=valid-refresh-token" });
    expect(res.status).toBe(200);
    const cookies = res.headers.getSetCookie();
    const joined = cookies.join("\n");
    expect(joined).toContain("sos_at=");
    expect(joined).toContain("sos_rt=rotated-rt");
    expect(joined).toContain("HttpOnly");
  });

  it("provisions/authorizes the refreshed principal like any signed-in user", async () => {
    setAuthGatewayForTests(
      new FakeAuthGateway({
        refresh: { accessToken: A, refreshToken: "rotated-rt", expiresInSeconds: 3600 },
      }),
    );
    await makeProjectAs(A); // A already exists
    const res = await call(listProjects, { cookie: "sos_rt=valid-refresh-token" });
    expect(res.status).toBe(200);
    expect((res.body as { items: unknown[] }).items).toHaveLength(1);
  });

  it("returns 401 when there is no refresh cookie to fall back on", async () => {
    const res = await call(listProjects, {});
    expect(res.status).toBe(401);
    expect(res.headers.getSetCookie()).toHaveLength(0);
  });

  it("returns 401 (and sets no cookies) when the refresh token is rejected", async () => {
    // config omits `refresh` → FakeAuthGateway.refreshSession resolves to null.
    setAuthGatewayForTests(new FakeAuthGateway());
    const res = await call(listProjects, { cookie: "sos_rt=stale-or-revoked" });
    expect(res.status).toBe(401);
    expect(res.headers.getSetCookie()).toHaveLength(0);
  });

  it("does not grant access if the refreshed access token fails verification", async () => {
    // Gateway returns a session, but the authenticator rejects everything → no access.
    setRequestAuthenticatorForTests(new FixedAuthenticator({ kind: "invalid" }));
    setAuthGatewayForTests(
      new FakeAuthGateway({
        refresh: { accessToken: A, refreshToken: "rotated-rt", expiresInSeconds: 3600 },
      }),
    );
    const res = await call(listProjects, { cookie: "sos_rt=valid-refresh-token" });
    expect(res.status).toBe(401);
    expect(res.headers.getSetCookie()).toHaveLength(0);
  });
});

describe("magic-link callback", () => {
  it("establishes session cookies for a verified token (same-origin)", async () => {
    // TestAuthenticator authenticates a bearer token whose value is the subject.
    const res = await call(authCallback, {
      method: "POST",
      origin: TEST_ORIGIN,
      json: { accessToken: "subject-a", refreshToken: "refresh-a", expiresInSeconds: 3600 },
    });
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ authenticated: true });
    const cookies = res.headers.getSetCookie().join("\n");
    expect(cookies).toContain("sos_at=");
    expect(cookies).toContain("sos_rt=");
    expect(cookies).toContain("HttpOnly");
  });

  it("rejects a cross-origin callback (CSRF, 403)", async () => {
    const res = await call(authCallback, {
      method: "POST",
      origin: "https://evil.example.com",
      json: { accessToken: "subject-a", refreshToken: "refresh-a" },
    });
    expect(res.status).toBe(403);
    expect((res.body as { error: { code: string } }).error.code).toBe("REQUEST_ORIGIN_REJECTED");
  });

  it("rejects a callback with no Origin (fail closed)", async () => {
    const res = await call(authCallback, {
      method: "POST",
      origin: null,
      json: { accessToken: "subject-a", refreshToken: "refresh-a" },
    });
    expect(res.status).toBe(403);
  });

  it("rejects an unverifiable token (401) and sets no cookies", async () => {
    setRequestAuthenticatorForTests(new FixedAuthenticator({ kind: "invalid" }));
    const res = await call(authCallback, {
      method: "POST",
      origin: TEST_ORIGIN,
      json: { accessToken: "forged", refreshToken: "r" },
    });
    expect(res.status).toBe(401);
    expect(res.headers.getSetCookie()).toHaveLength(0);
  });

  it("rejects a malformed body (400)", async () => {
    const res = await call(authCallback, {
      method: "POST",
      origin: TEST_ORIGIN,
      json: { accessToken: "only-access" },
    });
    expect(res.status).toBe(400);
  });
});

describe("error hygiene & production guard", () => {
  it("auth errors carry no provider or token detail", async () => {
    setRequestAuthenticatorForTests(new FixedAuthenticator({ kind: "invalid" }));
    const res = await call(createProject, { method: "POST", principal: A, json: { name: "X" } });
    const serialized = JSON.stringify(res.body).toLowerCase();
    expect(serialized).not.toContain("supabase");
    expect(serialized).not.toContain("jwt");
    expect(serialized).not.toContain("token");
    expect(serialized).not.toContain("bearer");
  });

  it("the test authenticator cannot be injected in production composition", () => {
    const env = process.env as Record<string, string | undefined>;
    const original = env.NODE_ENV;
    try {
      env.NODE_ENV = "production";
      expect(() => setRequestAuthenticatorForTests(new TestAuthenticator())).toThrow();
      expect(() => setAuthGatewayForTests(new FakeAuthGateway())).toThrow();
    } finally {
      env.NODE_ENV = original;
      setRequestAuthenticatorForTests(new TestAuthenticator());
    }
  });
});
