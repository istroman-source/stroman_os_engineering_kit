import { err, ok, type Result } from "@/lib/result";
import type { OwnerId } from "@/domain/project";
import { NotAuthorizedError } from "./errors";

/**
 * Ownership check for resources owned by a user. Possession of a resource id is
 * never sufficient — the acting user must match the resource owner. Returns a
 * typed authorization failure when they do not.
 */
export function ensureOwner(
  actorId: OwnerId,
  ownerId: OwnerId,
  action: string,
): Result<true, NotAuthorizedError> {
  return actorId === ownerId ? ok(true) : err(new NotAuthorizedError(action));
}
