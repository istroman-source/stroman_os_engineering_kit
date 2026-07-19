import type { PrismaClient } from "@prisma/client";
import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";
import { ConflictError, NotFoundError, OptimisticConcurrencyError } from "@/lib/errors";
import {
  activateProject,
  createProject,
  makeProjectName,
  OwnerId,
  type Project,
  ProjectId,
} from "@/domain/project";
import { PrismaProjectRepository } from "@/infrastructure/persistence/prisma";
import { createTestPrisma, resetDatabase } from "@test/db/integration-helpers";

const T0 = new Date("2026-07-19T00:00:00.000Z");
const T1 = new Date("2026-07-20T00:00:00.000Z");
const OWNER = OwnerId.unsafe("usr_AAAAAAAA");
const OTHER = OwnerId.unsafe("usr_BBBBBBBB");

function project(id: string, owner = OWNER): Project {
  const name = makeProjectName(`Reel ${id}`);
  if (!name.ok) throw name.error;
  return createProject({ id: ProjectId.unsafe(id), ownerId: owner, name: name.value, now: T0 });
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
let repo: PrismaProjectRepository;

beforeAll(() => {
  prisma = createTestPrisma();
  repo = new PrismaProjectRepository(prisma);
});
afterAll(async () => {
  await prisma.$disconnect();
});
beforeEach(async () => {
  await resetDatabase(prisma);
});

describe("PrismaProjectRepository", () => {
  it("inserts and retrieves a project, preserving domain timestamps", async () => {
    await repo.insert(project("proj_AAAAAAA1"));
    const loaded = await repo.findById(ProjectId.unsafe("proj_AAAAAAA1"));
    expect(loaded).not.toBeNull();
    if (!loaded) return;
    expect(loaded.status).toBe("DRAFT");
    expect(loaded.ownerId).toBe(OWNER);
    expect(loaded.lockVersion).toBe(1);
    expect(loaded.createdAt.getTime()).toBe(T0.getTime());
  });

  it("returns null for a missing project", async () => {
    expect(await repo.findById(ProjectId.unsafe("proj_MISSING1"))).toBeNull();
  });

  it("lists only the owner's projects, scoped in the database", async () => {
    await repo.insert(project("proj_AAAAAAA1", OWNER));
    await repo.insert(project("proj_AAAAAAA2", OWNER));
    await repo.insert(project("proj_BBBBBBB1", OTHER));
    const mine = await repo.listByOwner(OWNER);
    expect(mine).toHaveLength(2);
    expect(mine.every((p) => p.ownerId === OWNER)).toBe(true);
  });

  it("updates an existing project and bumps lockVersion (no duplicate rows)", async () => {
    await repo.insert(project("proj_AAAAAAA1"));
    const loaded = await repo.findById(ProjectId.unsafe("proj_AAAAAAA1"));
    if (!loaded) throw new Error("expected project");
    const activated = activateProject(loaded, T1);
    if (!activated.ok) throw activated.error;
    await repo.update(activated.value);

    const again = await repo.findById(ProjectId.unsafe("proj_AAAAAAA1"));
    expect(again?.status).toBe("ACTIVE");
    expect(again?.lockVersion).toBe(2);
    expect(await repo.listByOwner(OWNER)).toHaveLength(1);
  });

  it("rejects inserting an existing id (no overwrite)", async () => {
    await repo.insert(project("proj_AAAAAAA1"));
    const clash = { ...project("proj_AAAAAAA1"), name: project("proj_AAAAAAA1").name };
    const error = await expectThrown(repo.insert(clash));
    expect(error).toBeInstanceOf(ConflictError);
    // Original is unchanged.
    expect((await repo.findById(ProjectId.unsafe("proj_AAAAAAA1")))?.status).toBe("DRAFT");
  });

  it("rejects updating a missing project (does not insert it)", async () => {
    const error = await expectThrown(repo.update(project("proj_MISSING1")));
    expect(error).toBeInstanceOf(NotFoundError);
    expect(await repo.findById(ProjectId.unsafe("proj_MISSING1"))).toBeNull();
  });

  it("rejects a stale write (optimistic concurrency)", async () => {
    await repo.insert(project("proj_AAAAAAA1"));
    // Two readers load the same version.
    const a = await repo.findById(ProjectId.unsafe("proj_AAAAAAA1"));
    const b = await repo.findById(ProjectId.unsafe("proj_AAAAAAA1"));
    if (!a || !b) throw new Error("expected project");

    const firstWrite = activateProject(a, T1);
    if (!firstWrite.ok) throw firstWrite.error;
    await repo.update(firstWrite.value); // succeeds: lockVersion 1 -> 2

    // b still holds lockVersion 1, so its write is stale.
    const staleWrite = activateProject(b, T1);
    if (!staleWrite.ok) throw staleWrite.error;
    const error = await expectThrown(repo.update(staleWrite.value));
    expect(error).toBeInstanceOf(OptimisticConcurrencyError);
    // The first writer's state survived.
    expect((await repo.findById(ProjectId.unsafe("proj_AAAAAAA1")))?.status).toBe("ACTIVE");
  });
});
