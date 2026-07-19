import { describe, expect, it } from "vitest";
import { DecisionAlreadyDecidedError, UnknownOptionError } from "@/domain/decision";
import { OwnerId } from "@/domain/project";
import { FixedClock, SequentialIdGenerator } from "../../../test/adapters/fakes";
import {
  InMemoryDecisionRepository,
  InMemoryProjectRepository,
} from "../../../test/adapters/in-memory-repositories";
import { createProject } from "../project/create-project";
import { NotAuthorizedError } from "../shared/errors";
import { attachAdvisory } from "./attach-advisory";
import { getDecision } from "./get-decision";
import { listDecisionsForProject } from "./list-decisions-for-project";
import { proposeDecision } from "./propose-decision";
import { recordHumanDecision } from "./record-human-decision";

const OWNER = OwnerId.unsafe("usr_00000001");
const OTHER = OwnerId.unsafe("usr_99999999");
const options = [
  { id: "a", label: "Cold open on the kitchen" },
  { id: "b", label: "Open on the chef interview" },
];

function env() {
  return {
    projects: new InMemoryProjectRepository(),
    decisions: new InMemoryDecisionRepository(),
    ids: new SequentialIdGenerator(),
    clock: new FixedClock(new Date("2026-07-19T00:00:00.000Z")),
  };
}

async function proposedDecision(e: ReturnType<typeof env>, advise = false) {
  const project = await createProject(e, { actorId: OWNER, name: "P" });
  if (!project.ok) throw project.error;
  const decision = await proposeDecision(e, {
    actorId: OWNER,
    projectId: project.value.id,
    question: "Which opening shot?",
    options,
    advisory: advise
      ? { recommendedOptionId: "a", rationale: "AI prefers A", confidence: 0.95 }
      : undefined,
  });
  if (!decision.ok) throw decision.error;
  return decision.value;
}

describe("proposeDecision", () => {
  it("creates a PROPOSED decision with no selection, even with a confident advisory", async () => {
    const decision = await proposedDecision(env(), true);
    expect(decision.status).toBe("PROPOSED");
    expect(decision.selectedOptionId).toBeNull();
    expect(decision.decidedBy).toBeNull();
    expect(decision.advisory?.recommendedOptionId).toBe("a");
  });

  it("denies proposing on a project the actor does not own", async () => {
    const e = env();
    const project = await createProject(e, { actorId: OWNER, name: "P" });
    if (!project.ok) throw project.error;
    const result = await proposeDecision(e, {
      actorId: OTHER,
      projectId: project.value.id,
      question: "Q?",
      options,
    });
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.error).toBeInstanceOf(NotAuthorizedError);
  });
});

describe("human authority", () => {
  it("attaching advisory never decides", async () => {
    const e = env();
    const decision = await proposedDecision(e);
    const result = await attachAdvisory(e, {
      actorId: OWNER,
      decisionId: decision.id,
      recommendedOptionId: "a",
      rationale: "AI likes A",
      confidence: 1,
    });
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value.status).toBe("PROPOSED");
      expect(result.value.selectedOptionId).toBeNull();
    }
  });

  it("only recordHumanDecision finalizes, attributing the deciding human", async () => {
    const e = env();
    const decision = await proposedDecision(e, true);
    const result = await recordHumanDecision(e, {
      actorId: OWNER,
      decisionId: decision.id,
      selectedOptionId: "b", // human overrides the AI's recommended "a"
      rationale: "The interview open sets stakes faster.",
    });
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value.status).toBe("DECIDED");
      expect(result.value.selectedOptionId).toBe("b");
      expect(result.value.decidedBy).toBe(OWNER);
    }
  });

  it("rejects deciding an unknown option", async () => {
    const e = env();
    const decision = await proposedDecision(e);
    const result = await recordHumanDecision(e, {
      actorId: OWNER,
      decisionId: decision.id,
      selectedOptionId: "nope",
      rationale: "x",
    });
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.error).toBeInstanceOf(UnknownOptionError);
  });

  it("cannot decide twice", async () => {
    const e = env();
    const decision = await proposedDecision(e);
    const first = await recordHumanDecision(e, {
      actorId: OWNER,
      decisionId: decision.id,
      selectedOptionId: "a",
      rationale: "chose A",
    });
    expect(first.ok).toBe(true);
    const second = await recordHumanDecision(e, {
      actorId: OWNER,
      decisionId: decision.id,
      selectedOptionId: "b",
      rationale: "changed mind",
    });
    expect(second.ok).toBe(false);
    if (!second.ok) expect(second.error).toBeInstanceOf(DecisionAlreadyDecidedError);
  });

  it("denies a non-owner from deciding", async () => {
    const e = env();
    const decision = await proposedDecision(e);
    const result = await recordHumanDecision(e, {
      actorId: OTHER,
      decisionId: decision.id,
      selectedOptionId: "a",
      rationale: "x",
    });
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.error).toBeInstanceOf(NotAuthorizedError);
  });
});

describe("listDecisionsForProject", () => {
  it("lists decisions for the owner", async () => {
    const e = env();
    const decision = await proposedDecision(e);
    const result = await listDecisionsForProject(e, {
      actorId: OWNER,
      projectId: decision.projectId,
    });
    expect(result.ok && result.value).toHaveLength(1);
  });
});

describe("getDecision", () => {
  it("returns a decision to its owner and denies others", async () => {
    const e = env();
    const decision = await proposedDecision(e);
    const owner = await getDecision(e, { actorId: OWNER, decisionId: decision.id });
    expect(owner.ok && owner.value.id).toBe(decision.id);
    const other = await getDecision(e, { actorId: OTHER, decisionId: decision.id });
    expect(other.ok).toBe(false);
    if (!other.ok) expect(other.error).toBeInstanceOf(NotAuthorizedError);
  });
});
