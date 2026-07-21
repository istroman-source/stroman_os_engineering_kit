import { describe, expect, it } from "vitest";
import { InvalidStateTransitionError, InvalidValueError } from "../shared";
import { InsightId, MemoryId } from "../memory/ids";
import { OwnerId, ProjectId } from "../project/project-id";
import {
  archiveStoryAngle,
  createStoryAngle,
  createStoryCritique,
  createStoryEvidence,
  CriticAuthorityError,
  EvidenceReferenceError,
  evaluateStoryAngle,
  reviseStoryAngle,
  restoreStoryAngle,
  selectStoryAngle,
  type CreateStoryCritiqueInput,
  type StoryAngle,
} from "./index";
import { StoryAngleId, StoryCritiqueId, StoryEvidenceId } from "./ids";

const OWNER = OwnerId.unsafe("usr_ABCDEF12");
const CRITIC = OwnerId.unsafe("usr_CRITIC01");
const PROJECT = ProjectId.unsafe("proj_ABCDEF12");
const ANGLE = StoryAngleId.unsafe("ang_ABCDEF12");
const T0 = new Date("2026-07-21T00:00:00.000Z");

function draftAngle(): StoryAngle {
  const result = createStoryAngle({
    id: ANGLE,
    ownerId: OWNER,
    projectId: PROJECT,
    title: "The last boat at dawn",
    theme: "Legacy",
    premise: "A third-generation crabber decides whether to sell the family fleet.",
    audiencePromise: "You'll feel the weight of a family tradition on one person's shoulders.",
    centralQuestion: "What do we owe the people who came before us?",
    now: T0,
  });
  if (!result.ok) throw result.error;
  return result.value;
}

/** Reach a given lifecycle state via the explicit operations, for transition tests. */
function evaluated(): StoryAngle {
  const r = evaluateStoryAngle(draftAngle());
  if (!r.ok) throw r.error;
  return r.value;
}
function selected(): StoryAngle {
  const r = selectStoryAngle(evaluated());
  if (!r.ok) throw r.error;
  return r.value;
}

describe("StoryAngle — creation", () => {
  it("creates a DRAFT angle with lockVersion 1", () => {
    const a = draftAngle();
    expect(a.status).toBe("DRAFT");
    expect(a.lockVersion).toBe(1);
  });

  it("rejects each blank required field", () => {
    const base = {
      id: ANGLE,
      ownerId: OWNER,
      projectId: PROJECT,
      title: "T",
      theme: "Th",
      premise: "P",
      audiencePromise: "AP",
      centralQuestion: "CQ",
      now: T0,
    };
    for (const field of [
      "title",
      "theme",
      "premise",
      "audiencePromise",
      "centralQuestion",
    ] as const) {
      const result = createStoryAngle({ ...base, [field]: "   " });
      expect(result.ok, `blank ${field} should fail`).toBe(false);
    }
  });
});

describe("StoryAngle — lifecycle operations", () => {
  it("evaluate then select advances the state and bumps lockVersion each step", () => {
    const e = evaluateStoryAngle(draftAngle());
    expect(e.ok && e.value.status).toBe("EVALUATED");
    expect(e.ok && e.value.lockVersion).toBe(2);
    const s = selectStoryAngle(e.ok ? e.value : draftAngle());
    expect(s.ok && s.value.status).toBe("SELECTED");
    expect(s.ok && s.value.lockVersion).toBe(3);
  });

  it("cannot select a DRAFT angle (must be evaluated first)", () => {
    const result = selectStoryAngle(draftAngle());
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.error).toBeInstanceOf(InvalidStateTransitionError);
  });

  it("revises from EVALUATED and from SELECTED back to DRAFT", () => {
    const fromEval = reviseStoryAngle(evaluated());
    expect(fromEval.ok && fromEval.value.status).toBe("DRAFT");
    const fromSelected = reviseStoryAngle(selected());
    expect(fromSelected.ok && fromSelected.value.status).toBe("DRAFT");
  });

  it("cannot revise a DRAFT or an ARCHIVED angle", () => {
    expect(reviseStoryAngle(draftAngle()).ok).toBe(false);
    const archived = archiveStoryAngle(draftAngle());
    expect(archived.ok).toBe(true);
    if (archived.ok) {
      const result = reviseStoryAngle(archived.value);
      expect(result.ok).toBe(false);
      if (!result.ok) expect(result.error).toBeInstanceOf(InvalidStateTransitionError);
    }
  });

  it("archives from any active state and rejects archiving an archived angle", () => {
    expect(archiveStoryAngle(draftAngle()).ok).toBe(true);
    expect(archiveStoryAngle(evaluated()).ok).toBe(true);
    expect(archiveStoryAngle(selected()).ok).toBe(true);
    const archived = archiveStoryAngle(draftAngle());
    if (archived.ok) expect(archiveStoryAngle(archived.value).ok).toBe(false);
  });

  it("restores an archived angle to DRAFT and rejects restoring a non-archived angle", () => {
    const archived = archiveStoryAngle(draftAngle());
    expect(archived.ok).toBe(true);
    if (archived.ok) {
      const restored = restoreStoryAngle(archived.value);
      expect(restored.ok && restored.value.status).toBe("DRAFT");
    }
    expect(restoreStoryAngle(draftAngle()).ok).toBe(false);
  });
});

