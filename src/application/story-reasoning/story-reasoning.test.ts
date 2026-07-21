import { describe, expect, it } from "vitest";
import { OptimisticConcurrencyError } from "@/lib/errors";
import {
  createMemory as createMemoryAggregate,
  createInsight as createInsightAggregate,
  EntityId,
  type Insight,
  InsightId,
  type MemoryRecord,
  MemoryId,
} from "@/domain/memory";
import { OwnerId } from "@/domain/project";
import { EvidenceReferenceError } from "@/domain/story-reasoning";
import { FixedClock, SequentialIdGenerator } from "../../../test/adapters/fakes";
import {
  InMemoryInsightRepository,
  InMemoryMemoryRepository,
  InMemoryProjectRepository,
  InMemoryStoryAngleRepository,
  InMemoryStoryCritiqueRepository,
  InMemoryStoryEvidenceRepository,
} from "../../../test/adapters/in-memory-repositories";
import { createProject } from "../project/create-project";
import { NotAuthorizedError, SelectedAngleConflictError } from "../shared/errors";
import { createStoryAngle } from "./create-story-angle";
import { createStoryCritique } from "./create-story-critique";
import { createStoryEvidence } from "./create-story-evidence";
import { getStoryAngleDetail, listStoryAnglesForProject } from "./read-story-reasoning";
import {
  archiveStoryAngle,
  evaluateStoryAngle,
  reviseStoryAngle,
  selectStoryAngle,
} from "./transition-story-angle";

const OWNER = OwnerId.unsafe("usr_00000001");
const OTHER = OwnerId.unsafe("usr_99999999");
const T0 = new Date("2026-07-21T00:00:00.000Z");

function env() {
  return {
    projects: new InMemoryProjectRepository(),
    storyAngles: new InMemoryStoryAngleRepository(),
    storyEvidence: new InMemoryStoryEvidenceRepository(),
    storyCritiques: new InMemoryStoryCritiqueRepository(),
    memories: new InMemoryMemoryRepository(),
    insights: new InMemoryInsightRepository(),
    ids: new SequentialIdGenerator(),
    clock: new FixedClock(T0),
  };
}
type Env = ReturnType<typeof env>;

function unwrap<T>(r: { ok: true; value: T } | { ok: false; error: unknown }): T {
  if (!r.ok) throw r.error;
  return r.value;
}

async function ownedProject(e: Env, actor = OWNER): Promise<string> {
  return (unwrap(await createProject(e, { actorId: actor, name: "P" })) as { id: string }).id;
}

const angleInput = (projectId: string, actorId = OWNER) => ({
  actorId,
  projectId: projectId as never,
  title: "The last boat at dawn",
  theme: "Legacy",
  premise: "A third-generation crabber decides whether to sell the family fleet.",
  audiencePromise: "You'll feel the weight of a family tradition on one person's shoulders.",
  centralQuestion: "What do we owe the people who came before us?",
});

const critiqueScores = {
  evidenceStrength: 8,
  emotionalPotential: 9,
  visualPotential: 7,
  brandAlignment: 6,
  originality: 8,
  interviewPotential: 9,
};

function seededMemory(e: Env, owner: OwnerId, suffix: string): MemoryRecord {
  const memory = unwrap(
    createMemoryAggregate({
      id: MemoryId.unsafe(`mem_${suffix}`),
      ownerId: owner,
      entityId: EntityId.unsafe(`ent_${suffix}`),
      content: "A recorded fact",
      now: T0,
    }),
  );
  e.memories.seed(memory);
  return memory;
}

function seededInsight(e: Env, owner: OwnerId, suffix: string): Insight {
  const insight = unwrap(
    createInsightAggregate({
      id: InsightId.unsafe(`ins_${suffix}`),
      ownerId: owner,
      statement: "A derived conclusion",
      confidence: 0.8,
      memoryIds: [MemoryId.unsafe(`mem_${suffix}`)],
      now: T0,
    }),
  );
  e.insights.seed(insight);
  return insight;
}

