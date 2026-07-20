import type { PrismaClient } from "@prisma/client";
import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";
import { NotFoundError, OptimisticConcurrencyError } from "@/lib/errors";
import {
  attachAdvisory,
  createDecision,
  decide,
  type Decision,
  DecisionId,
} from "@/domain/decision";
import { OwnerId, ProjectId } from "@/domain/project";
import { type Confidence, makeConfidence } from "@/domain/shared";
import { PrismaDecisionRepository } from "@/infrastructure/persistence/prisma";
import { createTestPrisma, resetDatabase } from "@test/db/integration-helpers";

const T0 = new Date("2026-07-19T00:00:00.000Z");
const HUMAN = OwnerId.unsafe("usr_AAAAAAAA");
const HUMAN2 = OwnerId.unsafe("usr_BBBBBBBB");

function conf(n: number): Confidence {
  const c = makeConfidence(n);
  if (!c.ok) throw c.error;
  return c.value;
}

function proposed(): Decision {
  const result = createDecision({
    id: DecisionId.unsafe("dec_AAAAAAA1"),
    projectId: ProjectId.unsafe("proj_AAAAAAA1"),
    question: "Which opening?",
    options: [
      { id: "a", label: "Cold open" },
      { id: "b", label: "Interview open" },
    ],
    now: T0,
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

async function load(): Promise<Decision> {
  const d = await repo.findById(DecisionId.unsafe("dec_AAAAAAA1"));
  if (!d) throw new Error("expected decision");
  return d;
}

let prisma: PrismaClient;
let repo: PrismaDecisionRepository;

beforeAll(() => {
  prisma = createTestPrisma();
  repo = new PrismaDecisionRepository(prisma);
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
});

describe("PrismaDecisionRepository", () => {
  it("inserts a proposed decision with its options", async () => {
    await repo.insert(proposed());
    const loaded = await load();
    expect(loaded.status).toBe("PROPOSED");
    expect(loaded.options).toHaveLength(2);
    expect(loaded.selectedOptionId).toBeNull();
    expect(loaded.advisory).toBeNull();
  });

  it("persists advisory without deciding", async () => {
    await repo.insert(proposed());
    const withAdvisory = attachAdvisory(await load(), {
      recommendedOptionId: "a",
      rationale: "AI prefers A",
      confidence: conf(0.9),
      evidence: [
        {
          sourceLabel: "Client brief",
          observation: "Wants a fast hook",
          relevance: "Cold open is faster",
        },
      ],
    });
    if (!withAdvisory.ok) throw withAdvisory.error;
    await repo.update(withAdvisory.value);

    const loaded = await load();
    expect(loaded.advisory?.recommendedOptionId).toBe("a");
    expect(loaded.advisory?.evidence).toHaveLength(1);
    expect(loaded.advisory?.evidence[0]?.sourceLabel).toBe("Client brief");
    expect(loaded.status).toBe("PROPOSED");
    expect(loaded.selectedOptionId).toBeNull();
    expect(loaded.decidedBy).toBeNull();
  });

  it("persists a human decision separately from advisory", async () => {
    await repo.insert(proposed());
    const decided = decide(await load(), {
      selectedOptionId: "b",
      decidedBy: HUMAN,
      rationale: "Interview open sets stakes faster",
      now: T0,
    });
    if (!decided.ok) throw decided.error;
    await repo.update(decided.value);

    const loaded = await load();
    expect(loaded.status).toBe("DECIDED");
    expect(loaded.selectedOptionId).toBe("b");
    expect(loaded.decidedBy).toBe(HUMAN);
    expect(loaded.decisionRationale).toContain("stakes");
    expect(await repo.listByProject(ProjectId.unsafe("proj_AAAAAAA1"))).toHaveLength(1);
  });

  it("rejects a duplicate/stale finalization — a second human cannot overwrite the decision", async () => {
    await repo.insert(proposed());
    const a = await load();
    const b = await load(); // same lockVersion

    const firstDecision = decide(a, {
      selectedOptionId: "a",
      decidedBy: HUMAN,
      rationale: "chose A",
      now: T0,
    });
    if (!firstDecision.ok) throw firstDecision.error;
    await repo.update(firstDecision.value); // succeeds

    const staleDecision = decide(b, {
      selectedOptionId: "b",
      decidedBy: HUMAN2,
      rationale: "chose B",
      now: T0,
    });
    if (!staleDecision.ok) throw staleDecision.error;
    expect(await expectThrown(repo.update(staleDecision.value))).toBeInstanceOf(
      OptimisticConcurrencyError,
    );
    // The first human's decision stands.
    const final = await load();
    expect(final.selectedOptionId).toBe("a");
    expect(final.decidedBy).toBe(HUMAN);
  });

  it("rejects updating a missing decision (does not create it)", async () => {
    const error = await expectThrown(repo.update(proposed()));
    expect(error).toBeInstanceOf(NotFoundError);
    expect(await repo.findById(DecisionId.unsafe("dec_AAAAAAA1"))).toBeNull();
  });
});
