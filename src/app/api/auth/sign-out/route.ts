import { getAuthGateway } from "@/server/composition";
import {
  clearSessionCookie,
  cookieName,
  getAllowedOrigins,
  isAllowedOrigin,
  isCookieSecure,
  parseCookies,
} from "@/server/auth";
import { apiRoute, jsonWithCookies } from "@/server/http/respond";
import { HttpError } from "@/server/http/http-error";

/**
 * Sign out the browser session. Idempotent: always clears the session cookies and
 * returns 200, even without an active session. CSRF-protected — a cookie-bearing
 * sign-out must come from an allowed origin (a forged cross-site sign-out is
 * disruptive, if not dangerous). Provider-side revocation is best-effort; clearing
 * the HttpOnly cookies is the authoritative browser action.
 */
export const POST = apiRoute(async ({ req, requestId }) => {
  const secure = isCookieSecure();
  const cookies = parseCookies(req.headers.get("cookie"));
  const accessToken = cookies.get(cookieName("at", secure));

  if (accessToken && !isAllowedOrigin(req.headers.get("origin"), getAllowedOrigins())) {
    throw new HttpError(403, "REQUEST_ORIGIN_REJECTED", "The request origin is not allowed.");
  }

  if (accessToken) await getAuthGateway().signOut(accessToken);

  return jsonWithCookies(
    { ok: true },
    {
      requestId,
      status: 200,
      setCookies: [clearSessionCookie("at", secure), clearSessionCookie("rt", secure)],
    },
  );
});