describe("createStoryAngle", () => {
  it("creates a DRAFT angle owned by the project owner", async () => {
    const e = env();
    const projectId = await ownedProject(e);
    const angle = unwrap(await createStoryAngle(e, angleInput(projectId)));
    expect(angle.status).toBe("DRAFT");
    expect(angle.lockVersion).toBe(1);
  });

  it("denies creating an angle under another owner's project", async () => {
    const e = env();
    const projectId = await ownedProject(e, OWNER);
    const result = await createStoryAngle(e, angleInput(projectId, OTHER));
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.error).toBeInstanceOf(NotAuthorizedError);
  });
});

describe("story-angle lifecycle", () => {
  async function draft(e: Env, projectId: string) {
    return unwrap(await createStoryAngle(e, angleInput(projectId)));
  }

  it("evaluates then selects, incrementing lockVersion", async () => {
    const e = env();
    const projectId = await ownedProject(e);
    const angle = await draft(e, projectId);
    const evaluated = unwrap(
      await evaluateStoryAngle(e, {
        actorId: OWNER,
        storyAngleId: angle.id,
        expectedVersion: angle.lockVersion,
      }),
    );
    expect(evaluated.status).toBe("EVALUATED");
    expect(evaluated.lockVersion).toBe(2);
    const selected = unwrap(
      await selectStoryAngle(e, {
        actorId: OWNER,
        storyAngleId: angle.id,
        expectedVersion: evaluated.lockVersion,
      }),
    );
    expect(selected.status).toBe("SELECTED");
    expect(selected.lockVersion).toBe(3);
  });

  it("rejects a stale expectedVersion (optimistic concurrency)", async () => {
    const e = env();
    const projectId = await ownedProject(e);
    const angle = await draft(e, projectId);
    const result = await evaluateStoryAngle(e, {
      actorId: OWNER,
      storyAngleId: angle.id,
      expectedVersion: angle.lockVersion + 5,
    });
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.error).toBeInstanceOf(OptimisticConcurrencyError);
  });

  it("denies a lifecycle change by a non-owner", async () => {
    const e = env();
    const projectId = await ownedProject(e);
    const angle = await draft(e, projectId);
    const result = await evaluateStoryAngle(e, {
      actorId: OTHER,
      storyAngleId: angle.id,
      expectedVersion: angle.lockVersion,
    });
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.error).toBeInstanceOf(NotAuthorizedError);
  });

  it("enforces at most one SELECTED angle per project", async () => {
    const e = env();
    const projectId = await ownedProject(e);
    const first = await draft(e, projectId);
    const second = await draft(e, projectId);

    const evalFirst = unwrap(
      await evaluateStoryAngle(e, {
        actorId: OWNER,
        storyAngleId: first.id,
        expectedVersion: first.lockVersion,
      }),
    );
    unwrap(
      await selectStoryAngle(e, {
        actorId: OWNER,
        storyAngleId: first.id,
        expectedVersion: evalFirst.lockVersion,
      }),
    );

    const evalSecond = unwrap(
      await evaluateStoryAngle(e, {
        actorId: OWNER,
        storyAngleId: second.id,
        expectedVersion: second.lockVersion,
      }),
    );
    const conflict = await selectStoryAngle(e, {
      actorId: OWNER,
      storyAngleId: second.id,
      expectedVersion: evalSecond.lockVersion,
    });
    expect(conflict.ok).toBe(false);
    if (!conflict.ok) expect(conflict.error).toBeInstanceOf(SelectedAngleConflictError);
  });

  it("allows selecting a second angle after the first is archived", async () => {
    const e = env();
    const projectId = await ownedProject(e);
    const first = await draft(e, projectId);
    const second = await draft(e, projectId);

    const evalFirst = unwrap(
      await evaluateStoryAngle(e, {
        actorId: OWNER,
        storyAngleId: first.id,
        expectedVersion: first.lockVersion,
      }),
    );
    const selFirst = unwrap(
      await selectStoryAngle(e, {
        actorId: OWNER,
        storyAngleId: first.id,
        expectedVersion: evalFirst.lockVersion,
      }),
    );
    unwrap(
      await archiveStoryAngle(e, {
        actorId: OWNER,
        storyAngleId: first.id,
        expectedVersion: selFirst.lockVersion,
      }),
    );

    const evalSecond = unwrap(
      await evaluateStoryAngle(e, {
        actorId: OWNER,
        storyAngleId: second.id,
        expectedVersion: second.lockVersion,
      }),
    );
    const selSecond = await selectStoryAngle(e, {
      actorId: OWNER,
      storyAngleId: second.id,
      expectedVersion: evalSecond.lockVersion,
    });
    expect(selSecond.ok).toBe(true);
  });

  it("revise only from EVALUATED (a SELECTED angle cannot be revised)", async () => {
    const e = env();
    const projectId = await ownedProject(e);
    const angle = await draft(e, projectId);
    const evaluated = unwrap(
      await evaluateStoryAngle(e, {
        actorId: OWNER,
        storyAngleId: angle.id,
        expectedVersion: angle.lockVersion,
      }),
    );
    const selected = unwrap(
      await selectStoryAngle(e, {
        actorId: OWNER,
        storyAngleId: angle.id,
        expectedVersion: evaluated.lockVersion,
      }),
    );
    const result = await reviseStoryAngle(e, {
      actorId: OWNER,
      storyAngleId: angle.id,
      expectedVersion: selected.lockVersion,
    });
    expect(result.ok).toBe(false);
  });
});

