import "server-only";

/**
 * A request-scoped channel for `Set-Cookie` values produced mid-request (session
 * refresh). Keyed by the inbound `Request` so it works both under the real Next
 * server and when route handlers are invoked directly in tests — without relying
 * on `next/headers` (which has no request scope in the test harness). The
 * `apiRoute` wrapper drains these onto the outgoing response.
 */
const pending = new WeakMap<Request, string[]>();

export function addPendingSetCookie(req: Request, setCookie: string): void {
  const existing = pending.get(req);
  if (existing) existing.push(setCookie);
  else pending.set(req, [setCookie]);
}

export function takePendingSetCookies(req: Request): readonly string[] {
  const values = pending.get(req);
  if (!values) return [];
  pending.delete(req);
  return values;
}
