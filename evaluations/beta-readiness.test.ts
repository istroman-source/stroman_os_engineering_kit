import { describe, expect, it } from "vitest";
import nextConfig, { SECURITY_HEADERS } from "../next.config";
import { GET as live } from "../src/app/api/health/live/route";
import { redact, REDACTED } from "../src/lib/logging";

describe("beta readiness automated gate", () => {
  it("declares baseline browser hardening headers for every route", async () => {
    const configured = await nextConfig.headers?.();
    expect(configured).toEqual([{ source: "/:path*", headers: [...SECURITY_HEADERS] }]);
    expect(
      Object.fromEntries(SECURITY_HEADERS.map(({ key, value }) => [key, value])),
    ).toMatchObject({
      "X-Frame-Options": "DENY",
      "Referrer-Policy": "strict-origin-when-cross-origin",
      "Permissions-Policy": "camera=(), microphone=(), geolocation=()",
      "Cross-Origin-Opener-Policy": "same-origin",
      "X-Content-Type-Options": "nosniff",
      "Strict-Transport-Security": "max-age=31536000",
    });
  });

  it("keeps health responses non-cacheable and free of internal detail", async () => {
    const response = live();
    expect(response.status).toBe(200);
    expect(response.headers.get("cache-control")).toBe("no-store");
    expect(await response.json()).toEqual({ status: "ok", release: "unknown" });
  });

  it("redacts nested credentials and authorization material from operational logs", () => {
    expect(
      redact(
        {
          requestId: "request-safe",
          authorization: "Bearer secret",
          nested: { refreshToken: "secret", cookie: "secret" },
        },
        ["authorization", "token", "cookie"],
      ),
    ).toEqual({
      requestId: "request-safe",
      authorization: REDACTED,
      nested: { refreshToken: REDACTED, cookie: REDACTED },
    });
  });
});