describe("StoryEvidence", () => {
  const base = {
    id: StoryEvidenceId.unsafe("sev_ABCDEF12"),
    ownerId: OWNER,
    storyAngleId: ANGLE,
    role: "PRIMARY" as const,
    reason: "He said selling would 'end four generations in one signature'.",
    now: T0,
  };

  it("accepts a reference to exactly a memory", () => {
    const e = createStoryEvidence({ ...base, memoryId: MemoryId.unsafe("mem_ABCDEF12") });
    expect(e.ok).toBe(true);
    if (e.ok) {
      expect(e.value.memoryId).toBe("mem_ABCDEF12");
      expect(e.value.insightId).toBeNull();
      expect(e.value.role).toBe("PRIMARY");
    }
  });

  it("accepts a reference to exactly an insight", () => {
    const e = createStoryEvidence({ ...base, insightId: InsightId.unsafe("ins_ABCDEF12") });
    expect(e.ok && e.value.insightId).toBe("ins_ABCDEF12");
    expect(e.ok && e.value.memoryId).toBeNull();
  });

  it("rejects referencing both a memory and an insight", () => {
    const e = createStoryEvidence({
      ...base,
      memoryId: MemoryId.unsafe("mem_ABCDEF12"),
      insightId: InsightId.unsafe("ins_ABCDEF12"),
    });
    expect(e.ok).toBe(false);
    if (!e.ok) expect(e.error).toBeInstanceOf(EvidenceReferenceError);
  });

  it("rejects referencing neither a memory nor an insight", () => {
    const e = createStoryEvidence(base);
    expect(e.ok).toBe(false);
    if (!e.ok) expect(e.error).toBeInstanceOf(EvidenceReferenceError);
  });

  it("rejects a blank reason", () => {
    const e = createStoryEvidence({
      ...base,
      memoryId: MemoryId.unsafe("mem_ABCDEF12"),
      reason: "   ",
    });
    expect(e.ok).toBe(false);
  });
});

describe("StoryCritique", () => {
  const scores = {
    evidenceStrength: 8,
    emotionalPotential: 9,
    visualPotential: 7,
    brandAlignment: 6,
    originality: 8,
    interviewPotential: 9,
  };
  const base: CreateStoryCritiqueInput = {
    id: StoryCritiqueId.unsafe("scr_ABCDEF12"),
    ownerId: OWNER,
    storyAngleId: ANGLE,
    criticType: "AI",
    ...scores,
    strengths: "Strong emotional hook grounded in a real family stake.",
    weaknesses: "Visual plan is thin; needs location scouting.",
    recommendation: "SELECT",
    rationale: "The central question is universal and the interview access is real.",
    now: T0,
  };

  it("creates a valid AI critique and stores the six scores", () => {
    const c = createStoryCritique(base);
    expect(c.ok).toBe(true);
    if (c.ok) {
      expect(c.value.criticType).toBe("AI");
      expect(c.value.criticId).toBeNull();
      expect(c.value.evidenceStrength).toBe(8);
      expect(c.value.interviewPotential).toBe(9);
      expect(c.value.recommendation).toBe("SELECT");
    }
  });

  it("creates a valid HUMAN critique that names its critic", () => {
    const c = createStoryCritique({ ...base, criticType: "HUMAN", criticId: CRITIC });
    expect(c.ok && c.value.criticId).toBe(CRITIC);
  });

  it("rejects a HUMAN critique with no critic named", () => {
    const c = createStoryCritique({ ...base, criticType: "HUMAN", criticId: null });
    expect(c.ok).toBe(false);
    if (!c.ok) expect(c.error).toBeInstanceOf(CriticAuthorityError);
  });

  it("rejects an AI critique that names a critic", () => {
    const c = createStoryCritique({ ...base, criticType: "AI", criticId: CRITIC });
    expect(c.ok).toBe(false);
    if (!c.ok) expect(c.error).toBeInstanceOf(CriticAuthorityError);
  });

  it("rejects an out-of-range or non-integer score", () => {
    expect(createStoryCritique({ ...base, brandAlignment: 0 }).ok).toBe(false);
    expect(createStoryCritique({ ...base, brandAlignment: 11 }).ok).toBe(false);
    expect(createStoryCritique({ ...base, brandAlignment: 6.5 }).ok).toBe(false);
  });

  it("rejects blank strengths, weaknesses, or rationale", () => {
    expect(createStoryCritique({ ...base, strengths: "  " }).ok).toBe(false);
    expect(createStoryCritique({ ...base, weaknesses: "  " }).ok).toBe(false);
    expect(createStoryCritique({ ...base, rationale: "  " }).ok).toBe(false);
  });

  it("rejects an invalid recommendation", () => {
    const c = createStoryCritique({
      ...base,
      recommendation: "MAYBE" as unknown as CreateStoryCritiqueInput["recommendation"],
    });
    expect(c.ok).toBe(false);
    if (!c.ok) expect(c.error).toBeInstanceOf(InvalidValueError);
  });

  it("is advisory: a SELECT recommendation does not change the angle's status", () => {
    const angle = evaluated(); // EVALUATED, awaiting a human call
    const critique = createStoryCritique({ ...base, recommendation: "SELECT" });
    expect(critique.ok).toBe(true);
    // Recording the critique changed nothing about the angle; only selectStoryAngle can.
    expect(angle.status).toBe("EVALUATED");
    const humanSelected = selectStoryAngle(angle);
    expect(humanSelected.ok && humanSelected.value.status).toBe("SELECTED");
  });
});
