import { describe, expect, it } from "vitest";
import {
  CreativeBriefId,
  createCreativeBrief,
  generateBlueprint,
  type CreativeBriefFields,
} from "../src/domain/creative";
import { ProjectId } from "../src/domain/project";

const BENCHMARK_CONTRACT = {
  comparisonLanes: ["STROMAN_OS", "RAW_GENERAL_MODEL", "HUMAN_FILMMAKER_REVIEW"],
  dimensions: [
    "usefulness",
    "evidence grounding",
    "story insight",
    "originality",
    "emotional intelligence",
    "specificity",
    "editability / shootability",
    "audience fit",
    "surprise",
    "distinctiveness",
    "clarity",
    "purposeful innovation",
    "resistance to generic AI language",
  ],
  protocol:
    "Compare outputs blind where possible; preserve written rationale and filmmaker disagreement instead of collapsing quality into one automatic score.",
} as const;

function brief(fields: CreativeBriefFields) {
  const result = createCreativeBrief({
    id: CreativeBriefId.unsafe("brief_BENCH001"),
    projectId: ProjectId.unsafe("proj_BENCH001"),
    now: new Date("2026-08-10T00:00:00.000Z"),
    ...fields,
  });
  if (!result.ok) throw result.error;
  return result.value;
}

describe("Stroman creative-intelligence benchmark contract", () => {
  it("keeps comparison lanes and filmmaking-quality dimensions explicit", () => {
    expect(BENCHMARK_CONTRACT.comparisonLanes).toEqual([
      "STROMAN_OS",
      "RAW_GENERAL_MODEL",
      "HUMAN_FILMMAKER_REVIEW",
    ]);
    expect(BENCHMARK_CONTRACT.dimensions).toContain("resistance to generic AI language");
    expect(BENCHMARK_CONTRACT.dimensions).toContain("editability / shootability");
    expect(BENCHMARK_CONTRACT.protocol).toContain("filmmaker disagreement");
  });

  it("develops a title-only idea into a point of view, real alternatives, and a shootable blueprint", () => {
    const blueprint = generateBlueprint(
      brief({
        title:
          "A night-shift baker teaches his daughter the family recipe before selling the bakery",
        client: "",
        projectType: "",
        creativeGoal: "",
        targetAudience: "",
        desiredEmotion: "",
        context: "",
      }),
    );
    const result = blueprint.development;
    const rendered = JSON.stringify(result).toLowerCase();

    expect(result.basis).toBe("PROJECT_INTENT_ONLY");
    expect(result.recommendedDirection.title).toBe("Build around the irreversible handoff");
    expect(result.objectiveRead).toContain("night-shift baker");
    expect(result.recommendedDirection.whyThisWins).toContain("without pretending");
    expect(result.recommendedDirection).not.toHaveProperty("score");
    expect(result.alternatives.every((direction) => !("score" in direction))).toBe(true);
    expect(result.creativeChallenge).toMatch(/do not|if the film/i);
    expect(result.alternatives).toHaveLength(3);
    expect(result.alternatives.some((direction) => direction.unconventional)).toBe(true);
    expect(
      new Set(result.alternatives.map((direction) => direction.organizingPrinciple)).size,
    ).toBe(3);
    expect(result.questions.length).toBeGreaterThanOrEqual(1);
    expect(result.questions.length).toBeLessThanOrEqual(3);
    expect(result.questions.every((question) => question.decisionItChanges.length > 20)).toBe(true);
    expect(result.sequencePlan).toHaveLength(3);
    expect(result.sequencePlan.every((sequence) => sequence.picture && sequence.sound)).toBe(true);
    expect(result.storyboard).toMatchObject({
      status: "RENDERED",
      renderer: "STROMAN_PENCIL_SVG_V1",
    });
    expect(result.storyboard.frames.length).toBeGreaterThanOrEqual(3);
    expect(result.storyboard.blocking.zones.length).toBeGreaterThan(0);
    expect(result.storyboard.look.swatches.length).toBeGreaterThanOrEqual(3);
    for (const craftField of [
      result.directorBlueprint.composition,
      result.directorBlueprint.blocking,
      result.directorBlueprint.camera,
      result.directorBlueprint.practicalsAndLighting,
      result.directorBlueprint.backgroundAndDesign,
      result.directorBlueprint.colorAndGrade,
      result.directorBlueprint.movement,
      result.directorBlueprint.soundAndAtmosphere,
    ]) {
      expect(craftField.length).toBeGreaterThan(35);
    }
    expect(rendered).not.toContain("great idea");
    expect(rendered).not.toContain("as an ai");
    expect(rendered).not.toContain('"score"');
    expect(rendered).toContain("hypotheses");
  });

  it("changes its recommendation across filmmaking modes instead of returning one house template", () => {
    const shared = {
      client: "Independent",
      creativeGoal: "make the audience feel the cost of commitment",
      targetAudience: "curious adults",
      desiredEmotion: "earned awe",
      context: "one location and one production day",
    };
    const documentary = generateBlueprint(
      brief({ ...shared, title: "The Last Repair Shop", projectType: "documentary profile" }),
    ).development;
    const commercial = generateBlueprint(
      brief({ ...shared, title: "A Tool That Outlasts You", projectType: "product commercial" }),
    ).development;
    const performance = generateBlueprint(
      brief({ ...shared, title: "One Breath", projectType: "live music performance" }),
    ).development;
    const narrative = generateBlueprint(
      brief({
        ...shared,
        title: "The Door She Locked Behind Her",
        projectType: "narrative short film",
      }),
    ).development;
    const open = generateBlueprint(
      brief({
        ...shared,
        title: "The Weight of an Empty Chair",
        projectType: "experimental video",
      }),
    ).development;

    expect(
      new Set([
        documentary.recommendedDirection.title,
        commercial.recommendedDirection.title,
        performance.recommendedDirection.title,
        narrative.recommendedDirection.title,
        open.recommendedDirection.title,
      ]).size,
    ).toBe(5);
    expect(documentary.mode).toBe("DOCUMENTARY");
    expect(commercial.mode).toBe("COMMERCIAL");
    expect(performance.mode).toBe("PERFORMANCE");
    expect(narrative.mode).toBe("NARRATIVE");
    expect(open.mode).toBe("OPEN");

    const outputs = [documentary, commercial, performance, narrative, open];
    for (const field of [
      "composition",
      "blocking",
      "camera",
      "practicalsAndLighting",
      "backgroundAndDesign",
      "colorAndGrade",
      "movement",
      "soundAndAtmosphere",
      "optionalExploration",
    ] as const) {
      expect(new Set(outputs.map((output) => output.directorBlueprint[field])).size).toBe(5);
    }
    expect(
      new Set(outputs.map((output) => JSON.stringify(output.directorBlueprint.mustGet))).size,
    ).toBe(5);
    expect(
      new Set(
        outputs.map((output) =>
          JSON.stringify(output.sequencePlan.map(({ picture, sound }) => ({ picture, sound }))),
        ),
      ).size,
    ).toBe(5);
    expect(documentary.directorBlueprint.blocking).toContain("real routine");
    expect(commercial.directorBlueprint.camera).toContain("proof frame");
    expect(performance.directorBlueprint.soundAndAtmosphere).toContain("complete performance");
    expect(narrative.directorBlueprint.blocking).toContain("physical objective");
    expect(open.directorBlueprint.camera).toContain("one normal lens");
  });
});
