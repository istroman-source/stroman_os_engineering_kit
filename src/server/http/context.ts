import "server-only";

import { OwnerId } from "@/domain/project";
import { createId } from "@/lib/id";
import { HttpError } from "./http-error";

export const REQUEST_ID_HEADER = "x-request-id";
export const ACTOR_HEADER = "x-stroman-actor-id";

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

/**
 * The temporary development actor mechanism. It is enabled ONLY in the development
 * and test runtimes. Production (or any other NODE_ENV) always disables it, and
 * NO environment variable can override that prohibition — so header-based
 * impersonation is impossible in production. It is fail-closed: ownership-scoped
 * routes cannot be reached in production without real authentication (Prompt 006B
 * replaces this seam with an authenticated identity).
 */
export function devActorEnabled(): boolean {
  const env = process.env.NODE_ENV;
  return env === "development" || env === "test";
}

/** Resolve the acting owner from the request, or throw a stable HttpError. */
export function resolveActor(headers: Headers): OwnerId {
  if (!devActorEnabled()) {
    // Fail closed: never allow header-based impersonation in production.
    throw new HttpError(
      503,
      "ACTOR_CONTEXT_UNAVAILABLE",
      "Authentication is not configured in this environment.",
    );
  }
  const raw = headers.get(ACTOR_HEADER);
  if (raw === null || raw.trim() === "") {
    throw new HttpError(401, "ACTOR_REQUIRED", "An actor context is required.");
  }
  const parsed = OwnerId.parse(raw.trim());
  if (!parsed.ok) {
    throw new HttpError(400, "INVALID_ACTOR", "The actor identifier is malformed.");
  }
  return parsed.value;
}
