import { render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { EditEngine } from "./edit-engine";

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("EditEngine", () => {
  it("renders the intent-to-evidence bridge with honest gaps and uncertainty", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(
        async () =>
          ({
            ok: true,
            status: 200,
            json: async () => ({
              analysisVersion: 4,
              story: {
                summary: "A working artist confronts the cost of the craft.",
                objective: "Reveal the hidden tradeoff.",
                structure: "Result, pressure, choice.",
                emotionalArc: ["Curiosity", "Pressure", "Release"],
              },
              strongestObservations: [],
              recommendations: [],
              alternatives: [],
              evidenceBridge: {
                intended: {
                  goal: "Reveal the hidden cost behind the work.",
                  audience: "Working artists",
                  success: "The audience recognizes its own tradeoffs.",
                },
                captured: [
                  {
                    id: "observation-1",
                    content: "The artist pauses before committing to the cut.",
                    confidence: 1,
                    evidenceReferenceIds: ["evidence-1"],
                  },
                ],
                supportedStory: [
                  {
                    id: "theme-1",
                    content: "Hesitation may carry the emotional turn.",
                    confidence: 0.64,
                    evidenceReferenceIds: ["evidence-1"],
                    counterEvidencePrompt: "Check whether later material changes this pattern.",
                  },
                ],
                potentialBeyondBrief: [],
                missing: [],
                nextAction: {
                  id: "recommendation-1",
                  title: "Test the hesitation as the turn",
                  rationale: "It is visible in the cited source moment.",
                  confidence: 0.7,
                  evidenceReferenceIds: ["evidence-1"],
                },
              },
            }),
          }) as Response,
      ),
    );

    render(<EditEngine projectId="proj_1" />);

    expect(await screen.findByRole("heading", { name: "Intent → evidence" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Captured" })).toBeInTheDocument();
    expect(screen.getByText(/pauses before committing/i)).toBeInTheDocument();
    expect(screen.getByText(/64% confidence/i)).toBeInTheDocument();
    expect(screen.getByText(/What could challenge this:/i)).toHaveTextContent(/later material/i);
    expect(screen.getByText(/No evidence-backed expansion/i)).toBeInTheDocument();
    expect(screen.getByText(/No specific gap was identified automatically/i)).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Next creative choice" })).toBeInTheDocument();
  });
});
