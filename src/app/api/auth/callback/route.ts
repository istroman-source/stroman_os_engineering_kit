import { getRequestAuthenticator } from "@/server/composition";
import {
  getAllowedOrigins,
  isAllowedOrigin,
  isCookieSecure,
  serializeSessionCookie,
} from "@/server/auth";
import { HttpError } from "@/server/http/http-error";
import { apiRoute, jsonWithCookies, parseJson } from "@/server/http/respond";
import { CallbackRequest } from "@/server/http/schemas";

/** Refresh cookie lifetime (30 days). The access cookie tracks the token TTL. */
const REFRESH_MAX_AGE_SECONDS = 60 * 60 * 24 * 30;
const DEFAULT_ACCESS_TTL_SECONDS = 3600;

/**
 * Complete a magic-link sign-in. PUBLIC (pre-session) but CSRF-protected: it is
 * only ever called by our own /auth/callback page, so a foreign/absent Origin is
 * rejected. The posted access token (extracted from the provider's redirect
 * fragment by the browser) is NOT trusted on its face — it is re-verified through
 * the SAME authenticator used for every request (JWT signature/issuer/audience/
 * algorithm). Only then are the existing HttpOnly session cookies set. Internal
 * user provisioning stays lazy on the first authenticated request, exactly like
 * the OTP path.
 */
export const POST = apiRoute(async ({ req, requestId }) => {
  if (!isAllowedOrigin(req.headers.get("origin"), getAllowedOrigins())) {
    throw new HttpError(403, "REQUEST_ORIGIN_REJECTED", "The request origin is not allowed.");
  }

  const body = await parseJson(req, CallbackRequest);

  // Re-verify the access token as a bearer credential using the real authenticator.
  const probe = new Request(req.url, {
    headers: { authorization: `Bearer ${body.accessToken}` },
  });
  const outcome = await getRequestAuthenticator().authenticate(probe);
  if (outcome.kind === "unavailable") {
    throw new HttpError(
      503,
      "AUTHENTICATION_UNAVAILABLE",
      "Authentication is temporarily unavailable.",
    );
  }
  if (outcome.kind !== "authenticated") {
    throw new HttpError(401, "INVALID_SESSION", "The sign-in link is invalid or has expired.");
  }

  const secure = isCookieSecure();
  const setCookies = [
    serializeSessionCookie("at", body.accessToken, {
      secure,
      maxAgeSeconds: body.expiresInSeconds ?? DEFAULT_ACCESS_TTL_SECONDS,
    }),
    serializeSessionCookie("rt", body.refreshToken, {
      secure,
      maxAgeSeconds: REFRESH_MAX_AGE_SECONDS,
    }),
  ];
  return jsonWithCookies({ authenticated: true }, { requestId, status: 200, setCookies });
});
