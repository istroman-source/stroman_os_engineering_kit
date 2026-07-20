import type { PrismaClient } from "@prisma/client";
import { ConflictError } from "@/lib/errors";
import type {
  AuthProvider,
  IdentityRepository,
  ProvisionedUser,
  ProvisionUserInput,
  User,
  UserId,
} from "@/domain/identity";
import { translatePrismaError } from "../errors";
import { toUser, toUserFields, toUserIdentityFields } from "../mappers/identity-mapper";

/**
 * PostgreSQL/Prisma adapter for internal identity.
 *
 * Provisioning is race-safe by construction: the unique `(provider,
 * provider_subject)` index is the arbiter. First login inserts the user AND the
 * identity in ONE transaction (so a losing race rolls back with no orphan user);
 * a concurrent winner causes the loser's identity insert to violate the unique
 * constraint (P2002 → ConflictError), which is handled by re-reading the
 * survivor. A returning login updates `last_authenticated_at`.
 */
export class PrismaIdentityRepository implements IdentityRepository {
  constructor(private readonly db: PrismaClient) {}

  async findByProviderIdentity(provider: AuthProvider, subject: string): Promise<User | null> {
    try {
      const identity = await this.db.userIdentity.findUnique({
        where: { provider_providerSubject: { provider, providerSubject: subject } },
        include: { user: true },
      });
      return identity ? toUser(identity.user) : null;
    } catch (error) {
      throw translatePrismaError(error);
    }
  }

  async findById(userId: UserId): Promise<User | null> {
    try {
      const row = await this.db.user.findUnique({ where: { id: userId } });
      return row ? toUser(row) : null;
    } catch (error) {
      throw translatePrismaError(error);
    }
  }

  async provision(input: ProvisionUserInput): Promise<ProvisionedUser> {
    const { user, identity } = input;

    const existing = await this.findByProviderIdentity(identity.provider, identity.providerSubject);
    if (existing) {
      await this.touch(identity.provider, identity.providerSubject, identity.lastAuthenticatedAt);
      return { user: existing, created: false };
    }

    try {
      await this.db.$transaction(async (tx) => {
        await tx.user.create({ data: toUserFields(user) });
        await tx.userIdentity.create({ data: toUserIdentityFields(identity) });
      });
      return { user, created: true };
    } catch (error) {
      const translated = translatePrismaError(error);
      // A concurrent first login won the race; re-read the survivor rather than
      // creating a duplicate. The failed transaction left no orphan user.
      if (translated instanceof ConflictError) {
        const raced = await this.findByProviderIdentity(
          identity.provider,
          identity.providerSubject,
        );
        if (raced) {
          await this.touch(
            identity.provider,
            identity.providerSubject,
            identity.lastAuthenticatedAt,
          );
          return { user: raced, created: false };
        }
      }
      throw translated;
    }
  }

  private async touch(provider: AuthProvider, subject: string, at: Date): Promise<void> {
    try {
      await this.db.userIdentity.updateMany({
        where: { provider, providerSubject: subject },
        data: { lastAuthenticatedAt: at },
      });
    } catch (error) {
      throw translatePrismaError(error);
    }
  }
}
