import type { PrismaClient } from "@prisma/client";
import { Prisma } from "@prisma/client";
import { UserId } from "@/domain/identity";
import type { PrivateBetaAccessRepository, PrivateBetaGrant } from "@/domain/private-beta";

const INITIAL_OWNER_BOOTSTRAP_KEY = "initial-owner";

function toGrant(row: {
  userId: string;
  role: "OWNER" | "TESTER";
  grantedAt: Date;
  revokedAt: Date | null;
}): PrivateBetaGrant {
  return {
    userId: UserId.unsafe(row.userId),
    role: row.role,
    grantedAt: row.grantedAt,
    revokedAt: row.revokedAt,
  };
}

export class PrismaPrivateBetaAccessRepository implements PrivateBetaAccessRepository {
  constructor(private readonly db: PrismaClient) {}

  async findByUserId(userId: UserId): Promise<PrivateBetaGrant | null> {
    const row = await this.db.privateBetaAccess.findUnique({ where: { userId } });
    return row ? toGrant(row) : null;
  }

  async claimInitialOwner(input: {
    userId: UserId;
    grantedAt: Date;
    eventId: string;
  }): Promise<PrivateBetaGrant | null> {
    try {
      return await this.db.$transaction(async (tx) => {
        const current = await tx.privateBetaAccess.findUnique({ where: { userId: input.userId } });
        if (current) return toGrant(current);
        const row = await tx.privateBetaAccess.create({
          data: {
            userId: input.userId,
            role: "OWNER",
            bootstrapKey: INITIAL_OWNER_BOOTSTRAP_KEY,
            grantedAt: input.grantedAt,
          },
        });
        await tx.privateBetaAccessEvent.create({
          data: {
            id: input.eventId,
            actorUserId: input.userId,
            targetUserId: input.userId,
            action: "OWNER_BOOTSTRAPPED",
            occurredAt: input.grantedAt,
          },
        });
        return toGrant(row);
      });
    } catch (error) {
      if (!(error instanceof Prisma.PrismaClientKnownRequestError) || error.code !== "P2002") {
        throw error;
      }
      const winner = await this.db.privateBetaAccess.findUnique({
        where: { bootstrapKey: INITIAL_OWNER_BOOTSTRAP_KEY },
      });
      return winner?.userId === input.userId ? toGrant(winner) : null;
    }
  }

  async list(): Promise<readonly PrivateBetaGrant[]> {
    const rows = await this.db.privateBetaAccess.findMany({ orderBy: { grantedAt: "asc" } });
    return rows.map(toGrant);
  }

  async grantTester(input: {
    actorUserId: UserId;
    targetUserId: UserId;
    grantedAt: Date;
    eventId: string;
  }): Promise<PrivateBetaGrant> {
    return this.db.$transaction(async (tx) => {
      const current = await tx.privateBetaAccess.findUnique({
        where: { userId: input.targetUserId },
      });
      if (current?.role === "OWNER") {
        throw new Error("The initial owner cannot be changed by tester administration.");
      }
      const row = await tx.privateBetaAccess.upsert({
        where: { userId: input.targetUserId },
        create: {
          userId: input.targetUserId,
          role: "TESTER",
          grantedByUserId: input.actorUserId,
          grantedAt: input.grantedAt,
        },
        update: {
          grantedByUserId: input.actorUserId,
          grantedAt: input.grantedAt,
          revokedAt: null,
        },
      });
      await tx.privateBetaAccessEvent.create({
        data: {
          id: input.eventId,
          actorUserId: input.actorUserId,
          targetUserId: input.targetUserId,
          action: "ACCESS_GRANTED",
          occurredAt: input.grantedAt,
        },
      });
      return toGrant(row);
    });
  }

  async revokeTester(input: {
    actorUserId: UserId;
    targetUserId: UserId;
    revokedAt: Date;
    eventId: string;
  }): Promise<PrivateBetaGrant | null> {
    return this.db.$transaction(async (tx) => {
      const current = await tx.privateBetaAccess.findUnique({
        where: { userId: input.targetUserId },
      });
      if (!current || current.role === "OWNER" || current.revokedAt)
        return current ? toGrant(current) : null;
      const row = await tx.privateBetaAccess.update({
        where: { userId: input.targetUserId },
        data: { revokedAt: input.revokedAt },
      });
      await tx.privateBetaAccessEvent.create({
        data: {
          id: input.eventId,
          actorUserId: input.actorUserId,
          targetUserId: input.targetUserId,
          action: "ACCESS_REVOKED",
          occurredAt: input.revokedAt,
        },
      });
      return toGrant(row);
    });
  }

  async findUserIdByNormalizedEmail(email: string): Promise<UserId | null> {
    const identity = await this.db.userIdentity.findFirst({
      where: { normalizedEmail: email },
      orderBy: { lastAuthenticatedAt: "desc" },
      select: { userId: true },
    });
    return identity ? UserId.unsafe(identity.userId) : null;
  }
}
