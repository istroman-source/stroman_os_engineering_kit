import type { CredentialSource } from "../types";
import { parseCookies } from "../cookies";

export interface ExtractedToken {
  readonly token: string;
  readonly via: CredentialSource;
}

/**
 * Extract the caller's access token from a request. A bearer `Authorization`
 * header (future mobile / API clients) takes precedence over the browser session
 * cookie; the source is reported so CSRF handling can differ. Returns null when
 * no credential is present (→ anonymous, fail-closed).
 */
export function extractAccessToken(req: Request, accessCookieName: string): ExtractedToken | null {
  const authorization = req.headers.get("authorization");
  if (authorization) {
    const match = /^Bearer\s+(.+)$/i.exec(authorization.trim());
    const token = match?.[1]?.trim();
    if (token) return { token, via: "bearer" };
  }
  const cookieValue = parseCookies(req.headers.get("cookie")).get(accessCookieName);
  if (cookieValue && cookieValue.trim() !== "") {
    return { token: cookieValue, via: "cookie" };
  }
  return null;
}
