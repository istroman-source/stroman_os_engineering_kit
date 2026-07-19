import { describe, expect, it } from "vitest";
import { err, ok } from "@/lib/result";
import { AiError, type AiRecommendation, makeAiRecommendation } from "@/domain/ai";
import { StubAiRecommender } from "../../../test/adapters/fakes";
import { requestRecommendation } from "./request-recommendation";

function sampleRecommendation(): AiRecommendation {
  const built = makeAiRecommendation({
    observations: [{ statement: "Hook is buried", evidence: "0:00-0:08" }],
    inferences: [{ statement: "Viewers may drop early", confidence: 0.6 }],
    unknowns: ["client length tolerance"],
    options: [
      { name: "Trim intro", reasoning: "front-load hook", benefits: [], tradeoffs: [], risks: [] },
      { name: "Keep intro", reasoning: "more setup", benefits: [], tradeoffs: [], risks: [] },
    ],
    recommendation: {
      selectedOption: "Trim intro",
      reasoning: "hook first",
      nextActions: ["cut 6s"],
      confidence: 0.7,
    },
  });
  if (!built.ok) throw built.error;
  return built.value;
}

describe("requestRecommendation", () => {
  it("returns a provider-neutral recommendation on success", async () => {
    const deps = { recommender: new StubAiRecommender(ok(sampleRecommendation())) };
    const result = await requestRecommendation(deps, {
      instruction: "Diagnose pacing",
      context: "edit A",
    });
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value.recommendation.selectedOption).toBe("Trim intro");
      // Advisory only — the result carries no decision authority or state.
      expect("status" in result.value).toBe(false);
    }
  });

  it("surfaces a port failure as a typed AiError without side effects", async () => {
    const deps = {
      recommender: new StubAiRecommender(err(new AiError("provider unavailable"))),
    };
    const result = await requestRecommendation(deps, { instruction: "x", context: "y" });
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.error).toBeInstanceOf(AiError);
  });
});
