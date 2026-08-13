import type { PrismaClient } from "@prisma/client";
import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";
import { UserId } from "@/domain/identity";
import { createTestPrisma, resetDatabase } from "@test/db/integration-helpers";
import { PrismaPrivateBetaAccessRepository } from "./prisma-private-beta-access-repository";

const OWNER_A = UserId.unsafe("usr_OWNER0001");
const OWNER_B = UserId.unsafe("usr_OWNER0002");
const TESTER = UserId.unsafe("usr_TESTER001");
const NOW = new Date("2026-08-13T12:00:00.000Z");

let prisma: PrismaClient;
let repository: PrismaPrivateBetaAccessRepository;

beforeAll(() => {
  prisma = createTestPrisma();
  repository = new PrismaPrivateBetaAccessRepository(prisma);
});

afterAll(async () => {
  await prisma.$disconnect();
});

beforeEach(async () => {
  await resetDatabase(prisma);
  await prisma.user.createMany({
    data: [OWNER_A, OWNER_B, TESTER].map((id) => ({
      id,
      status: "ACTIVE" as const,
      createdAt: NOW,
      updatedAt: NOW,
    })),
  });
});

describe("PrismaPrivateBetaAccessRepository", () => {
  it("makes concurrent initial-owner claims a singleton with one audit event", async () => {
    const claims = await Promise.all([
      repository.claimInitialOwner({ userId: OWNER_A, grantedAt: NOW, eventId: "pbe_EVENT0001" }),
      repository.claimInitialOwner({ userId: OWNER_B, grantedAt: NOW, eventId: "pbe_EVENT0002" }),
    ]);

    expect(claims.filter(Boolean)).toHaveLength(1);
    expect(await prisma.privateBetaAccess.count({ where: { role: "OWNER" } })).toBe(1);
    expect(
      await prisma.privateBetaAccessEvent.count({ where: { action: "OWNER_BOOTSTRAPPED" } }),
    ).toBe(1);
  });

  it("grants, revokes, and audits tester access without changing the owner", async () => {
    await repository.claimInitialOwner({
      userId: OWNER_A,
      grantedAt: NOW,
      eventId: "pbe_EVENT0001",
    });
    const granted = await repository.grantTester({
      actorUserId: OWNER_A,
      targetUserId: TESTER,
      grantedAt: NOW,
      eventId: "pbe_EVENT0002",
    });
    expect(granted).toMatchObject({ userId: TESTER, role: "TESTER", revokedAt: null });

    const revokedAt = new Date("2026-08-13T13:00:00.000Z");
    const revoked = await repository.revokeTester({
      actorUserId: OWNER_A,
      targetUserId: TESTER,
      revokedAt,
      eventId: "pbe_EVENT0003",
    });
    expect(revoked?.revokedAt).toEqual(revokedAt);
    expect(await prisma.privateBetaAccessEvent.count()).toBe(3);
    await expect(repository.findByUserId(OWNER_A)).resolves.toMatchObject({ role: "OWNER" });
  });

  it("refuses to demote the singleton owner through tester administration", async () => {
    await repository.claimInitialOwner({
      userId: OWNER_A,
      grantedAt: NOW,
      eventId: "pbe_EVENT0001",
    });
    await expect(
      repository.grantTester({
        actorUserId: OWNER_A,
        targetUserId: OWNER_A,
        grantedAt: NOW,
        eventId: "pbe_EVENT0002",
      }),
    ).rejects.toThrow(/owner cannot be changed/i);
    await expect(repository.findByUserId(OWNER_A)).resolves.toMatchObject({ role: "OWNER" });
  });
});
