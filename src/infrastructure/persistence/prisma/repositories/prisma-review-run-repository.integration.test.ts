import type { PrismaClient } from "@prisma/client";
import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";
import {
  createReviewRun,
  CriterionId,
  EvaluationId,
  ReviewRunId,
  RubricId,
} from "@/domain/evaluation";
import { OwnerId, ProjectId } from "@/domain/project";
import { makeScore } from "@/domain/shared";
import {
  ForeignKeyConstraintError,
  PrismaReviewRunRepository,
} from "@/infrastructure/persistence/prisma";
import { createTestPrisma, resetDatabase } from "@test/db/integration-helpers";

const T0 = new Date("2026-08-06T12:00:00.000Z");
const score = (value: number) => {
  const result = makeScore(value);
  if (!result.ok) throw result.error;
  return result.value;
};
function review(originalScore = 5) {
  const result = createReviewRun({
    id: ReviewRunId.unsafe("rvw_AAAAAAA1"),
    projectId: ProjectId.unsafe("proj_AAAAAAA1"),
    rubricId: RubricId.unsafe("rbr_AAAAAAA1"),
    evaluationId: EvaluationId.unsafe("eval_AAAAAAA1"),
    reviewerId: OwnerId.unsafe("usr_AAAAAAAA"),
    completedAt: T0,
    overrides: [
      {
        criterionId: CriterionId.unsafe("crit_AAAAAAA1"),
        originalScore: score(originalScore),
        overrideScore: score(8),
        rationale: "Human review found a stronger resolution.",
      },
    ],
  });
  if (!result.ok) throw result.error;
  return result.value;
}

let prisma: PrismaClient;
let repo: PrismaReviewRunRepository;
beforeAll(() => {
  prisma = createTestPrisma();
  repo = new PrismaReviewRunRepository(prisma);
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
      createdAt: T0,
      updatedAt: T0,
    },
  });
  await prisma.rubric.create({
    data: {
      id: "rbr_AAAAAAA1",
      slug: "review",
      title: "Review",
      criteria: {
        create: {
          id: "crit_AAAAAAA1",
          name: "Clarity",
          weight: 1,
          anchorOne: "poor",
          anchorFive: "ok",
          anchorTen: "excellent",
          position: 0,
        },
      },
    },
  });
  await prisma.evaluation.create({
    data: {
      id: "eval_AAAAAAA1",
      projectId: "proj_AAAAAAA1",
      rubricId: "rbr_AAAAAAA1",
      reviewerType: "AI",
      createdAt: T0,
      scores: { create: { criterionId: "crit_AAAAAAA1", score: 5, justification: "automated" } },
    },
  });
});

describe("PrismaReviewRunRepository", () => {
  it("atomically persists and deterministically reads review provenance", async () => {
    await repo.insert(review());
    const loaded = await repo.findById(ReviewRunId.unsafe("rvw_AAAAAAA1"));
    expect(loaded?.overrides[0]).toMatchObject({ originalScore: 5, overrideScore: 8 });
    expect(await repo.listByProject(ProjectId.unsafe("proj_AAAAAAA1"))).toHaveLength(1);
  });
  it("rejects a mismatched original score and rolls back the entire review", async () => {
    await expect(repo.insert(review(4))).rejects.toBeInstanceOf(ForeignKeyConstraintError);
    expect(await prisma.reviewRun.count()).toBe(0);
    expect(await prisma.reviewScoreOverride.count()).toBe(0);
  });
  it("enforces project ownership alignment", async () => {
    const invalid = { ...review(), reviewerId: OwnerId.unsafe("usr_OTHER001") };
    await expect(repo.insert(invalid)).rejects.toBeInstanceOf(ForeignKeyConstraintError);
  });
});
