import type { PrismaClient } from "@prisma/client";
import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";
import { ConflictError, NotFoundError, OptimisticConcurrencyError } from "@/lib/errors";
import { InsightId, MemoryId } from "@/domain/memory";
import { OwnerId, ProjectId } from "@/domain/project";
import {
  createStoryAngle,
  createStoryCritique,
  createStoryEvidence,
  evaluateStoryAngle,
  selectStoryAngle,
  type StoryAngle,
  StoryAngleId,
  StoryCritiqueId,
  StoryEvidenceId,
} from "@/domain/story-reasoning";
import {
  PrismaStoryAngleRepository,
  PrismaStoryCritiqueRepository,
  PrismaStoryEvidenceRepository,
} from "@/infrastructure/persistence/prisma";
import { createTestPrisma, resetDatabase } from "@test/db/integration-helpers";

const T0 = new Date("2026-07-21T00:00:00.000Z");
const OWNER = OwnerId.unsafe("usr_AAAAAAAA");
const PROJECT = ProjectId.unsafe("proj_AAAAAAA1");
const PROJECT2 = ProjectId.unsafe("proj_BBBBBBB2");

function unwrap<T>(r: { ok: true; value: T } | { ok: false; error: unknown }): T {
  if (!r.ok) throw r.error;
  return r.value;
}

async function expectThrown(promise: Promise<unknown>): Promise<unknown> {
  try {
    await promise;
  } catch (error) {
    return error;
  }
  throw new Error("expected the operation to throw");
}

function angle(id: string, projectId: ProjectId = PROJECT): StoryAngle {
  return unwrap(
    createStoryAngle({
      id: StoryAngleId.unsafe(id),
      ownerId: OWNER,
      projectId,
      title: "The last boat at dawn",
      theme: "Legacy",
      premise: "A crabber decides whether to sell the family fleet.",
      audiencePromise: "You'll feel the weight of a family tradition.",
      centralQuestion: "What do we owe those who came before us?",
      now: T0,
    }),
  );
}

let prisma: PrismaClient;
let angles: PrismaStoryAngleRepository;
let evidenceRepo: PrismaStoryEvidenceRepository;
let critiques: PrismaStoryCritiqueRepository;

beforeAll(() => {
  prisma = createTestPrisma();
  angles = new PrismaStoryAngleRepository(prisma);
  evidenceRepo = new PrismaStoryEvidenceRepository(prisma);
  critiques = new PrismaStoryCritiqueRepository(prisma);
});
afterAll(async () => {
  await prisma.$disconnect();
});
beforeEach(async () => {
  await resetDatabase(prisma);
  for (const [id, ownerId] of [
    [PROJECT, OWNER],
    [PROJECT2, OWNER],
  ] as const) {
    await prisma.project.create({
      data: { id, ownerId, name: "P", status: "DRAFT", createdAt: T0, updatedAt: T0 },
    });
  }
});

/** Seed an entity + memory so evidence can cite a real memory (FK to memories). */
async function seedMemory(id: string): Promise<MemoryId> {
  await prisma.entity.create({
    data: { id: `ent_${id}`, ownerId: OWNER, name: "N", kind: "person", createdAt: T0 },
  });
  await prisma.memory.create({
    data: {
      id: `mem_${id}`,
      ownerId: OWNER,
      entityId: `ent_${id}`,
      content: "Fact",
      createdAt: T0,
    },
  });
  return MemoryId.unsafe(`mem_${id}`);
}

async function seedInsight(id: string): Promise<InsightId> {
  await prisma.insight.create({
    data: { id: `ins_${id}`, ownerId: OWNER, statement: "S", confidence: 0.8, createdAt: T0 },
  });
  return InsightId.unsafe(`ins_${id}`);
}

