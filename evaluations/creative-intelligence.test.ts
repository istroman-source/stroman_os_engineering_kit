import { describe, expect, it } from "vitest";
import {
  CreativeBriefId,
  createCreativeBrief,
  evaluateCreativeQuality,
  generateDevelopmentBlueprint,
  type CreativeBriefInputFields,
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

function brief(fields: CreativeBriefInputFields) {
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

  it("fails closed for templated deterministic drafts across all five filmmaking modes", () => {
    const shared = {
      client: "Independent",
      creativeGoal: "make the audience feel the cost of commitment",
      targetAudience: "curious adults",
      desiredEmotion: "earned awe",
      context: "one location and one production day",
    };
    const cases = [
      ["DOCUMENTARY", "The Last Repair Shop", "documentary profile"],
      ["COMMERCIAL", "A Tool That Outlasts You", "product commercial"],
      ["PERFORMANCE", "One Breath", "live music performance"],
      ["NARRATIVE", "The Door She Locked Behind Her", "narrative short film"],
      ["OPEN", "The Weight of an Empty Chair", "experimental video"],
    ] as const;

    for (const [mode, title, projectType] of cases) {
      const project = brief({ ...shared, title, projectType });
      const output = generateDevelopmentBlueprint(project);
      const report = evaluateCreativeQuality(project, output);
      expect(output.mode).toBe(mode);
      expect(report.passed).toBe(false);
      expect(report.blockingFindings).toEqual(
        expect.arrayContaining([expect.stringMatching(/generic baseline language/i)]),
      );
    }
  });
});