describe("createStoryEvidence — reference ownership", () => {
  async function draftAngle(e: Env): Promise<string> {
    const projectId = await ownedProject(e);
    return (unwrap(await createStoryAngle(e, angleInput(projectId))) as { id: string }).id;
  }

  const evidenceBase = (angleId: string) => ({
    actorId: OWNER,
    storyAngleId: angleId,
    role: "PRIMARY" as const,
    reason: "Anchors the premise in a real moment.",
  });

  it("attaches evidence citing the actor's own memory", async () => {
    const e = env();
    const angleId = await draftAngle(e);
    const memory = seededMemory(e, OWNER, "AAAAAAA1");
    const evidence = unwrap(
      await createStoryEvidence(e, { ...evidenceBase(angleId), memoryId: memory.id }),
    );
    expect(evidence.memoryId).toBe(memory.id);
    expect(evidence.insightId).toBeNull();
  });

  it("attaches evidence citing the actor's own insight", async () => {
    const e = env();
    const angleId = await draftAngle(e);
    const insight = seededInsight(e, OWNER, "BBBBBBB1");
    const evidence = unwrap(
      await createStoryEvidence(e, { ...evidenceBase(angleId), insightId: insight.id }),
    );
    expect(evidence.insightId).toBe(insight.id);
  });

  it("rejects citing a memory owned by someone else", async () => {
    const e = env();
    const angleId = await draftAngle(e);
    const memory = seededMemory(e, OTHER, "CCCCCCC1");
    const result = await createStoryEvidence(e, {
      ...evidenceBase(angleId),
      memoryId: memory.id,
    });
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.error).toBeInstanceOf(NotAuthorizedError);
  });

  it("rejects citing an insight owned by someone else", async () => {
    const e = env();
    const angleId = await draftAngle(e);
    const insight = seededInsight(e, OTHER, "DDDDDDD1");
    const result = await createStoryEvidence(e, {
      ...evidenceBase(angleId),
      insightId: insight.id,
    });
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.error).toBeInstanceOf(NotAuthorizedError);
  });

  it("rejects citing both a memory and an insight (domain XOR)", async () => {
    const e = env();
    const angleId = await draftAngle(e);
    const memory = seededMemory(e, OWNER, "EEEEEEE1");
    const insight = seededInsight(e, OWNER, "EEEEEEE1");
    const result = await createStoryEvidence(e, {
      ...evidenceBase(angleId),
      memoryId: memory.id,
      insightId: insight.id,
    });
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.error).toBeInstanceOf(EvidenceReferenceError);
  });

  it("denies attaching evidence to another owner's angle", async () => {
    const e = env();
    const angleId = await draftAngle(e);
    const memory = seededMemory(e, OTHER, "FFFFFFF1");
    const result = await createStoryEvidence(e, {
      ...evidenceBase(angleId),
      actorId: OTHER,
      memoryId: memory.id,
    });
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.error).toBeInstanceOf(NotAuthorizedError);
  });
});

