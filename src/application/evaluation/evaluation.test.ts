import { describe, expect, it } from "vitest";
import { OwnerId } from "@/domain/project";
import { RubricId } from "@/domain/evaluation";
import { FixedClock, SequentialIdGenerator } from "../../../test/adapters/fakes";
import {
  InMemoryEvaluationRepository,
  InMemoryProjectRepository,
  InMemoryRubricRepository,
} from "../../../test/adapters/in-memory-repositories";
import { createProject } from "../project/create-project";
import { NotAuthorizedError, NotFoundError, UnknownRubricCriterionError } from "../shared/errors";
import { createRubric } from "./create-rubric";
import { getEvaluation } from "./get-evaluation";
import { getRubric } from "./get-rubric";
import { listEvaluationsForProject } from "./list-evaluations-for-project";
import { recordEvaluation } from "./record-evaluation";

const OWNER = OwnerId.unsafe("usr_00000001");
const OTHER = OwnerId.unsafe("usr_99999999");
const anchors = { one: "poor", five: "ok", ten: "excellent" };

function env() {
  return {
    projects: new InMemoryProjectRepository(),
    rubrics: new InMemoryRubricRepository(),
    evaluations: new InMemoryEvaluationRepository(),
    ids: new SequentialIdGenerator(),
    clock: new FixedClock(new Date("2026-07-19T00:00:00.000Z")),
  };
}

async function setup(e: ReturnType<typeof env>) {
  const project = await createProject(e, { actorId: OWNER, name: "P" });
  if (!project.ok) throw project.error;
  const rubric = await createRubric(e, {
    slug: "story-quality",
    title: "Story Quality",
    criteria: [
      { name: "Clarity", weight: 1, anchors },
      { name: "Emotion", weight: 3, anchors },
    ],
  });
  if (!rubric.ok) throw rubric.error;
  const [c0, c1] = rubric.value.criteria;
  if (!c0 || !c1) throw new Error("expected two criteria");
  return { projectId: project.value.id, rubricId: rubric.value.id, c0: c0.id, c1: c1.id };
}

describe("recordEvaluation", () => {
  it("records a valid human evaluation attributed to the actor", async () => {
    const e = env();
    const { projectId, rubricId, c0, c1 } = await setup(e);
    const result = await recordEvaluation(e, {
      actorId: OWNER,
      projectId,
      rubricId,
      reviewerType: "HUMAN",
      scores: [
        { criterionId: c0, score: 8, justification: "clear structure" },
        { criterionId: c1, score: 6, justification: "some emotion" },
      ],
    });
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value.scores).toHaveLength(2);
      expect(result.value.reviewerId).toBe(OWNER);
    }
  });

  it("rejects a score for a criterion not in the rubric", async () => {
    const e = env();
    const { projectId, rubricId } = await setup(e);
    const result = await recordEvaluation(e, {
      actorId: OWNER,
      projectId,
      rubricId,
      reviewerType: "HUMAN",
      scores: [{ criterionId: "crit_zzzzzzzz", score: 5, justification: "x" }],
    });
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.error).toBeInstanceOf(UnknownRubricCriterionError);
  });

  it("rejects an out-of-range score", async () => {
    const e = env();
    const { projectId, rubricId, c0 } = await setup(e);
    const result = await recordEvaluation(e, {
      actorId: OWNER,
      projectId,
      rubricId,
      reviewerType: "HUMAN",
      scores: [{ criterionId: c0, score: 99, justification: "x" }],
    });
    expect(result.ok).toBe(false);
  });

  it("denies a non-owner", async () => {
    const e = env();
    const { projectId, rubricId, c0 } = await setup(e);
    const result = await recordEvaluation(e, {
      actorId: OTHER,
      projectId,
      rubricId,
      reviewerType: "HUMAN",
      scores: [{ criterionId: c0, score: 5, justification: "x" }],
    });
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.error).toBeInstanceOf(NotAuthorizedError);
  });

  it("reports a missing rubric", async () => {
    const e = env();
    const project = await createProject(e, { actorId: OWNER, name: "P" });
    if (!project.ok) throw project.error;
    const result = await recordEvaluation(e, {
      actorId: OWNER,
      projectId: project.value.id,
      rubricId: RubricId.unsafe("rbr_deadbeef"),
      reviewerType: "HUMAN",
      scores: [{ criterionId: "crit_00000001", score: 5, justification: "x" }],
    });
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.error).toBeInstanceOf(NotFoundError);
  });
});

describe("listEvaluationsForProject", () => {
  it("returns evaluations for the owner's project", async () => {
    const e = env();
    const { projectId, rubricId, c0 } = await setup(e);
    await recordEvaluation(e, {
      actorId: OWNER,
      projectId,
      rubricId,
      reviewerType: "HUMAN",
      scores: [{ criterionId: c0, score: 7, justification: "ok" }],
    });
    const result = await listEvaluationsForProject(e, { actorId: OWNER, projectId });
    expect(result.ok && result.value).toHaveLength(1);
  });
});

describe("getRubric", () => {
  it("returns a stored rubric", async () => {
    const e = env();
    const { rubricId } = await setup(e);
    const result = await getRubric(e, { rubricId });
    expect(result.ok && result.value.id).toBe(rubricId);
  });

  it("reports a missing rubric", async () => {
    const result = await getRubric(env(), { rubricId: RubricId.unsafe("rbr_deadbeef") });
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.error).toBeInstanceOf(NotFoundError);
  });
});

describe("getEvaluation", () => {
  it("returns an evaluation to the project owner and denies others", async () => {
    const e = env();
    const { projectId, rubricId, c0 } = await setup(e);
    const recorded = await recordEvaluation(e, {
      actorId: OWNER,
      projectId,
      rubricId,
      reviewerType: "HUMAN",
      scores: [{ criterionId: c0, score: 7, justification: "ok" }],
    });
    if (!recorded.ok) throw recorded.error;

    const owner = await getEvaluation(e, { actorId: OWNER, evaluationId: recorded.value.id });
    expect(owner.ok && owner.value.id).toBe(recorded.value.id);

    const other = await getEvaluation(e, { actorId: OTHER, evaluationId: recorded.value.id });
    expect(other.ok).toBe(false);
    if (!other.ok) expect(other.error).toBeInstanceOf(NotAuthorizedError);
  });
});
