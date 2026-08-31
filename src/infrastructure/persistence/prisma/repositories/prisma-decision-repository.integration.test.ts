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
import { EvidenceReferenceId } from "@/domain/evidence";
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
    context: {
      originStage: "BUILD",
      artifactKind: "SHOT_PLAN",
      artifactId: "shot-1",
      artifactVersion: 2,
    },
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
    expect(loaded.context).toMatchObject({
      originStage: "BUILD",
      artifactKind: "SHOT_PLAN",
      artifactId: "shot-1",
      artifactVersion: 2,
      needsReview: false,
    });
  });

  it("persists advisory without deciding", async () => {
    await prisma.mediaAsset.create({
      data: {
        id: "media_AAAAAAA1",
        ownerId: "usr_AAAAAAAA",
        projectId: "proj_AAAAAAA1",
        fileName: "frame-source.mp4",
        mediaType: "video/mp4",
        byteSize: 100,
        contentHash: "sha256:decision-evidence",
        createdAt: T0,
      },
    });
    await prisma.evidenceReference.create({
      data: {
        id: "evref_AAAAAAA1",
        ownerId: "usr_AAAAAAAA",
        projectId: "proj_AAAAAAA1",
        provenanceKind: "MEDIA_ASSET",
        mediaAssetId: "media_AAAAAAA1",
        createdAt: T0,
      },
    });
    await repo.insert(proposed());
    const withAdvisory = attachAdvisory(await load(), {
      recommendedOptionId: "a",
      rationale: "AI prefers A",
      tradeoff: "Less intimacy",
      uncertainty: "Location access may change",
      confidence: conf(0.9),
      evidence: [
        {
          evidenceReferenceId: EvidenceReferenceId.unsafe("evref_AAAAAAA1"),
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
    expect(loaded.advisory?.evidence[0]?.evidenceReferenceId).toBe("evref_AAAAAAA1");
    expect(loaded.advisory).toMatchObject({
      tradeoff: "Less intimacy",
      uncertainty: "Location access may change",
    });
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

  it("marks affected staged decisions for review and preserves optimistic concurrency", async () => {
    await repo.insert(proposed());
    await repo.markForReview(
      ProjectId.unsafe("proj_AAAAAAA1"),
      ["BUILD"],
      "The spatial plan changed.",
    );
    const flagged = await load();
    expect(flagged.context).toMatchObject({
      needsReview: true,
      reviewReason: "The spatial plan changed.",
    });
    expect(flagged.lockVersion).toBe(2);

    const reviewed = decide(flagged, {
      selectedOptionId: "a",
      decidedBy: HUMAN,
      rationale: "The revised plan still supports this shot.",
      now: T0,
    });
    if (!reviewed.ok) throw reviewed.error;
    await repo.update(reviewed.value);
    expect((await load()).context.needsReview).toBe(false);
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
