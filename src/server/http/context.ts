import "server-only";

import { createId } from "@/lib/id";

export const REQUEST_ID_HEADER = "x-request-id";

const REQUEST_ID_PATTERN = /^[A-Za-z0-9._-]{1,200}$/;

/**
 * Use an inbound request id only if it is safe (no control characters, bounded
 * length); otherwise mint one. Prevents log/response injection via the header.
 */
export function resolveRequestId(headers: Headers): string {
  const inbound = headers.get(REQUEST_ID_HEADER);
  if (inbound && REQUEST_ID_PATTERN.test(inbound)) return inbound;
  return createId({ prefix: "req" });
}

// The temporary development actor mechanism (`resolveActor` / `X-Stroman-Actor-Id`)
// has been REMOVED. Real caller identity is established by `authenticateRequest`
// in `@/server/auth`, which verifies a Supabase session and maps it to an internal
// actor. No caller-controlled identity header exists.