describe("createStoryCritique", () => {
  async function draftAngleId(e: Env): Promise<string> {
    const projectId = await ownedProject(e);
    return (unwrap(await createStoryAngle(e, angleInput(projectId))) as { id: string }).id;
  }

  const critiqueBase = (angleId: string, actorId = OWNER) => ({
    actorId,
    storyAngleId: angleId,
    criticType: "AI" as const,
    ...critiqueScores,
    strengths: "Strong, grounded emotional hook.",
    weaknesses: "Visual plan is thin.",
    recommendation: "SELECT" as const,
    rationale: "Universal question with real access.",
  });

  it("records an advisory critique without changing the angle's status", async () => {
    const e = env();
    const angleId = await draftAngleId(e);
    const critique = unwrap(await createStoryCritique(e, critiqueBase(angleId)));
    expect(critique.recommendation).toBe("SELECT");
    const angle = await e.storyAngles.findById(angleId as never);
    expect(angle?.status).toBe("DRAFT"); // recording a critique never transitions the angle
  });

  it("denies critiquing another owner's angle", async () => {
    const e = env();
    const angleId = await draftAngleId(e);
    const result = await createStoryCritique(e, critiqueBase(angleId, OTHER));
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.error).toBeInstanceOf(NotAuthorizedError);
  });
});

describe("reads", () => {
  it("lists a project's angles and denies a non-owner", async () => {
    const e = env();
    const projectId = await ownedProject(e);
    unwrap(await createStoryAngle(e, angleInput(projectId)));
    const list = unwrap(
      await listStoryAnglesForProject(e, { actorId: OWNER, projectId: projectId as never }),
    );
    expect(list).toHaveLength(1);
    const denied = await listStoryAnglesForProject(e, {
      actorId: OTHER,
      projectId: projectId as never,
    });
    expect(denied.ok).toBe(false);
    if (!denied.ok) expect(denied.error).toBeInstanceOf(NotAuthorizedError);
  });

  it("returns an angle detail with its evidence and critiques", async () => {
    const e = env();
    const projectId = await ownedProject(e);
    const angle = unwrap(await createStoryAngle(e, angleInput(projectId)));
    const memory = seededMemory(e, OWNER, "AAAAAAA2");
    unwrap(
      await createStoryEvidence(e, {
        actorId: OWNER,
        storyAngleId: angle.id,
        role: "PRIMARY",
        reason: "Anchors the premise.",
        memoryId: memory.id,
      }),
    );
    unwrap(
      await createStoryCritique(e, {
        actorId: OWNER,
        storyAngleId: angle.id,
        criticType: "AI",
        ...critiqueScores,
        strengths: "x",
        weaknesses: "y",
        recommendation: "SELECT",
        rationale: "z",
      }),
    );
    const detail = unwrap(await getStoryAngleDetail(e, { actorId: OWNER, storyAngleId: angle.id }));
    expect(detail.angle.id).toBe(angle.id);
    expect(detail.evidence).toHaveLength(1);
    expect(detail.critiques).toHaveLength(1);
  });
});
