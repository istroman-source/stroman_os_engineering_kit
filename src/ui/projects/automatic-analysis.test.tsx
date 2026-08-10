import { render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { AutomaticAnalysis } from "./automatic-analysis";

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("AutomaticAnalysis", () => {
  it("visually separates source evidence from editorial interpretations and decisions", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(
        async () =>
          ({
            ok: true,
            status: 200,
            json: async () => ({
              run: { id: "run-1", version: 2, status: "COMPLETED" },
              outputs: [
                {
                  id: "out-1",
                  kind: "OBSERVATION",
                  content: "Source-backed moment: “I had to start at the bottom.”",
                  confidence: 1,
                  evidenceReferenceIds: ["evidence-1"],
                },
                {
                  id: "out-2",
                  kind: "NARRATIVE",
                  content:
                    "Possible source-backed progression (interpretation): starting → adapting.",
                  confidence: 0.58,
                  evidenceReferenceIds: ["evidence-1", "evidence-2"],
                },
              ],
              recommendations: [
                {
                  id: "rec-1",
                  title: "Test the progression",
                  rationale: "Why it may matter: it may reveal change.",
                  confidence: 0.68,
                  evidenceReferenceIds: ["evidence-1", "evidence-2"],
                },
              ],
            }),
          }) as Response,
      ),
    );

    render(<AutomaticAnalysis projectId="proj_1" />);

    expect(
      await screen.findByRole("heading", { name: "Source-backed moments" }),
    ).toBeInTheDocument();
    expect(screen.getByText("Source-backed")).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: "Editorial interpretations to test" }),
    ).toBeInTheDocument();
    expect(screen.getByText(/Editorial interpretation · Story progression/i)).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: "Filmmaker-controlled editorial tests" }),
    ).toBeInTheDocument();
    expect(screen.getByText(/never automatic creative decisions/i)).toBeInTheDocument();
    expect(screen.queryByText(/Source-backed moment:/i)).not.toBeInTheDocument();
  });
});
