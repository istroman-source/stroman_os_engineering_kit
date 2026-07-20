import { normalizeEmail } from "@/application/identity";
import { getAuthGateway } from "@/server/composition";
import { getEmailRedirectUrl } from "@/server/auth";
import { apiRoute, jsonWithCookies, parseJson } from "@/server/http/respond";
import { StartOtpRequest } from "@/server/http/schemas";

const NEUTRAL = {
  message: "If the address can receive a code, a sign-in email has been sent.",
} as const;

/**
 * Begin the passwordless email flow. PUBLIC. The provider emails BOTH a magic link
 * (which returns to /auth/callback) and, if the template includes it, a code. The
 * response is deliberately NEUTRAL (anti-enumeration); abuse is bounded by the
 * provider's native rate limits (429). No session or cookie is created here.
 */
export const POST = apiRoute(async ({ req, requestId }) => {
  const body = await parseJson(req, StartOtpRequest);
  const email = normalizeEmail(body.email) ?? body.email;
  const outcome = await getAuthGateway().startEmailOtp(email, getEmailRedirectUrl());
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
  return jsonWithCookies(NEUTRAL, { requestId, status: 200 });
});
