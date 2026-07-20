import { describe, expect, it } from "vitest";
import { type Confidence, makeConfidence } from "../shared";
import { OwnerId, ProjectId } from "../project/project-id";
import { attachAdvisory, createDecision, decide, type Advisory, type Decision } from "./decision";
import { DecisionId } from "./decision-id";
import {
  DecisionAlreadyDecidedError,
  InsufficientOptionsError,
  UnknownOptionError,
} from "./decision-errors";

const T0 = new Date("2026-07-17T00:00:00.000Z");
const T1 = new Date("2026-07-18T00:00:00.000Z");
const HUMAN = OwnerId.unsafe("usr_ABCDEF12");

function conf(n: number): Confidence {
  const c = makeConfidence(n);
  if (!c.ok) throw c.error;
  return c.value;
}

function proposed(advisory?: Advisory): Decision {
  const result = createDecision({
    id: DecisionId.unsafe("dec_ABCDEF12"),
    projectId: ProjectId.unsafe("proj_ABCDEF12"),
    question: "Which opening shot?",
    options: [
      { id: "a", label: "Cold open on the kitchen" },
      { id: "b", label: "Open on the chef interview" },
    ],
    advisory: advisory ?? null,
    now: T0,
  });
  if (!result.ok) throw result.error;
  return result.value;
}

describe("createDecision", () => {
  it("creates a PROPOSED decision with no selection", () => {
    const d = proposed();
    expect(d.status).toBe("PROPOSED");
    expect(d.selectedOptionId).toBeNull();
    expect(d.decidedBy).toBeNull();
  });

  it("requires at least two options", () => {
    const result = createDecision({
      id: DecisionId.unsafe("dec_ABCDEF12"),
      projectId: ProjectId.unsafe("proj_ABCDEF12"),
      question: "Only one?",
      options: [{ id: "a", label: "Only choice" }],
      now: T0,
    });
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.error).toBeInstanceOf(InsufficientOptionsError);
  });

  it("rejects an advisory that recommends an unknown option", () => {
    const result = createDecision({
      id: DecisionId.unsafe("dec_ABCDEF12"),
      projectId: ProjectId.unsafe("proj_ABCDEF12"),
      question: "Which?",
      options: [
        { id: "a", label: "A" },
        { id: "b", label: "B" },
      ],
      advisory: {
        recommendedOptionId: "zzz",
        rationale: "because",
        confidence: conf(0.9),
        evidence: [],
      },
      now: T0,
    });
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.error).toBeInstanceOf(UnknownOptionError);
  });
});

describe("human authority", () => {
  it("AI advisory alone never selects an option or decides", () => {
    const advisory: Advisory = {
      recommendedOptionId: "a",
      rationale: "AI likes A",
      confidence: conf(0.95),
      evidence: [],
    };
    const d = proposed(advisory);
    // Even with a confident recommendation, nothing is decided.
    expect(d.status).toBe("PROPOSED");
    expect(d.selectedOptionId).toBeNull();
    expect(d.decidedBy).toBeNull();

    // Re-attaching advisory still does not decide.
    const readvised = attachAdvisory(d, { ...advisory, confidence: conf(1) });
    expect(readvised.ok && readvised.value.status).toBe("PROPOSED");
    expect(readvised.ok && readvised.value.selectedOptionId).toBeNull();
  });

  it("only a human decide() finalizes, and it records who/why/when", () => {
    const decided = decide(proposed(), {
      selectedOptionId: "b",
      decidedBy: HUMAN,
      rationale: "The interview open sets stakes faster.",
      now: T1,
    });
    expect(decided.ok).toBe(true);
    if (decided.ok) {
      expect(decided.value.status).toBe("DECIDED");
      expect(decided.value.selectedOptionId).toBe("b");
      expect(decided.value.decidedBy).toBe(HUMAN);
      expect(decided.value.decisionRationale).toContain("stakes");
      expect(decided.value.decidedAt).toEqual(T1);
    }
  });

  it("rejects deciding an unknown option", () => {
    const result = decide(proposed(), {
      selectedOptionId: "does-not-exist",
      decidedBy: HUMAN,
      rationale: "n/a",
      now: T1,
    });
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.error).toBeInstanceOf(UnknownOptionError);
  });

  it("requires a rationale to decide", () => {
    const result = decide(proposed(), {
      selectedOptionId: "a",
      decidedBy: HUMAN,
      rationale: "   ",
      now: T1,
    });
    expect(result.ok).toBe(false);
  });

  it("cannot decide twice", () => {
    const first = decide(proposed(), {
      selectedOptionId: "a",
      decidedBy: HUMAN,
      rationale: "chose A",
      now: T1,
    });
    expect(first.ok).toBe(true);
    if (first.ok) {
      const second = decide(first.value, {
        selectedOptionId: "b",
        decidedBy: HUMAN,
        rationale: "changed mind",
        now: T1,
      });
      expect(second.ok).toBe(false);
      if (!second.ok) expect(second.error).toBeInstanceOf(DecisionAlreadyDecidedError);
    }
  });
});
