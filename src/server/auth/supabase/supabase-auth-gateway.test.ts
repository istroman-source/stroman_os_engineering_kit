import { describe, expect, it, vi } from "vitest";
import { SupabaseAuthGateway } from "./supabase-auth-gateway";

const config = { url: "https://ref.supabase.co", anonKey: "anon-key" };

function gatewayWith(responder: (url: string, init?: RequestInit) => Response | Promise<Response>) {
  const fetchImpl = vi.fn(async (url: string, init?: RequestInit) => responder(url, init));
  return { gateway: new SupabaseAuthGateway(config, fetchImpl), fetchImpl };
}

function json(status: number, body: unknown): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "content-type": "application/json" },
  });
}

describe("SupabaseAuthGateway.startEmailOtp", () => {
  it("calls the OTP endpoint with the apikey and returns sent on 2xx", async () => {
    const { gateway, fetchImpl } = gatewayWith(() => json(200, {}));
    const out = await gateway.startEmailOtp("chef@example.com");
    expect(out.kind).toBe("sent");
    const [url, init] = fetchImpl.mock.calls[0]!;
    expect(url).toBe("https://ref.supabase.co/auth/v1/otp");
    expect((init?.headers as Record<string, string>).apikey).toBe("anon-key");
    expect(String(init?.body)).toContain("chef@example.com");
  });

  it("maps 429 to rate_limited and other failures to unavailable", async () => {
    expect((await gatewayWith(() => json(429, {})).gateway.startEmailOtp("a@b.co")).kind).toBe(
      "rate_limited",
    );
    expect((await gatewayWith(() => json(400, {})).gateway.startEmailOtp("a@b.co")).kind).toBe(
      "unavailable",
    );
  });

  it("maps a network throw to unavailable", async () => {
    const out = await gatewayWith(() => {
      throw new Error("network down");
    }).gateway.startEmailOtp("a@b.co");
    expect(out.kind).toBe("unavailable");
  });
});

describe("SupabaseAuthGateway.verifyEmailOtp", () => {
  it("returns the session on success", async () => {
    const { gateway } = gatewayWith(() =>
      json(200, { access_token: "at", refresh_token: "rt", expires_in: 3600 }),
    );
    const out = await gateway.verifyEmailOtp("chef@example.com", "123456");
    expect(out).toEqual({
      kind: "verified",
      session: { accessToken: "at", refreshToken: "rt", expiresInSeconds: 3600 },
    });
  });

  it("maps a 4xx to invalid, 429 to rate_limited, 5xx to unavailable", async () => {
    expect(
      (await gatewayWith(() => json(403, {})).gateway.verifyEmailOtp("a@b.co", "x")).kind,
    ).toBe("invalid");
    expect(
      (await gatewayWith(() => json(429, {})).gateway.verifyEmailOtp("a@b.co", "x")).kind,
    ).toBe("rate_limited");
    expect(
      (await gatewayWith(() => json(500, {})).gateway.verifyEmailOtp("a@b.co", "x")).kind,
    ).toBe("unavailable");
  });

  it("treats a 2xx with a malformed body as unavailable", async () => {
    const out = await gatewayWith(() => json(200, { nope: true })).gateway.verifyEmailOtp(
      "a@b.co",
      "x",
    );
    expect(out.kind).toBe("unavailable");
  });
});

describe("SupabaseAuthGateway.signOut", () => {
  it("never throws, even on provider failure", async () => {
    const { gateway } = gatewayWith(() => {
      throw new Error("boom");
    });
    await expect(gateway.signOut("at")).resolves.toBeUndefined();
  });
});
