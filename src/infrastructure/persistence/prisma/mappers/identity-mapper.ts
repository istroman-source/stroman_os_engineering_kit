import type { Prisma, User as UserRow } from "@prisma/client";
import { type User, UserId, type UserIdentity } from "@/domain/identity";
import { orThrowMapping } from "./shared";

/** Map a persisted user row into the domain `User` (validating the branded id). */
export function toUser(row: UserRow): User {
  return {
    id: orThrowMapping(UserId.parse(row.id), `user.id="${row.id}"`),
    status: row.status,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  };
}

/** Column values for inserting a user. */
export function toUserFields(user: User): Prisma.UserCreateManyInput {
  return {
    id: user.id,
    status: user.status,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  };
}

/** Column values for inserting a provider-identity mapping. */
export function toUserIdentityFields(identity: UserIdentity): Prisma.UserIdentityCreateManyInput {
  return {
    id: identity.id,
    userId: identity.userId,
    provider: identity.provider,
    providerSubject: identity.providerSubject,
    normalizedEmail: identity.normalizedEmail,
    createdAt: identity.createdAt,
    lastAuthenticatedAt: identity.lastAuthenticatedAt,
  };
}
