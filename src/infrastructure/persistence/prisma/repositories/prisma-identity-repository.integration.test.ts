import type { PrismaClient } from "@prisma/client";
import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";
import {
  type ProvisionUserInput,
  UserId,
  UserIdentityId,
  type UserIdentity,
  type User,
} from "@/domain/identity";
import { PrismaIdentityRepository } from "@/infrastructure/persistence/prisma";
import { createTestPrisma, resetDatabase } from "@test/db/integration-helpers";

const T0 = new Date("2026-07-19T00:00:00.000Z");
const T1 = new Date("2026-07-20T00:00:00.000Z");

let seq = 0;
function nextInput(subject: string, now = T0): ProvisionUserInput {
  seq += 1;
  const user: User = {
    id: UserId.unsafe(`usr_${String(seq).padStart(8, "0")}A`),
    status: "ACTIVE",
    createdAt: now,
    updatedAt: now,
  };
  const identity: UserIdentity = {
    id: UserIdentityId.unsafe(`uid_${String(seq).padStart(8, "0")}A`),
    userId: user.id,
    provider: "SUPABASE",
    providerSubject: subject,
    normalizedEmail: "chef@example.com",
    createdAt: now,
    lastAuthenticatedAt: now,
  };
  return { user, identity };
}

let prisma: PrismaClient;
let repo: PrismaIdentityRepository;

beforeAll(() => {
  prisma = createTestPrisma();
  repo = new PrismaIdentityRepository(prisma);
});
afterAll(async () => {
  await prisma.$disconnect();
});
beforeEach(async () => {
  await resetDatabase(prisma);
});

describe("PrismaIdentityRepository (real PostgreSQL)", () => {
  it("creates a user + identity on first login", async () => {
    const input = nextInput("subject-A");
    const result = await repo.provision(input);
    expect(result.created).toBe(true);
    expect(result.user.id).toBe(input.user.id);

    const found = await repo.findByProviderIdentity("SUPABASE", "subject-A");
    expect(found?.id).toBe(input.user.id);
    const byId = await repo.findById(input.user.id);
    expect(byId?.id).toBe(input.user.id);
  });

  it("returns the existing user (no duplicate) on repeat login and refreshes lastAuthenticatedAt", async () => {
    const first = await repo.provision(nextInput("subject-B", T0));
    const again = nextInput("subject-B", T1); // different candidate ids, same subject
    const second = await repo.provision(again);
    expect(second.created).toBe(false);
    expect(second.user.id).toBe(first.user.id); // NOT the second candidate id

    const users = await prisma.user.count();
    const identities = await prisma.userIdentity.count();
    expect(users).toBe(1);
    expect(identities).toBe(1);

    const row = await prisma.userIdentity.findFirstOrThrow({
      where: { provider: "SUPABASE", providerSubject: "subject-B" },
    });
    expect(row.lastAuthenticatedAt.toISOString()).toBe(T1.toISOString());
  });

  it("is race-safe: concurrent first logins create exactly one user", async () => {
    const inputs = Array.from({ length: 6 }, () => nextInput("subject-RACE"));
    const results = await Promise.all(inputs.map((i) => repo.provision(i)));
    const ids = new Set(results.map((r) => r.user.id));
    expect(ids.size).toBe(1);
    expect(results.filter((r) => r.created)).toHaveLength(1);
    expect(await prisma.user.count()).toBe(1);
    expect(await prisma.userIdentity.count()).toBe(1);
  });

  it("enforces provider-identity uniqueness at the database", async () => {
    await repo.provision(nextInput("subject-U"));
    const dup = nextInput("subject-U");
    const outcome = await repo.provision(dup);
    // A duplicate subject resolves to the first user, never a second row.
    expect(outcome.created).toBe(false);
    expect(await prisma.userIdentity.count()).toBe(1);
  });

  it("maps distinct subjects to distinct users", async () => {
    const a = await repo.provision(nextInput("subject-1"));
    const b = await repo.provision(nextInput("subject-2"));
    expect(a.user.id).not.toBe(b.user.id);
    expect(await prisma.user.count()).toBe(2);
  });

  it("reports a disabled account's status", async () => {
    const created = await repo.provision(nextInput("subject-D"));
    await prisma.user.update({ where: { id: created.user.id }, data: { status: "DISABLED" } });
    const found = await repo.findByProviderIdentity("SUPABASE", "subject-D");
    expect(found?.status).toBe("DISABLED");
  });
});
