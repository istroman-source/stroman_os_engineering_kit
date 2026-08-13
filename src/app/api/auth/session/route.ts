import { resolvePrivateBetaRole, resolveRequestIdentity } from "@/server/auth";
import { apiRoute, jsonWithCookies } from "@/server/http/respond";
import { HttpError } from "@/server/http/http-error";

/**
 * Report session and private-beta access state. PUBLIC (safe GET). Returns only
 * booleans — never user id, email, tokens, claims, or the configured allowlist.
 * Provider/identity/access-store failures remain distinct 503 responses so the
 * browser never mistakes an outage for a signed-out or denied account.
 */
export const GET = apiRoute(async ({ req, requestId }) => {
  try {
    const resolved = await resolveRequestIdentity(req);
    const role = await resolvePrivateBetaRole(resolved);
    return jsonWithCookies(
      { authenticated: true, privateBetaAccess: role !== null },
      { requestId },
    );
  } catch (error) {
    if (error instanceof HttpError && error.status === 401) {
      return jsonWithCookies({ authenticated: false, privateBetaAccess: false }, { requestId });
    }
    throw error;
  }
});
