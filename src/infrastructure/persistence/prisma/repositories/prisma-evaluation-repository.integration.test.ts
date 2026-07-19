import type { PrismaClient } from "@prisma/client";
import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";
import {
  createEvaluation,
  CriterionId,
  type Evaluation,
  EvaluationId,
  RubricId,
} from "@/domain/evaluation";
import { OwnerId, ProjectId } from "@/domain/project";
import { makeScore } from "@/domain/shared";
import {
  ForeignKeyConstraintError,
  PrismaEvaluationRepository,
} from "@/infrastructure/persistence/prisma";
import { createTestPrisma, resetDatabase } from "@test/db/integration-helpers";

const T0 = new Date("2026-07-19T00:00:00.000Z");

function score(n: number) {
  const s = makeScore(n);
  if (!s.ok) throw s.error;
  return s.value;
}

function evaluation(id: string, projectId: string): Evaluation {
  const result = createEvaluation({
    id: EvaluationId.unsafe(id),
    projectId: ProjectId.unsafe(projectId),
    rubricId: RubricId.unsafe("rbr_AAAAAAA1"),
    reviewerType: "HUMAN",
    reviewerId: OwnerId.unsafe("usr_AAAAAAAA"),
    scores: [
      { criterionId: CriterionId.unsafe("crit_AAAAAAA1"), score: score(8), justification: "clear" },
    ],
    now: T0,
  });
  if (!result.ok) throw result.error;
  return result.value;
}

let prisma: PrismaClient;
let repo: PrismaEvaluationRepository;

beforeAll(() => {
  prisma = createTestPrisma();
  repo = new PrismaEvaluationRepository(prisma);
});
afterAll(async () => {
  await prisma.$disconnect();
});
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
  await prisma.rubric.create({ data: { id: "rbr_AAAAAAA1", slug: "r", title: "R" } });
});

describe("PrismaEvaluationRepository", () => {
  it("saves an evaluation with its scores atomically and lists by project", async () => {
    await repo.insert(evaluation("eval_AAAAAAA1", "proj_AAAAAAA1"));
    const loaded = await repo.findById(EvaluationId.unsafe("eval_AAAAAAA1"));
    expect(loaded?.scores).toHaveLength(1);
    expect(loaded?.scores[0]?.justification).toBe("clear");

    const list = await repo.listByProject(ProjectId.unsafe("proj_AAAAAAA1"));
    expect(list).toHaveLength(1);
  });

  it("enforces the project foreign key and rolls back (no partial write)", async () => {
    let error: unknown;
    try {
      await repo.insert(evaluation("eval_BADFK001", "proj_MISSING1"));
    } catch (caught) {
      error = caught;
    }
    expect(error).toBeInstanceOf(ForeignKeyConstraintError);
    // Rollback: neither the evaluation nor its scores were written.
    expect(await repo.findById(EvaluationId.unsafe("eval_BADFK001"))).toBeNull();
    expect(await prisma.evaluationScore.count()).toBe(0);
  });
});
