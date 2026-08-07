import type { PrismaClient } from "@prisma/client";
import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";
import { OptimisticConcurrencyError } from "@/lib/errors";
import {
  approveRetrospective,
  createRetrospective,
  LessonId,
  RetrospectiveId,
} from "@/domain/learning";
import { OwnerId, ProjectId } from "@/domain/project";
import {
  ForeignKeyConstraintError,
  PrismaRetrospectiveRepository,
} from "@/infrastructure/persistence/prisma";
import { createTestPrisma, resetDatabase } from "@test/db/integration-helpers";
const now = new Date("2026-08-07T00:00:00Z");
function draft(owner = "usr_AAAAAAAA") {
  const result = createRetrospective({
    id: RetrospectiveId.unsafe("retro_AAAAAAA1"),
    ownerId: OwnerId.unsafe(owner),
    projectId: ProjectId.unsafe("proj_AAAAAAA1"),
    context: { objective: "Objective", outcome: "Outcome", constraints: null },
    lessons: [
      {
        id: LessonId.unsafe("lesson_AAAAAAA1"),
        category: "WORKED",
        content: "Interview-first planning worked.",
      },
    ],
    now,
  });
  if (!result.ok) throw result.error;
  return result.value;
}
let prisma: PrismaClient;
let repo: PrismaRetrospectiveRepository;
beforeAll(() => {
  prisma = createTestPrisma();
  repo = new PrismaRetrospectiveRepository(prisma);
});
afterAll(async () => prisma.$disconnect());
beforeEach(async () => {
  await resetDatabase(prisma);
  await prisma.project.create({
    data: {
      id: "proj_AAAAAAA1",
      ownerId: "usr_AAAAAAAA",
      name: "P",
      status: "DRAFT",
      createdAt: now,
      updatedAt: now,
    },
  });
});
describe("PrismaRetrospectiveRepository", () => {
  it("atomically persists ordered learning and CAS approval", async () => {
    await repo.insert(draft());
    const loaded = await repo.findById(RetrospectiveId.unsafe("retro_AAAAAAA1"));
    expect(loaded?.lessons[0]?.position).toBe(0);
    if (!loaded) return;
    const approved = approveRetrospective(loaded, { approvedBy: loaded.ownerId, now });
    if (!approved.ok) throw approved.error;
    await repo.update(approved.value);
    expect(await repo.findById(loaded.id)).toMatchObject({ status: "APPROVED", lockVersion: 2 });
    await expect(repo.update(approved.value)).rejects.toBeInstanceOf(OptimisticConcurrencyError);
  });
  it("enforces project ownership and rolls back child lessons", async () => {
    await expect(repo.insert(draft("usr_OTHER001"))).rejects.toBeInstanceOf(
      ForeignKeyConstraintError,
    );
    expect(await prisma.retrospective.count()).toBe(0);
    expect(await prisma.lesson.count()).toBe(0);
  });
  it("lists only the requested project deterministically", async () => {
    await repo.insert(draft());
    expect(await repo.listByProject(ProjectId.unsafe("proj_AAAAAAA1"))).toHaveLength(1);
    expect(await repo.listByProject(ProjectId.unsafe("proj_OTHER001"))).toHaveLength(0);
  });
});