describe("PrismaStoryAngle repository (real PostgreSQL)", () => {
  it("persists an angle and reads it back by id, project, and owner", async () => {
    const a = angle("ang_AAAAAAA1");
    await angles.insert(a);
    expect((await angles.findById(a.id))?.title).toBe(a.title);
    expect(await angles.listByProject(PROJECT)).toHaveLength(1);
    expect(await angles.listByOwner(OWNER)).toHaveLength(1);
  });

  it("update is an optimistic-concurrency compare-and-swap", async () => {
    const a = angle("ang_AAAAAAA2");
    await angles.insert(a);
    const evaluated = unwrap(evaluateStoryAngle(a)); // lockVersion 1 → 2
    await angles.update(evaluated);
    expect((await angles.findById(a.id))?.status).toBe("EVALUATED");

    // A second transition from the now-stale v1 aggregate must be rejected.
    const staleEvaluated = unwrap(evaluateStoryAngle(a));
    expect(await expectThrown(angles.update(staleEvaluated))).toBeInstanceOf(
      OptimisticConcurrencyError,
    );
  });

  it("update of a missing angle raises NotFound", async () => {
    const evaluated = unwrap(evaluateStoryAngle(angle("ang_MISSING1")));
    expect(await expectThrown(angles.update(evaluated))).toBeInstanceOf(NotFoundError);
  });

  // Persist each lifecycle step so the stored lockVersion tracks the aggregate
  // (each domain transition increments the version by one).
  async function toSelected(a: StoryAngle): Promise<StoryAngle> {
    const evaluated = unwrap(evaluateStoryAngle(a));
    await angles.update(evaluated);
    const selected = unwrap(selectStoryAngle(evaluated));
    await angles.update(selected);
    return selected;
  }

  it("enforces at most one SELECTED angle per project (partial unique index)", async () => {
    const first = angle("ang_SEL00001");
    const second = angle("ang_SEL00002");
    await angles.insert(first);
    await angles.insert(second);
    await toSelected(first);

    const evaluatedSecond = unwrap(evaluateStoryAngle(second));
    await angles.update(evaluatedSecond);
    const secondSelected = unwrap(selectStoryAngle(evaluatedSecond));
    expect(await expectThrown(angles.update(secondSelected))).toBeInstanceOf(ConflictError);
    expect((await angles.findSelectedByProject(PROJECT))?.id).toBe(first.id);
  });

  it("allows a selected angle in each of two different projects", async () => {
    const a = angle("ang_P1000001", PROJECT);
    const b = angle("ang_P2000001", PROJECT2);
    await angles.insert(a);
    await angles.insert(b);
    await toSelected(a);
    await toSelected(b);
    expect((await angles.findSelectedByProject(PROJECT))?.id).toBe(a.id);
    expect((await angles.findSelectedByProject(PROJECT2))?.id).toBe(b.id);
  });
});

describe("PrismaStoryEvidence repository (real PostgreSQL)", () => {
  it("persists evidence citing a memory and evidence citing an insight", async () => {
    const a = angle("ang_EVI00001");
    await angles.insert(a);
    const memoryId = await seedMemory("EVI00001");
    const insightId = await seedInsight("EVI00001");

    const memEvidence = unwrap(
      createStoryEvidence({
        id: StoryEvidenceId.unsafe("sev_MEM00001"),
        ownerId: OWNER,
        storyAngleId: a.id,
        memoryId,
        role: "PRIMARY",
        reason: "Anchors the premise.",
        now: T0,
      }),
    );
    const insEvidence = unwrap(
      createStoryEvidence({
        id: StoryEvidenceId.unsafe("sev_INS00001"),
        ownerId: OWNER,
        storyAngleId: a.id,
        insightId,
        role: "SUPPORTING",
        reason: "Frames the theme.",
        now: T0,
      }),
    );
    await evidenceRepo.insert(memEvidence);
    await evidenceRepo.insert(insEvidence);
    expect(await evidenceRepo.listByAngle(a.id)).toHaveLength(2);
  });

  it("rejects evidence referencing both or neither node (XOR CHECK constraint)", async () => {
    const a = angle("ang_XOR00001");
    await angles.insert(a);
    const memoryId = await seedMemory("XOR00001");
    const insightId = await seedInsight("XOR00001");

    const both = expectThrown(
      prisma.storyEvidence.create({
        data: {
          id: "sev_BOTH0001",
          ownerId: OWNER,
          storyAngleId: a.id,
          memoryId,
          insightId,
          role: "PRIMARY",
          reason: "invalid",
          createdAt: T0,
        },
      }),
    );
    expect(await both).toBeTruthy();

    const neither = expectThrown(
      prisma.storyEvidence.create({
        data: {
          id: "sev_NONE0001",
          ownerId: OWNER,
          storyAngleId: a.id,
          role: "PRIMARY",
          reason: "invalid",
          createdAt: T0,
        },
      }),
    );
    expect(await neither).toBeTruthy();
  });

  it("refuses to delete a memory or insight still cited by evidence (FK restrict)", async () => {
    const a = angle("ang_FK000001");
    await angles.insert(a);
    const memoryId = await seedMemory("FK000001");
    await evidenceRepo.insert(
      unwrap(
        createStoryEvidence({
          id: StoryEvidenceId.unsafe("sev_FK000001"),
          ownerId: OWNER,
          storyAngleId: a.id,
          memoryId,
          role: "PRIMARY",
          reason: "cited",
          now: T0,
        }),
      ),
    );
    expect(await expectThrown(prisma.memory.delete({ where: { id: memoryId } }))).toBeTruthy();
  });
});

