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
  it("produces all eleven sections", () => {
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
    expect(bp.masterPrompt).toContain("Desired emotion: hungry");
  });

  it("is deterministic", () => {
    expect(generateBlueprint(brief())).toEqual(generateBlueprint(brief()));
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
});
