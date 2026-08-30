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
      await screen.findByRole("heading", { name: "What was actually captured" }),
    ).toBeInTheDocument();
    expect(screen.getByText("Source-backed")).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: "Ideas to test" }),
    ).toBeInTheDocument();
    expect(screen.getByText(/Editorial interpretation · Story progression/i)).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: "Your next creative choices" }),
    ).toBeInTheDocument();
    expect(screen.getByText(/never automatic creative decisions/i)).toBeInTheDocument();
    expect(screen.queryByText(/Source-backed moment:/i)).not.toBeInTheDocument();
  });

  it("renders timestamped video observations in playback order", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(
        async () =>
          ({
            ok: true,
            status: 200,
            json: async () => ({
              run: { id: "run-video", version: 4, status: "COMPLETED" },
              outputs: [
                {
                  id: "out-late",
                  kind: "OBSERVATION",
                  content: "[OBSERVED @ 00:03.8] The hand reaches the mug.",
                  confidence: 0.9,
                  evidenceReferenceIds: ["media-evidence"],
                },
                {
                  id: "out-first",
                  kind: "OBSERVATION",
                  content: "[OBSERVED @ 00:00.2] The desk geography is visible.",
                  confidence: 0.9,
                  evidenceReferenceIds: ["media-evidence"],
                },
                {
                  id: "out-middle",
                  kind: "OBSERVATION",
                  content: "[OBSERVED @ 00:02.0] The hand overlaps the yellow note.",
                  confidence: 0.9,
                  evidenceReferenceIds: ["media-evidence"],
                },
              ],
              recommendations: [],
            }),
          }) as Response,
      ),
    );

    render(<AutomaticAnalysis projectId="proj_video" />);
    await screen.findByText(/desk geography is visible/i);
    expect(screen.getAllByText(/^\[OBSERVED @/).map((element) => element.textContent)).toEqual([
      "[OBSERVED @ 00:00.2] The desk geography is visible.",
      "[OBSERVED @ 00:02.0] The hand overlaps the yellow note.",
      "[OBSERVED @ 00:03.8] The hand reaches the mug.",
    ]);
  });
});
