import { normalizeEmail } from "@/application/identity";
import type { UserId } from "@/domain/identity";
import type {
  PrivateBetaAccessAuthorizer,
  PrivateBetaAccessRepository,
  PrivateBetaRole,
} from "@/domain/private-beta";

export type {
  PrivateBetaAccessAuthorizer,
  PrivateBetaAccessRepository,
  PrivateBetaGrant,
  PrivateBetaRole,
} from "@/domain/private-beta";

export interface PrivateBetaAccessServiceDeps {
  readonly access: PrivateBetaAccessRepository;
  readonly bootstrapOwnerEmail?: string;
  readonly now: () => Date;
  readonly eventId: () => string;
}

/**
 * Persistent private-beta authorization. Existing active grants are keyed only
 * by internal UserId. The verified provider email is consulted solely for the
 * one-time, race-safe initial-owner claim and is never stored in the access row.
 */
export class PrivateBetaAccessService implements PrivateBetaAccessAuthorizer {
  constructor(private readonly deps: PrivateBetaAccessServiceDeps) {}

  async authorize(userId: UserId, verifiedEmail: string | null): Promise<PrivateBetaRole | null> {
    const existing = await this.deps.access.findByUserId(userId);
    if (existing && existing.revokedAt === null) return existing.role;
    if (existing) return null;

    const expected = normalizeEmail(this.deps.bootstrapOwnerEmail);
    const actual = normalizeEmail(verifiedEmail);
    if (!expected || !actual || expected !== actual) return null;

    const claimed = await this.deps.access.claimInitialOwner({
      userId,
      grantedAt: this.deps.now(),
      eventId: this.deps.eventId(),
    });
    return claimed?.revokedAt === null ? claimed.role : null;
  }
}
