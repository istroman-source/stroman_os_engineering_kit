import type { AccountStatus, UserId } from "./user-id";

/**
 * An internal Stroman OS user — the stable identity that owns business data.
 * It carries no profile, email, billing, or preference fields: authentication
 * concerns (email, provider subject) live on `UserIdentity`, and nothing else is
 * modeled until a use case needs it.
 */
export interface User {
  readonly id: UserId;
  readonly status: AccountStatus;
  readonly createdAt: Date;
  readonly updatedAt: Date;
}

/** True when the user may access resources (i.e. is not disabled). */
export function isActive(user: User): boolean {
  return user.status === "ACTIVE";
}
