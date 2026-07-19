import type { PrismaClient } from "@prisma/client";
import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";
import { ConflictError } from "@/lib/errors";
import { createRubric, CriterionId, type Rubric, RubricId } from "@/domain/evaluation";
import { makeSlug, type Slug } from "@/domain/shared";
import {
  PersistenceMappingError,
  PrismaRubricRepository,
} from "@/infrastructure/persistence/prisma";
import { createTestPrisma, resetDatabase } from "@test/db/integration-helpers";

const anchors = { one: "poor", five: "ok", ten: "excellent" };

function rubric(): Rubric {
  const slug = makeSlug("story-quality");
  if (!slug.ok) throw slug.error;
  const result = createRubric({
    id: RubricId.unsafe("rbr_AAAAAAA1"),
    slug: slug.value as Slug,
    title: "Story Quality",
    criteria: [
      { id: CriterionId.unsafe("crit_AAAAAAA1"), name: "Clarity", weight: 1, anchors },
      { id: CriterionId.unsafe("crit_AAAAAAA2"), name: "Emotion", weight: 3, anchors },
    ],
  });
  if (!result.ok) throw result.error;
  return result.value;
}

let prisma: PrismaClient;
let repo: PrismaRubricRepository;

beforeAll(() => {
  prisma = createTestPrisma();
  repo = new PrismaRubricRepository(prisma);
});
afterAll(async () => {
  await prisma.$disconnect();
});
beforeEach(async () => {
  await resetDatabase(prisma);
});

describe("PrismaRubricRepository", () => {
  it("inserts root and criteria atomically and preserves order", async () => {
    await repo.insert(rubric());
    const loaded = await repo.findById(RubricId.unsafe("rbr_AAAAAAA1"));
    expect(loaded?.criteria).toHaveLength(2);
    expect(loaded?.criteria[0]?.name).toBe("Clarity");
    expect(loaded?.criteria[1]?.name).toBe("Emotion");

    const rows = await prisma.rubricCriterion.count({ where: { rubricId: "rbr_AAAAAAA1" } });
    expect(rows).toBe(2);
  });

  it("rejects duplicate insertion (append-only)", async () => {
    await repo.insert(rubric());
    await expect(repo.insert(rubric())).rejects.toBeInstanceOf(ConflictError);
  });

  it("rejects corrupt persisted data via the mapper", async () => {
    await prisma.rubric.create({ data: { id: "rbr_CORRUPT1", slug: "corrupt", title: "T" } });
    await prisma.rubricCriterion.create({
      data: {
        id: "not-a-valid-id",
        rubricId: "rbr_CORRUPT1",
        name: "n",
        weight: 1,
        anchorOne: "a",
        anchorFive: "b",
        anchorTen: "c",
        position: 0,
      },
    });
    await expect(repo.findById(RubricId.unsafe("rbr_CORRUPT1"))).rejects.toBeInstanceOf(
      PersistenceMappingError,
    );
  });
});
