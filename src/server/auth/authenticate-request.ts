import "server-only";

import {
  AccountDisabledError,
  type AuthenticatedActor,
  resolveAuthenticatedActor,
} from "@/application/identity";
import { getApiContext, getRequestAuthenticator } from "@/server/composition";
import { HttpError } from "@/server/http/http-error";
import { getAllowedOrigins } from "./config";
import { isAllowedOrigin, isUnsafeMethod } from "./origin";

const BEARER_CHALLENGE = { "WWW-Authenticate": "Bearer" } as const;

/**
 * The single authoritative authentication + authorization gate for protected
 * routes. It replaces the temporary `resolveActor` seam. Steps:
 *   1. Verify request credentials via the composed `RequestAuthenticator`.
 *   2. Fail closed on anonymous / invalid / provider-unavailable outcomes.
 *   3. For cookie-authenticated state-changing requests, enforce CSRF via Origin.
 *   4. Map the verified principal to a stable internal actor (race-safe
 *      provisioning), rejecting disabled accounts.
 *
 * Identity is NEVER taken from a request body, query, or a caller-chosen header.
 * The returned `ownerId` is derived server-side from the internal user id.
 */
export async function authenticateRequest(req: Request): Promise<AuthenticatedActor> {
  const outcome = await getRequestAuthenticator().authenticate(req);

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
