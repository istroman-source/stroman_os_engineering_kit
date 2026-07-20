import { normalizeEmail } from "@/application/identity";
import { getAuthGateway } from "@/server/composition";
import { isCookieSecure, serializeSessionCookie } from "@/server/auth";
import { apiRoute, jsonWithCookies, parseJson } from "@/server/http/respond";
import { VerifyOtpRequest } from "@/server/http/schemas";

/** Refresh cookie lifetime (30 days). The access cookie tracks the token TTL. */
const REFRESH_MAX_AGE_SECONDS = 60 * 60 * 24 * 30;

/**
 * Verify an email OTP and establish a browser session. PUBLIC. On success the
 * Supabase access + refresh tokens are stored in secure HttpOnly cookies (never in
 * the body); internal identity is provisioned lazily on the first protected
 * request. Provider error detail is never surfaced.
 */
export const POST = apiRoute(async ({ req, requestId }) => {
  const body = await parseJson(req, VerifyOtpRequest);
  const email = normalizeEmail(body.email) ?? body.email;
  const outcome = await getAuthGateway().verifyEmailOtp(email, body.token);

  if (outcome.kind === "invalid") {
    return jsonWithCookies(
      { error: { code: "INVALID_OTP", message: "The verification code is invalid.", requestId } },
      { requestId, status: 401 },
    );
  }
  if (outcome.kind === "rate_limited") {
    return jsonWithCookies(
      { error: { code: "RATE_LIMITED", message: "Too many requests.", requestId } },
      { requestId, status: 429 },
    );
  }
  if (outcome.kind === "unavailable") {
    return jsonWithCookies(
      {
        error: {
          code: "AUTHENTICATION_UNAVAILABLE",
          message: "Authentication is temporarily unavailable.",
          requestId,
        },
      },
      { requestId, status: 503 },
    );
  }

  const secure = isCookieSecure();
  const setCookies = [
    serializeSessionCookie("at", outcome.session.accessToken, {
      secure,
      maxAgeSeconds: outcome.session.expiresInSeconds,
    }),
    serializeSessionCookie("rt", outcome.session.refreshToken, {
      secure,
      maxAgeSeconds: REFRESH_MAX_AGE_SECONDS,
    }),
  ];
  return jsonWithCookies({ authenticated: true }, { requestId, status: 200, setCookies });
});
