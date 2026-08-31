import { describe, expect, it } from "vitest";
import { composeEditEngine } from ".";

describe("composeEditEngine", () => {
  it("combines creative intent with ranked grounded observations and alternatives", () => {
    const view = composeEditEngine(
      {
        brief: {
          creativeGoal: "Reveal the cost behind the craft.",
          targetAudience: "Working artists",
          successCriteria: "Artists recognize their own tradeoffs.",
        } as never,
        blueprint: {
          development: {} as never,
          projectSummary: "A portrait of a working artist.",
          storyObjective: "Reveal the cost behind the craft.",
          audienceAnalysis: "Artists",
          emotionalArc: ["Curiosity", "Tension", "Release"],
          recommendedStructure: "Open on the finished work, then reveal the process.",
          hookConcepts: [
            { title: "Result first", description: "Open on the final image." },
            { title: "Tension first", description: "Open on the hardest decision." },
          ],
          editingBlueprint: [],
          interviewStrategy: null,
          brollPriorities: [],
          risks: [],
        },
      },
      {
        run: { version: 3 },
        outputs: [
          {
            id: "low",
            kind: "THEME",
            content: "Craft",
            confidence: 0.5,
            evidenceReferenceIds: ["evidence-low"],
          },
          {
            id: "prompt",
            kind: "PROMPT",
            content: "Generate a revised opening.",
            confidence: 1,
            evidenceReferenceIds: ["evidence-prompt"],
          },
          {
            id: "high",
            kind: "OBSERVATION",
            content: "The artist values patience.",
            confidence: 0.9,
            evidenceReferenceIds: ["evidence-high"],
          },
        ],
        recommendations: [
          {
            id: "recommendation",
            title: "Build around patience",
            rationale: "It is the strongest recurring idea.",
            confidence: 0.8,
            evidenceReferenceIds: ["evidence-high"],
          },
        ],
      },
    );

    expect(view.analysisVersion).toBe(3);
    expect(view.story.objective).toBe("Reveal the cost behind the craft.");
    expect(view.strongestObservations.map((item) => item.id)).toEqual(["high"]);
    expect(view.strongestObservations[0]?.evidenceReferenceIds).toEqual(["evidence-high"]);
    expect(view.recommendations).toHaveLength(1);
    expect(view.alternatives).toHaveLength(2);
    expect(view.evidenceBridge.intended).toEqual({
      goal: "Reveal the cost behind the craft.",
      audience: "Working artists",
      success: "Artists recognize their own tradeoffs.",
    });
    expect(view.evidenceBridge.supportedStory[0]).toMatchObject({
      id: "low",
      counterEvidencePrompt: expect.stringContaining("full material"),
    });
    expect(view.evidenceBridge.potentialBeyondBrief.map((item) => item.id)).toEqual(["high"]);
    expect(view.evidenceBridge.missing.map((item) => item.id)).toEqual(["prompt"]);
    expect(view.evidenceBridge.nextAction?.id).toBe("recommendation");
  });

  it("limits the workspace to five strongest observations", () => {
    const outputs = Array.from({ length: 7 }, (_, index) => ({
      id: String(index),
      kind: "OBSERVATION" as const,
      content: `Observation ${index}`,
      confidence: index / 10,
      evidenceReferenceIds: [`evidence-${index}`],
    }));
    const view = composeEditEngine(
      {
        brief: {
          creativeGoal: "Goal",
          targetAudience: "Audience",
          successCriteria: "Success",
        } as never,
        blueprint: {
          development: {} as never,
          projectSummary: "Summary",
          storyObjective: "Objective",
          audienceAnalysis: "Audience",
          emotionalArc: [],
          recommendedStructure: "Structure",
          hookConcepts: [],
          editingBlueprint: [],
          interviewStrategy: null,
          brollPriorities: [],
          risks: [],
        },
      },
      { run: { version: 1 }, outputs, recommendations: [] },
    );

    expect(view.strongestObservations.map((item) => item.id)).toEqual(["6", "5", "4", "3", "2"]);
  });
});
