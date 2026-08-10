import { describe, expect, it } from "vitest";
import { ProjectId } from "../project/project-id";
import {
  type CreativeBrief,
  CreativeBriefId,
  createCreativeBrief,
  generateBlueprint,
  reviseCreativeBrief,
} from "./index";

const T0 = new Date("2026-07-19T00:00:00.000Z");
const T1 = new Date("2026-07-20T00:00:00.000Z");

function fields(overrides: Partial<CreativeBrief> = {}) {
  return {
    title: "Signature Dish Reel",
    client: "Jimmy's Famous Seafood",
    projectType: "Instagram reel",
    creativeGoal: "make viewers crave the crab cake",
    targetAudience: "Baltimore food lovers on Instagram",
    desiredEmotion: "hungry",
    context: "Shot in the kitchen; 20s vertical; fast cuts.",
    ...overrides,
  };
}

function brief(overrides: Partial<CreativeBrief> = {}): CreativeBrief {
  const result = createCreativeBrief({
    id: CreativeBriefId.unsafe("brief_AAAAAAA1"),
    projectId: ProjectId.unsafe("proj_AAAAAAA1"),
    now: T0,
    ...fields(overrides),
  });
  if (!result.ok) throw result.error;
  return result.value;
}

describe("createCreativeBrief", () => {
  it("creates a brief from valid context", () => {
    const b = brief();
    expect(b.title).toBe("Signature Dish Reel");
    expect(b.lockVersion).toBe(1);
  });

  it("rejects an empty required field", () => {
    const result = createCreativeBrief({
      id: CreativeBriefId.unsafe("brief_AAAAAAA1"),
      projectId: ProjectId.unsafe("proj_AAAAAAA1"),
      now: T0,
      ...fields({ title: "   " }),
    });
    expect(result.ok).toBe(false);
  });

  it("accepts an idea while preserving unsupplied development context as empty", () => {
    const result = createCreativeBrief({
      id: CreativeBriefId.unsafe("brief_IDEAONLY1"),
      projectId: ProjectId.unsafe("proj_AAAAAAA1"),
      now: T0,
      title: "A baker teaches his daughter the family recipe before selling the bakery",
      client: "",
      projectType: "",
      creativeGoal: "",
      targetAudience: "",
      desiredEmotion: "",
      context: "",
    });

    expect(result.ok).toBe(true);
    if (result.ok) expect(result.value.targetAudience).toBe("");
  });
});

describe("reviseCreativeBrief", () => {
  it("replaces fields and updates the timestamp, keeping lockVersion", () => {
    const revised = reviseCreativeBrief(brief(), fields({ desiredEmotion: "nostalgic" }), T1);
    expect(revised.ok).toBe(true);
    if (!revised.ok) return;
    expect(revised.value.desiredEmotion).toBe("nostalgic");
    expect(revised.value.updatedAt).toEqual(T1);
    expect(revised.value.lockVersion).toBe(1);
  });
});

describe("generateBlueprint", () => {
  it("produces the legacy handoff plus an idea-first development blueprint", () => {
    const bp = generateBlueprint(brief());
    expect(bp.projectSummary).toContain("Signature Dish Reel");
    expect(bp.projectSummary).toContain("Jimmy's Famous Seafood");
    expect(bp.storyObjective).not.toBe("");
    expect(bp.audienceAnalysis).toContain("Baltimore");
    expect(bp.emotionalArc.length).toBe(3);
    expect(bp.recommendedStructure).not.toBe("");
    expect(bp.hookConcepts).toHaveLength(3);
    expect(bp.editingBlueprint.length).toBeGreaterThan(0);
    expect(bp.brollPriorities.length).toBeGreaterThan(0);
    expect(bp.risks.length).toBeGreaterThan(0);
    expect(bp).not.toHaveProperty("masterPrompt");
    expect(bp.development.basis).toBe("PROJECT_INTENT_ONLY");
    expect(bp.development.recommendedDirection.title).toBe("Proof before promise");
    expect(bp.development.alternatives).toHaveLength(3);
    expect(bp.development.alternatives.some((direction) => direction.unconventional)).toBe(true);
    expect(new Set(bp.development.alternatives.map((item) => item.organizingPrinciple)).size).toBe(
      3,
    );
  });

  it("is deterministic", () => {
    expect(generateBlueprint(brief())).toEqual(generateBlueprint(brief()));
  });

  it("normalizes user punctuation without creating broken intent sentences", () => {
    const bp = generateBlueprint(
      brief({
        projectType: "Documentary.",
        creativeGoal: "Tell the story of starting over!!!",
        targetAudience: "New audiences.",
        desiredEmotion: "Hopeful.",
      }),
    );

    expect(bp.projectSummary).toContain("Creative goal: Tell the story of starting over!");
    expect(bp.projectSummary).toContain("Intended audience: New audiences.");
    expect(bp.projectSummary).toContain("Intended feeling: hopeful.");
    expect(bp.storyObjective).toBe(
      "Objective: Tell the story of starting over! Use each creative choice to help the audience leave feeling hopeful.",
    );
    expect(`${bp.projectSummary} ${bp.storyObjective}`).not.toMatch(/\.{2,}|!{2,}|\bto Tell\b/);
  });

  it("omits interview strategy for a short-form reel", () => {
    expect(generateBlueprint(brief()).interviewStrategy).toBeNull();
  });

  it("includes interview strategy for a documentary/interview format", () => {
    const bp = generateBlueprint(
      brief({ projectType: "brand documentary with founder interview" }),
    );
    expect(bp.interviewStrategy).not.toBeNull();
    expect((bp.interviewStrategy ?? []).length).toBeGreaterThan(0);
  });

  it("turns a title-only documentary idea into specific hypotheses without inventing facts", () => {
    const bp = generateBlueprint(
      brief({
        title: "A baker teaches his daughter the family recipe before selling the bakery",
        client: "",
        projectType: "",
        creativeGoal: "",
        targetAudience: "",
        desiredEmotion: "",
        context: "",
      }),
    );

    expect(bp.development.mode).toBe("DOCUMENTARY");
    expect(bp.development.objectiveRead).toContain("premise, not yet a finished objective");
    expect(bp.development.recommendedDirection.title).toBe("Build around the irreversible handoff");
    expect(bp.development.recommendedDirection).not.toHaveProperty("score");
    expect(bp.development.alternatives.every((direction) => !("score" in direction))).toBe(true);
    expect(bp.development.creativeChallenge).toContain("subject but not yet a story");
    expect(bp.development.questions.length).toBeGreaterThanOrEqual(1);
    expect(bp.development.questions.length).toBeLessThanOrEqual(3);
    expect(bp.development.questions.every((item) => item.decisionItChanges.length > 20)).toBe(true);
    expect(bp.development.directorBlueprint.rendering).toEqual(
      expect.objectContaining({ capability: "STRUCTURED_BLUEPRINT_ONLY", provider: null }),
    );
    expect(bp.development.directorBlueprint.risk).toContain("none supplied");
    expect(`${bp.projectSummary} ${bp.storyObjective}`).not.toContain("for  in the");
  });

  it("uses the idea when a generic format label does not identify the filmmaking mode", () => {
    const bp = generateBlueprint(
      brief({
        title: "A live concert captured in one unbroken breath",
        projectType: "video",
      }),
    );

    expect(bp.development.mode).toBe("PERFORMANCE");
    expect(bp.development.recommendedDirection.title).toBe(
      "Let the constraint shape the performance",
    );
  });
});
