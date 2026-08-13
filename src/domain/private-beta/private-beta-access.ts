import type { UserId } from "@/domain/identity";

export type PrivateBetaRole = "OWNER" | "TESTER";

export interface PrivateBetaGrant {
  readonly userId: UserId;
  readonly role: PrivateBetaRole;
  readonly grantedAt: Date;
  readonly revokedAt: Date | null;
}

export interface PrivateBetaAccessRepository {
  findByUserId(userId: UserId): Promise<PrivateBetaGrant | null>;
  claimInitialOwner(input: {
    userId: UserId;
    grantedAt: Date;
    eventId: string;
  }): Promise<PrivateBetaGrant | null>;
  list(): Promise<readonly PrivateBetaGrant[]>;
  grantTester(input: {
    actorUserId: UserId;
    targetUserId: UserId;
    grantedAt: Date;
    eventId: string;
  }): Promise<PrivateBetaGrant>;
  revokeTester(input: {
    actorUserId: UserId;
    targetUserId: UserId;
    revokedAt: Date;
    eventId: string;
  }): Promise<PrivateBetaGrant | null>;
  findUserIdByNormalizedEmail(email: string): Promise<UserId | null>;
}

export interface PrivateBetaAccessAuthorizer {
  authorize(userId: UserId, verifiedEmail: string | null): Promise<PrivateBetaRole | null>;
}
