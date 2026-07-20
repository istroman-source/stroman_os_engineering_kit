import { getRequestAuthenticator } from "@/server/composition";
import { apiRoute, jsonWithCookies } from "@/server/http/respond";

/**
 * Report whether the caller has a valid session. PUBLIC (safe GET). Returns only a
 * boolean — never the user id, email, tokens, or claims. Used by the browser to
 * decide whether to show signed-in UI. A provider outage reports `authenticated:
 * false` (fail closed) rather than an error, since this endpoint is advisory.
 */
export const GET = apiRoute(async ({ req, requestId }) => {
  const outcome = await getRequestAuthenticator().authenticate(req);
  return jsonWithCookies({ authenticated: outcome.kind === "authenticated" }, { requestId });
});
