import { describe, expect, it } from "vitest";
import { UserId } from "@/domain/identity";
import {
  PrivateBetaAccessService,
  type PrivateBetaAccessRepository,
  type PrivateBetaGrant,
} from "./private-beta-access";

const OWNER = UserId.unsafe("usr_OWNER0001");
const TESTER = UserId.unsafe("usr_TESTER001");
const NOW = new Date("2026-08-13T12:00:00.000Z");

class FakeAccessRepository implements PrivateBetaAccessRepository {
  readonly grants = new Map<string, PrivateBetaGrant>();
  claimCount = 0;

  async findByUserId(userId: UserId): Promise<PrivateBetaGrant | null> {
    return this.grants.get(userId) ?? null;
  }

  async claimInitialOwner(input: {
    userId: UserId;
    grantedAt: Date;
  }): Promise<PrivateBetaGrant | null> {
    this.claimCount += 1;
    if ([...this.grants.values()].some((grant) => grant.role === "OWNER")) return null;
    const grant: PrivateBetaGrant = {
      userId: input.userId,
      role: "OWNER",
      grantedAt: input.grantedAt,
      revokedAt: null,
    };
    this.grants.set(input.userId, grant);
    return grant;
  }

  async list(): Promise<readonly PrivateBetaGrant[]> {
    return [...this.grants.values()];
  }

  async grantTester(): Promise<PrivateBetaGrant> {
    throw new Error("not used");
  }

  async revokeTester(): Promise<PrivateBetaGrant | null> {
    throw new Error("not used");
  }

  async findUserIdByNormalizedEmail(): Promise<UserId | null> {
    return null;
  }
}

function service(access: FakeAccessRepository, bootstrapOwnerEmail = "owner@example.com") {
  return new PrivateBetaAccessService({
    access,
    bootstrapOwnerEmail,
    now: () => NOW,
    eventId: () => "pbe_EVENT0001",
  });
}

describe("PrivateBetaAccessService", () => {
  it("authorizes an active persisted grant without consulting bootstrap identity", async () => {
    const access = new FakeAccessRepository();
    access.grants.set(TESTER, {
      userId: TESTER,
      role: "TESTER",
      grantedAt: NOW,
      revokedAt: null,
    });
    await expect(service(access).authorize(TESTER, "someone-else@example.com")).resolves.toBe(
      "TESTER",
    );
    expect(access.claimCount).toBe(0);
  });

  it("claims the singleton owner only for the verified normalized bootstrap email", async () => {
    const access = new FakeAccessRepository();
    await expect(service(access).authorize(OWNER, "  OWNER@EXAMPLE.COM ")).resolves.toBe("OWNER");
    expect(access.claimCount).toBe(1);
    expect(access.grants.get(OWNER)?.role).toBe("OWNER");
  });

  it("denies a nonmatching account without creating an access record", async () => {
    const access = new FakeAccessRepository();
    await expect(service(access).authorize(TESTER, "tester@example.com")).resolves.toBeNull();
    expect(access.claimCount).toBe(0);
    expect(access.grants.size).toBe(0);
  });

  it("keeps a revoked account denied even if its email later matches bootstrap", async () => {
    const access = new FakeAccessRepository();
    access.grants.set(OWNER, {
      userId: OWNER,
      role: "TESTER",
      grantedAt: NOW,
      revokedAt: new Date("2026-08-13T13:00:00.000Z"),
    });
    await expect(service(access).authorize(OWNER, "owner@example.com")).resolves.toBeNull();
    expect(access.claimCount).toBe(0);
  });

  it("denies later matching users after another owner won the singleton claim", async () => {
    const access = new FakeAccessRepository();
    await expect(service(access).authorize(OWNER, "owner@example.com")).resolves.toBe("OWNER");
    await expect(service(access).authorize(TESTER, "owner@example.com")).resolves.toBeNull();
    expect(access.claimCount).toBe(2);
  });
});
