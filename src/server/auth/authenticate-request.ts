import "server-only";

import {
  AccountDisabledError,
  type AuthenticatedActor,
  resolveAuthenticatedActor,
} from "@/application/identity";
import { getApiContext, getAuthGateway, getRequestAuthenticator } from "@/server/composition";
import { HttpError } from "@/server/http/http-error";
import { getAllowedOrigins, isCookieSecure } from "./config";
import { cookieName, parseCookies, serializeSessionCookie } from "./cookies";
import { isAllowedOrigin, isUnsafeMethod } from "./origin";
import { addPendingSetCookie } from "./pending-cookies";
import type { AuthOutcome } from "./types";

const BEARER_CHALLENGE = { "WWW-Authenticate": "Bearer" } as const;
/** Refresh-cookie lifetime (30 days), matching the OTP/callback session cookies. */
const REFRESH_MAX_AGE_SECONDS = 60 * 60 * 24 * 30;
const DEFAULT_ACCESS_TTL_SECONDS = 3600;

/**
 * The single authoritative authentication + authorization gate for protected
 * routes. Steps:
 *   1. Verify request credentials via the composed `RequestAuthenticator`.
 *   2. If the access token is missing/expired but a refresh-token cookie is
 *      present, transparently refresh the session (rotating both cookies) so the
 *      user stays signed in across refreshes, browser restarts, and dev restarts.
 *   3. Fail closed on anonymous / invalid / provider-unavailable outcomes.
 *   4. For cookie-authenticated state-changing requests, enforce CSRF via Origin.
 *   5. Map the verified principal to a stable internal actor.
 *
 * Identity is NEVER taken from a request body, query, or caller-chosen header.
 */
export async function authenticateRequest(req: Request): Promise<AuthenticatedActor> {
  let outcome = await getRequestAuthenticator().authenticate(req);

  // The access token is gone or expired — try the refresh cookie before failing.
  if (outcome.kind === "anonymous" || outcome.kind === "invalid") {
    const refreshed = await tryRefresh(req);
    if (refreshed) outcome = refreshed;
  }

  if (outcome.kind === "anonymous") {
    throw new HttpError(
      401,
      "AUTHENTICATION_REQUIRED",
      "Authentication is required.",
      undefined,
      BEARER_CHALLENGE,
    );
  }
  if (outcome.kind === "invalid") {
    throw new HttpError(
      401,
      "INVALID_SESSION",
      "The session is invalid or has expired.",
      undefined,
      BEARER_CHALLENGE,
    );
  }
  if (outcome.kind === "unavailable") {
    throw new HttpError(
      503,
      "AUTHENTICATION_UNAVAILABLE",
      "Authentication is temporarily unavailable.",
    );
  }

  // CSRF: ambient cookie credentials on a state-changing request must prove an
  // allowed origin. Bearer credentials are not sent automatically and are exempt.
  if (outcome.via === "cookie" && isUnsafeMethod(req.method)) {
    if (!isAllowedOrigin(req.headers.get("origin"), getAllowedOrigins())) {
      throw new HttpError(403, "REQUEST_ORIGIN_REJECTED", "The request origin is not allowed.");
    }
  }

  const resolved = await resolveAuthenticatedActor(getApiContext(), {
    principal: outcome.principal,
  });
  if (!resolved.ok) {
    if (resolved.error instanceof AccountDisabledError) {
      throw new HttpError(403, "ACCOUNT_DISABLED", "This account is disabled.");
    }
    // Identity store failure — never grant access.
    throw new HttpError(
      503,
      "AUTHENTICATION_UNAVAILABLE",
      "Authentication is temporarily unavailable.",
    );
  }
  return resolved.value;
}

/**
 * Exchange the refresh-token cookie for a fresh session, verify the new access
 * token, and queue rotated Set-Cookie headers on the response. Returns an
 * authenticated outcome, or null when there is no usable refresh cookie / the
 * refresh fails (caller then fails closed). Never grants access on an unverifiable
 * token.
 */
async function tryRefresh(req: Request): Promise<AuthOutcome | null> {
  const secure = isCookieSecure();
  const refreshToken = parseCookies(req.headers.get("cookie")).get(cookieName("rt", secure));
  if (!refreshToken || refreshToken.trim() === "") return null;

  const session = await getAuthGateway().refreshSession(refreshToken);
  if (!session) return null;

  // Re-verify the freshly issued access token through the same authenticator.
  const probe = new Request(req.url, {
    headers: { authorization: `Bearer ${session.accessToken}` },
  });
  const verified = await getRequestAuthenticator().authenticate(probe);
  if (verified.kind !== "authenticated") return null;

  addPendingSetCookie(
    req,
    serializeSessionCookie("at", session.accessToken, {
      secure,
      maxAgeSeconds: session.expiresInSeconds || DEFAULT_ACCESS_TTL_SECONDS,
    }),
  );
  addPendingSetCookie(
    req,
    serializeSessionCookie("rt", session.refreshToken, {
      secure,
      maxAgeSeconds: REFRESH_MAX_AGE_SECONDS,
    }),
  );

  // The refreshed session is a cookie session (subject to CSRF like any other).
  return { kind: "authenticated", principal: verified.principal, via: "cookie" };
}