describe("PrismaStoryCritique repository (real PostgreSQL)", () => {
  const scores = {
    evidenceStrength: 8,
    emotionalPotential: 9,
    visualPotential: 7,
    brandAlignment: 6,
    originality: 8,
    interviewPotential: 9,
  };

  it("persists a critique and reads it back", async () => {
    const a = angle("ang_CRI00001");
    await angles.insert(a);
    const critique = unwrap(
      createStoryCritique({
        id: StoryCritiqueId.unsafe("scr_CRI00001"),
        ownerId: OWNER,
        storyAngleId: a.id,
        criticType: "HUMAN",
        criticId: OWNER,
        ...scores,
        strengths: "Strong hook.",
        weaknesses: "Thin visuals.",
        recommendation: "SELECT",
        rationale: "Universal question.",
        now: T0,
      }),
    );
    await critiques.insert(critique);
    const found = await critiques.findById(critique.id);
    expect(found?.criticType).toBe("HUMAN");
    expect(found?.emotionalPotential).toBe(9);
  });

  it("rejects an out-of-range score at the database (CHECK constraint)", async () => {
    const a = angle("ang_CHK00001");
    await angles.insert(a);
    const bad = expectThrown(
      prisma.storyCritique.create({
        data: {
          id: "scr_BAD00001",
          ownerId: OWNER,
          storyAngleId: a.id,
          criticType: "AI",
          evidenceStrength: 0, // out of the 1..10 range
          emotionalPotential: 9,
          visualPotential: 7,
          brandAlignment: 6,
          originality: 8,
          interviewPotential: 9,
          strengths: "x",
          weaknesses: "y",
          recommendation: "SELECT",
          rationale: "z",
          createdAt: T0,
        },
      }),
    );
    expect(await bad).toBeTruthy();
  });
});

describe("cascade", () => {
  it("deleting an angle removes its evidence and critiques", async () => {
    const a = angle("ang_CAS00001");
    await angles.insert(a);
    const memoryId = await seedMemory("CAS00001");
    await evidenceRepo.insert(
      unwrap(
        createStoryEvidence({
          id: StoryEvidenceId.unsafe("sev_CAS00001"),
          ownerId: OWNER,
          storyAngleId: a.id,
          memoryId,
          role: "PRIMARY",
          reason: "cited",
          now: T0,
        }),
      ),
    );
    await critiques.insert(
      unwrap(
        createStoryCritique({
          id: StoryCritiqueId.unsafe("scr_CAS00001"),
          ownerId: OWNER,
          storyAngleId: a.id,
          criticType: "AI",
          evidenceStrength: 5,
          emotionalPotential: 5,
          visualPotential: 5,
          brandAlignment: 5,
          originality: 5,
          interviewPotential: 5,
          strengths: "x",
          weaknesses: "y",
          recommendation: "REVISE",
          rationale: "z",
          now: T0,
        }),
      ),
    );

    await prisma.storyAngle.delete({ where: { id: a.id } });
    expect(await evidenceRepo.listByAngle(a.id)).toHaveLength(0);
    expect(await critiques.listByAngle(a.id)).toHaveLength(0);
  });
});
