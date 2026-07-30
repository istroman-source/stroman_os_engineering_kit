import { describe, expect, it } from "vitest";
import { synthesizePrompt } from ".";

const editEngine = {
  analysisVersion: 4,
  story: {
    summary: "A craftsperson builds one lasting object.",
    objective: "Show why patience matters.",
    structure: "Result, struggle, resolution.",
    emotionalArc: ["Wonder", "Tension", "Relief"],
  },
  strongestObservations: [
    {
      id: "observation",
      kind: "OBSERVATION" as const,
      content: "The maker repeats that speed harms quality.",
      confidence: 0.9,
      evidenceReferenceIds: ["evidence-1"],
    },
  ],
  recommendations: [
    {
      id: "recommendation",
      title: "Build around patience",
      rationale: "It connects the strongest interview moments.",
      confidence: 0.8,
      evidenceReferenceIds: ["evidence-1", "evidence-2"],
    },
  ],
  alternatives: [{ title: "Result first", description: "Open on the finished object." }],
};

describe("synthesizePrompt", () => {
  it("creates a provider-neutral evidence-cited editorial prompt", () => {
    const result = synthesizePrompt(editEngine);

    expect(result.format).toBe("PLAIN_TEXT");
    expect(result.analysisVersion).toBe(4);
    expect(result.prompt).toContain("CURRENT STORY");
    expect(result.prompt).toContain("[evidence: evidence-1]");
    expect(result.prompt).toContain("Do not invent dialogue, events, shots, or source evidence.");
    expect(result.evidenceReferenceIds).toEqual(["evidence-1", "evidence-2"]);
  });

  it("labels Wideframe as a manual handoff without claiming an API transfer", () => {
    const result = synthesizePrompt(editEngine);

    expect(result.wideframe.capability).toBe("MANUAL_COPY_ONLY");
    expect(result.wideframe.instructions).toContain("No public Wideframe API");
  });
});
