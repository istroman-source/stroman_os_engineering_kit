import { describe, expect, it } from "vitest";
import { extractAccessToken } from "./token-source";

function req(headers: Record<string, string>): Request {
  return new Request("http://localhost/api", { headers });
}

describe("extractAccessToken", () => {
  it("prefers a bearer token and reports via=bearer", () => {
    const out = extractAccessToken(req({ authorization: "Bearer abc.def.ghi" }), "sos_at");
    expect(out).toEqual({ token: "abc.def.ghi", via: "bearer" });
  });

  it("falls back to the session cookie and reports via=cookie", () => {
    const out = extractAccessToken(req({ cookie: "sos_at=cookie.token" }), "sos_at");
    expect(out).toEqual({ token: "cookie.token", via: "cookie" });
  });

  it("bearer wins when both are present", () => {
    const out = extractAccessToken(
      req({ authorization: "Bearer header.token", cookie: "sos_at=cookie.token" }),
      "sos_at",
    );
    expect(out?.via).toBe("bearer");
  });

  it("returns null when no credential is present", () => {
    expect(extractAccessToken(req({}), "sos_at")).toBeNull();
    expect(extractAccessToken(req({ authorization: "Bearer " }), "sos_at")).toBeNull();
    expect(extractAccessToken(req({ cookie: "other=x" }), "sos_at")).toBeNull();
  });
});
