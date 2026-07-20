import type { PrismaClient } from "@prisma/client";
import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";
import { NotFoundError, OptimisticConcurrencyError } from "@/lib/errors";
import {
  type CreativeBrief,
  CreativeBriefId,
  createCreativeBrief,
  reviseCreativeBrief,
} from "@/domain/creative";
import { ProjectId } from "@/domain/project";
import { PrismaCreativeBriefRepository } from "@/infrastructure/persistence/prisma";
import { createTestPrisma, resetDatabase } from "@test/db/integration-helpers";

const T0 = new Date("2026-07-19T00:00:00.000Z");
const T1 = new Date("2026-07-20T00:00:00.000Z");
const PROJECT = ProjectId.unsafe("proj_AAAAAAA1");

function fields() {
  return {
    title: "Signature Dish Reel",
    client: "Jimmy's Famous Seafood",
    projectType: "Instagram reel",
    creativeGoal: "make viewers crave the crab cake",
    targetAudience: "Baltimore food lovers",
    desiredEmotion: "hungry",
    context: "20s vertical.",
  };
}

function brief(): CreativeBrief {
  const result = createCreativeBrief({
    id: CreativeBriefId.unsafe("brief_AAAAAAA1"),
    projectId: PROJECT,
    now: T0,
    ...fields(),
  });
  if (!result.ok) throw result.error;
  return result.value;
}

async function expectThrown(promise: Promise<unknown>): Promise<unknown> {
  try {
    await promise;
  } catch (error) {
    return error;
  }
  throw new Error("expected the operation to throw");
}

let prisma: PrismaClient;
let repo: PrismaCreativeBriefRepository;

beforeAll(() => {
  prisma = createTestPrisma();
  repo = new PrismaCreativeBriefRepository(prisma);
});
afterAll(async () => {
  await prisma.$disconnect();
});
beforeEach(async () => {
  await resetDatabase(prisma);
  await prisma.project.create({
    data: {
      id: PROJECT,
      ownerId: "usr_AAAAAAAA",
      name: "P",
      status: "DRAFT",
      createdAt: T0,
      updatedAt: T0,
    },
  });
});

describe("PrismaCreativeBriefRepository (real PostgreSQL)", () => {
  it("inserts and loads a brief by project", async () => {
    await repo.insert(brief());
    const loaded = await repo.findByProject(PROJECT);
    expect(loaded?.title).toBe("Signature Dish Reel");
    expect(loaded?.lockVersion).toBe(1);
  });

  it("updates via compare-and-swap and rejects a stale write", async () => {
    await repo.insert(brief());
    const current = await repo.findByProject(PROJECT);
    if (!current) throw new Error("expected brief");

    const revised = reviseCreativeBrief(current, { ...fields(), desiredEmotion: "nostalgic" }, T1);
    if (!revised.ok) throw revised.error;
    await repo.update(revised.value);

    const reloaded = await repo.findByProject(PROJECT);
    expect(reloaded?.desiredEmotion).toBe("nostalgic");
    expect(reloaded?.lockVersion).toBe(2);

    // A second update at the old lockVersion is rejected.
    expect(await expectThrown(repo.update(revised.value))).toBeInstanceOf(
      OptimisticConcurrencyError,
    );
  });

  it("rejects updating a missing brief", async () => {
    expect(await expectThrown(repo.update(brief()))).toBeInstanceOf(NotFoundError);
  });

  it("enforces one brief per project (unique project_id)", async () => {
    await repo.insert(brief());
    // A second insert for the same project violates the unique index.
    expect(await expectThrown(repo.insert(brief()))).toBeTruthy();
    expect(await prisma.creativeBrief.count()).toBe(1);
  });
});
