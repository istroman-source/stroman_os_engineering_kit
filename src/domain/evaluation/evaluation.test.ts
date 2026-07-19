import { describe, expect, it } from "vitest";
import { makeScore, makeSlug, type Score, type Slug } from "../shared";
import { OwnerId, ProjectId } from "../project/project-id";
import { createEvaluation, scoreMap } from "./evaluation";
import { CriterionId, EvaluationId, RubricId } from "./evaluation-id";
import {
  DuplicateCriterionError,
  EmptyEvaluationError,
  IncompleteScoringError,
} from "./evaluation-errors";
import { createRubric, type Rubric, weightedScore } from "./rubric";

const T0 = new Date("2026-07-17T00:00:00.000Z");
const cid = (n: string) => CriterionId.unsafe(`crit_${n}00000000`);
const anchors = { one: "poor", five: "ok", ten: "excellent" };

function slugOf(raw: string): Slug {
  const result = makeSlug(raw);
  if (!result.ok) throw result.error;
  return result.value;
}

function rubric(): Rubric {
  const result = createRubric({
    id: RubricId.unsafe("rbr_ABCDEF12"),
    slug: slugOf("story-quality"),
    title: "Story Quality",
    criteria: [
      { id: cid("a"), name: "Clarity", weight: 1, anchors },
      { id: cid("b"), name: "Emotion", weight: 3, anchors },
    ],
  });
  if (!result.ok) throw result.error;
  return result.value;
}

const score = (n: number): Score => {
  const s = makeScore(n);
  if (!s.ok) throw s.error;
  return s.value;
};

describe("createRubric", () => {
  it("creates a valid rubric", () => {
    expect(rubric().criteria).toHaveLength(2);
  });

  it("rejects empty criteria, duplicates, bad weights, and empty anchors", () => {
    const base = { id: RubricId.unsafe("rbr_ABCDEF12"), slug: "x" as Slug, title: "R" };
    expect(createRubric({ ...base, criteria: [] }).ok).toBe(false);
    expect(
      createRubric({
        ...base,
        criteria: [
          { id: cid("a"), name: "A", weight: 1, anchors },
          { id: cid("a"), name: "B", weight: 1, anchors },
        ],
      }).ok,
    ).toBe(false);
    expect(
      createRubric({ ...base, criteria: [{ id: cid("a"), name: "A", weight: 0, anchors }] }).ok,
    ).toBe(false);
    expect(
      createRubric({
        ...base,
        criteria: [
          { id: cid("a"), name: "A", weight: 1, anchors: { one: "", five: "x", ten: "y" } },
        ],
      }).ok,
    ).toBe(false);
  });
});

describe("weightedScore", () => {
  it("computes a weight-weighted average", () => {
    const scores = new Map([
      [cid("a"), score(10)],
      [cid("b"), score(2)],
    ]);
    const result = weightedScore(rubric(), scores);
    // (1*10 + 3*2) / (1+3) = 16/4 = 4
    expect(result).toEqual({ ok: true, value: 4 });
  });

  it("reports missing criteria", () => {
    const result = weightedScore(rubric(), new Map([[cid("a"), score(5)]]));
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error).toBeInstanceOf(IncompleteScoringError);
      expect(result.error.missing).toContain(cid("b"));
    }
  });
});

describe("createEvaluation", () => {
  const base = {
    id: EvaluationId.unsafe("eval_ABCDEF12"),
    projectId: ProjectId.unsafe("proj_ABCDEF12"),
    rubricId: RubricId.unsafe("rbr_ABCDEF12"),
    reviewerType: "HUMAN" as const,
    reviewerId: OwnerId.unsafe("usr_ABCDEF12"),
    now: T0,
  };

  it("creates a valid evaluation and indexes scores", () => {
    const result = createEvaluation({
      ...base,
      scores: [
        { criterionId: cid("a"), score: score(8), justification: "clear structure" },
        { criterionId: cid("b"), score: score(6), justification: "some emotional beats" },
      ],
    });
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value.scores).toHaveLength(2);
      expect(scoreMap(result.value).get(cid("a"))).toBe(8);
    }
  });

  it("requires at least one score", () => {
    const result = createEvaluation({ ...base, scores: [] });
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.error).toBeInstanceOf(EmptyEvaluationError);
  });

  it("rejects duplicate criteria", () => {
    const result = createEvaluation({
      ...base,
      scores: [
        { criterionId: cid("a"), score: score(8), justification: "one" },
        { criterionId: cid("a"), score: score(4), justification: "two" },
      ],
    });
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.error).toBeInstanceOf(DuplicateCriterionError);
  });

  it("requires a non-empty justification for every score", () => {
    const result = createEvaluation({
      ...base,
      scores: [{ criterionId: cid("a"), score: score(8), justification: "   " }],
    });
    expect(result.ok).toBe(false);
  });
});
