import type { UserIdentity } from "./provider-identity";
import type { User } from "./user";
import type { UserId } from "./user-id";

/**
 * The details required to provision (or re-resolve) a user on authentication.
 * The application supplies stable ids and timestamps; the repository performs the
 * atomic, race-safe first-login create-or-get.
 */
export interface ProvisionUserInput {
  readonly user: User;
  readonly identity: UserIdentity;
}

/** Outcome of provisioning: the resolved user and whether it was newly created. */
export interface ProvisionedUser {
  readonly user: User;
  readonly created: boolean;
}

/**
 * Persistence port for internal identity. Implemented by infrastructure; the
 * application depends only on this contract. No provider SDK types cross it.
 */
export interface IdentityRepository {
  /** Resolve a user by a provider identity, or null if none is mapped. */
  findByProviderIdentity(
    provider: UserIdentity["provider"],
    providerSubject: string,
  ): Promise<User | null>;

  /** Resolve a user by internal id, or null if absent. */
  findById(userId: UserId): Promise<User | null>;

  /**
   * Atomically create the user + provider identity on first login, or return the
   * existing user if the identity already exists. Must be race-safe: concurrent
   * first-login requests for the same provider subject resolve to exactly one
   * user (the unique `(provider, providerSubject)` constraint is the arbiter),
   * and the loser re-reads rather than creating a duplicate. When the identity
   * already exists it refreshes `lastAuthenticatedAt`. Never partially creates.
   */
  provision(input: ProvisionUserInput): Promise<ProvisionedUser>;
}
