import type {
  AuthProvider,
  IdentityRepository,
  ProvisionedUser,
  ProvisionUserInput,
  User,
  UserId,
  UserIdentity,
} from "@/domain/identity";

/**
 * In-memory `IdentityRepository` for unit tests. Faithful to the contract: the
 * `(provider, providerSubject)` pair is unique and arbitrates provisioning, so a
 * second provision of the same subject returns the first user (never a duplicate)
 * and refreshes `lastAuthenticatedAt`. A `fail` switch exercises repository-error
 * translation. NOT production code.
 */
export class InMemoryIdentityRepository implements IdentityRepository {
  fail = false;
  private readonly usersById = new Map<string, User>();
  private readonly identitiesByKey = new Map<string, UserIdentity>();

  private static key(provider: AuthProvider, subject: string): string {
    return `${provider}:${subject}`;
  }

  private guard(): void {
    if (this.fail) throw new Error("storage failure");
  }

  async findByProviderIdentity(provider: AuthProvider, subject: string): Promise<User | null> {
    this.guard();
    const identity = this.identitiesByKey.get(InMemoryIdentityRepository.key(provider, subject));
    if (!identity) return null;
    return this.usersById.get(identity.userId) ?? null;
  }

  async findById(userId: UserId): Promise<User | null> {
    this.guard();
    return this.usersById.get(userId) ?? null;
  }

  async provision(input: ProvisionUserInput): Promise<ProvisionedUser> {
    this.guard();
    const { user, identity } = input;
    const key = InMemoryIdentityRepository.key(identity.provider, identity.providerSubject);
    const existingIdentity = this.identitiesByKey.get(key);
    if (existingIdentity) {
      this.identitiesByKey.set(key, {
        ...existingIdentity,
        lastAuthenticatedAt: identity.lastAuthenticatedAt,
      });
      const existingUser = this.usersById.get(existingIdentity.userId);
      if (!existingUser) throw new Error("identity references a missing user");
      return { user: existingUser, created: false };
    }
    this.usersById.set(user.id, user);
    this.identitiesByKey.set(key, identity);
    return { user, created: true };
  }

  /** Test helper: force an account into a given status. */
  setStatus(userId: UserId, status: User["status"]): void {
    const user = this.usersById.get(userId);
    if (user) this.usersById.set(userId, { ...user, status });
  }
}
