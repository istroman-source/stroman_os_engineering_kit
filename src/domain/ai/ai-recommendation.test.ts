import { describe, expect, it } from "vitest";
import { InvalidValueError } from "../shared";
import { InvalidAiRecommendationError } from "./ai-errors";
import { type AiRecommendationInput, makeAiRecommendation } from "./ai-recommendation";

function validInput(): AiRecommendationInput {
  return {
    observations: [{ statement: "Cuts land on action", evidence: "0:12, 0:34" }],
    inferences: [{ statement: "Pacing feels rushed", confidence: 0.6 }],
    unknowns: ["Client tolerance for length"],
    options: [
      {
        name: "Trim intro",
        reasoning: "Front-load the hook",
        benefits: ["faster"],
        tradeoffs: ["less setup"],
        risks: [],
      },
      {
        name: "Add breathing room",
        reasoning: "Let beats land",
        benefits: ["clarity"],
        tradeoffs: ["longer"],
        risks: [],
      },
    ],
    recommendation: {
      selectedOption: "Trim intro",
      reasoning: "The hook is buried",
      nextActions: ["Cut first 6 seconds"],
      confidence: 0.7,
    },
  };
}

describe("makeAiRecommendation", () => {
  it("accepts valid input and preserves the observation/inference/unknown separation", () => {
    const result = makeAiRecommendation(validInput());
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value.observations).toHaveLength(1);
      expect(result.value.inferences[0]?.confidence).toBe(0.6);
      expect(result.value.unknowns).toHaveLength(1);
      expect(result.value.recommendation.selectedOption).toBe("Trim intro");
    }
  });

  it("requires the recommendation to select an offered option", () => {
    const result = makeAiRecommendation({
      ...validInput(),
      recommendation: { ...validInput().recommendation, selectedOption: "Do nothing" },
    });
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.error).toBeInstanceOf(InvalidAiRecommendationError);
  });

  it("rejects out-of-range confidence", () => {
    const result = makeAiRecommendation({
      ...validInput(),
      recommendation: { ...validInput().recommendation, confidence: 1.5 },
    });
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.error).toBeInstanceOf(InvalidValueError);
  });

  it("requires at least one option", () => {
    const result = makeAiRecommendation({
      ...validInput(),
      options: [],
      recommendation: { ...validInput().recommendation },
    });
    expect(result.ok).toBe(false);
  });

  it("rejects an inference with invalid confidence", () => {
    const result = makeAiRecommendation({
      ...validInput(),
      inferences: [{ statement: "x", confidence: -1 }],
    });
    expect(result.ok).toBe(false);
  });

  it("carries no provider or model coupling in its shape", () => {
    const result = makeAiRecommendation(validInput());
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(Object.keys(result.value).sort()).toEqual([
        "inferences",
        "observations",
        "options",
        "recommendation",
        "unknowns",
      ]);
    }
  });
});
