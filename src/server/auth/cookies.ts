/**
 * Secure browser session cookies. The access and refresh tokens are stored in
 * HttpOnly cookies so page JavaScript can never read them (XSS cannot exfiltrate
 * the session). Attributes:
 *   - HttpOnly           — not readable by JS
 *   - Secure (prod)      — only sent over HTTPS
 *   - SameSite=Lax       — not sent on cross-site subrequests (first CSRF layer;
 *                          Origin verification is the authoritative second layer)
 *   - Path=/             — scoped to the app
 *   - no Domain          — host-only (no subdomain sharing)
 *   - `__Host-` prefix (prod) — the browser enforces Secure + Path=/ + no Domain
 *
 * In development over http://localhost the `__Host-` prefix and `Secure` are
 * dropped because the browser would otherwise reject the cookie; this difference
 * is intentional and documented.
 */

export type SessionCookie = "at" | "rt";

/** The runtime cookie name for a session token, accounting for the `__Host-` prefix. */
export function cookieName(token: SessionCookie, secure: boolean): string {
  return secure ? `__Host-sos_${token}` : `sos_${token}`;
}

export interface SetCookieOptions {
  readonly secure: boolean;
  readonly maxAgeSeconds: number;
}

/** Serialize a `Set-Cookie` value for a session token. The value is URL-encoded. */
export function serializeSessionCookie(
  token: SessionCookie,
  value: string,
  opts: SetCookieOptions,
): string {
  const parts = [
    `${cookieName(token, opts.secure)}=${encodeURIComponent(value)}`,
    "Path=/",
    "HttpOnly",
    "SameSite=Lax",
    `Max-Age=${Math.max(0, Math.floor(opts.maxAgeSeconds))}`,
  ];
  if (opts.secure) parts.push("Secure");
  return parts.join("; ");
}

/** Serialize a `Set-Cookie` value that clears a session token. */
export function clearSessionCookie(token: SessionCookie, secure: boolean): string {
  const parts = [
    `${cookieName(token, secure)}=`,
    "Path=/",
    "HttpOnly",
    "SameSite=Lax",
    "Max-Age=0",
  ];
  if (secure) parts.push("Secure");
  return parts.join("; ");
}

/** Parse a `Cookie` request header into a name→value map (values URL-decoded). */
export function parseCookies(header: string | null): Map<string, string> {
  const out = new Map<string, string>();
  if (!header) return out;
  for (const pair of header.split(";")) {
    const eq = pair.indexOf("=");
    if (eq === -1) continue;
    const name = pair.slice(0, eq).trim();
    if (name === "") continue;
    const rawValue = pair.slice(eq + 1).trim();
    try {
      out.set(name, decodeURIComponent(rawValue));
    } catch {
      out.set(name, rawValue);
    }
  }
  return out;
}
