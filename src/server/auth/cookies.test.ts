import { describe, expect, it } from "vitest";
import { clearSessionCookie, cookieName, parseCookies, serializeSessionCookie } from "./cookies";

describe("cookieName", () => {
  it("uses the __Host- prefix only when secure (production)", () => {
    expect(cookieName("at", true)).toBe("__Host-sos_at");
    expect(cookieName("rt", true)).toBe("__Host-sos_rt");
    expect(cookieName("at", false)).toBe("sos_at");
  });
});

describe("serializeSessionCookie", () => {
  it("sets HttpOnly, SameSite=Lax, Path=/, Max-Age and Secure in production", () => {
    const cookie = serializeSessionCookie("at", "token.value", {
      secure: true,
      maxAgeSeconds: 3600,
    });
    expect(cookie).toContain("__Host-sos_at=token.value");
    expect(cookie).toContain("HttpOnly");
    expect(cookie).toContain("SameSite=Lax");
    expect(cookie).toContain("Path=/");
    expect(cookie).toContain("Max-Age=3600");
    expect(cookie).toContain("Secure");
    // __Host- requires no Domain attribute.
    expect(cookie).not.toContain("Domain=");
  });

  it("omits Secure and the __Host- prefix in development", () => {
    const cookie = serializeSessionCookie("at", "v", { secure: false, maxAgeSeconds: 60 });
    expect(cookie.startsWith("sos_at=")).toBe(true);
    expect(cookie).not.toContain("Secure");
  });

  it("url-encodes the value", () => {
    const cookie = serializeSessionCookie("rt", "a b;c", { secure: false, maxAgeSeconds: 60 });
    expect(cookie).toContain("sos_rt=a%20b%3Bc");
  });
});

describe("clearSessionCookie", () => {
  it("expires the cookie immediately", () => {
    expect(clearSessionCookie("at", true)).toContain("Max-Age=0");
    expect(clearSessionCookie("at", true)).toContain("__Host-sos_at=");
  });
});

describe("parseCookies", () => {
  it("parses and url-decodes a cookie header", () => {
    const map = parseCookies("sos_at=a%20b; other=x");
    expect(map.get("sos_at")).toBe("a b");
    expect(map.get("other")).toBe("x");
  });

  it("returns an empty map for a null header", () => {
    expect(parseCookies(null).size).toBe(0);
  });
});
