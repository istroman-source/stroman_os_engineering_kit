import type { UserId } from "@/domain/identity";
import type { OwnerId } from "@/domain/project";

/**
 * The resolved, authorized caller for a request. Produced only after a verified
 * principal has been mapped to a stable internal user and the account confirmed
 * active. `ownerId` is derived server-side from `userId` (owner mapping Option A:
 * the internal user id is the owner id) — it never comes from a request body,
 * header, or the provider subject.
 */
export interface AuthenticatedActor {
  readonly userId: UserId;
  readonly ownerId: OwnerId;
}
