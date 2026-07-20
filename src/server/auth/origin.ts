/**
 * CSRF defense via Origin verification. Cookie-authenticated state-changing
 * requests carry ambient credentials, so they must prove they originate from an
 * allowed origin. This is INTENTIONALLY independent of CORS (CORS restricts what
 * a browser exposes to script; it does not stop the forged request itself).
 *
 * Bearer-authenticated requests are exempt: a bearer token is not sent
 * automatically by the browser, so it is not vulnerable to ambient-credential
 * CSRF. The exemption is applied by the caller, not here.
 */

const SAFE_METHODS = new Set(["GET", "HEAD", "OPTIONS"]);

/** True for methods that can change state and therefore require CSRF proof. */
export function isUnsafeMethod(method: string): boolean {
  return !SAFE_METHODS.has(method.toUpperCase());
}

/**
 * Verify the request `Origin` against the allowlist. A MISSING Origin on an
 * unsafe request fails closed (returns false): we never assume same-origin.
 */
export function isAllowedOrigin(origin: string | null, allowed: readonly string[]): boolean {
  if (origin === null || origin.trim() === "") return false;
  return allowed.includes(origin);
}
