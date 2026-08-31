import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { proposeRecommendationDecision } from "@/ui/decisions/decisions-api";
import { AutomaticAnalysis } from "./automatic-analysis";

vi.mock("@/ui/decisions/decisions-api", () => ({ proposeRecommendationDecision: vi.fn() }));

beforeEach(() => {
  vi.mocked(proposeRecommendationDecision).mockReset();
});

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
    expect(screen.getByRole("heading", { name: "Ideas to test" })).toBeInTheDocument();
    expect(screen.getByText(/Editorial interpretation · Story progression/i)).toBeInTheDocument();
    expect(screen.getByText(/58% confidence/i)).toBeInTheDocument();
    expect(screen.getByText(/What could challenge this:/i)).toHaveTextContent(
      /omitted or later material/i,
    );
    expect(screen.getByRole("heading", { name: "Your next creative choices" })).toBeInTheDocument();
    expect(screen.getByText(/never automatic creative decisions/i)).toBeInTheDocument();
    expect(screen.queryByText(/Source-backed moment:/i)).not.toBeInTheDocument();
  });

  it("promotes an edit recommendation into an open human decision", async () => {
    vi.mocked(proposeRecommendationDecision).mockResolvedValue({
      data: { id: "decision-1" } as never,
      etag: '"decision:1"',
    });
    vi.stubGlobal(
      "fetch",
      vi.fn(
        async () =>
          ({
            ok: true,
            status: 200,
            json: async () => ({
              run: { id: "run-1", version: 2, status: "COMPLETED" },
              outputs: [],
              recommendations: [
                {
                  id: "rec-1",
                  title: "Hold the reveal",
                  rationale: "The cited material supports a delayed reveal.",
                  confidence: 0.72,
                  evidenceReferenceIds: ["evidence-1"],
                },
                {
                  id: "rec-2",
                  title: "Reveal the result first",
                  rationale: "The result provides immediate visual orientation.",
                  confidence: 0.66,
                  evidenceReferenceIds: ["evidence-2"],
                },
              ],
            }),
          }) as Response,
      ),
    );
    const user = userEvent.setup();
    render(<AutomaticAnalysis projectId="proj_1" />);

    await screen.findByRole("heading", { name: "Hold the reveal" });
    await user.click(screen.getAllByRole("button", { name: "Make this a decision" })[0]!);

    expect(proposeRecommendationDecision).toHaveBeenCalledWith(
      expect.objectContaining({
        projectId: "proj_1",
        context: {
          originStage: "EDIT",
          artifactKind: "EDIT_RECOMMENDATION",
          artifactId: "rec-1",
          artifactVersion: 2,
        },
        recommendation: expect.objectContaining({
          confidence: 0.72,
          evidence: [expect.objectContaining({ evidenceReferenceId: "evidence-1" })],
        }),
        alternatives: [expect.objectContaining({ label: "Reveal the result first" })],
      }),
    );
    expect(await screen.findByRole("link", { name: "Review this decision" })).toHaveAttribute(
      "href",
      "/projects/proj_1/decisions/decision-1",
    );
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

  it("opens the exact transcript excerpt with neighboring source context", async () => {
    const fetchMock = vi.fn(async (input: RequestInfo | URL) => {
      if (String(input).includes("/evidence/")) {
        return {
          ok: true,
          status: 200,
          json: async () => ({
            id: "evidence-1",
            kind: "TRANSCRIPT_SEGMENT",
            source: { id: "media-1", name: "interview.vtt", mediaType: "text/vtt" },
            transcript: {
              title: "Interview",
              segmentId: "segment-1",
              speaker: "Director",
              text: "This is the exact cited sentence.",
              startMs: 1_000,
              endMs: 2_500,
              contextBefore: "The thought begins here.",
              contextAfter: "The thought resolves here.",
            },
            limitation: null,
          }),
        } as Response;
      }
      return {
        ok: true,
        status: 200,
        json: async () => ({
          run: { id: "run-1", version: 1, status: "COMPLETED" },
          outputs: [
            {
              id: "out-1",
              kind: "OBSERVATION",
              content: "Source-backed moment: This is the exact cited sentence.",
              confidence: 1,
              evidenceReferenceIds: ["evidence-1"],
            },
          ],
          recommendations: [],
        }),
      } as Response;
    });
    vi.stubGlobal("fetch", fetchMock);
    const user = userEvent.setup();
    render(<AutomaticAnalysis projectId="proj_1" />);
    await user.click(await screen.findByRole("button", { name: "Inspect source 1" }));

    expect(await screen.findByRole("complementary", { name: "Source evidence" })).toHaveTextContent(
      "Director: This is the exact cited sentence.",
    );
    expect(screen.getByText(/thought begins here/i)).toBeInTheDocument();
    expect(screen.getByText(/0:01\.0–0:02\.5/)).toBeInTheDocument();
  });

  it("renders the exact retained sampled frame instead of a timestamp-only citation", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async (input: RequestInfo | URL) => {
        if (String(input).includes("/evidence/")) {
          return {
            ok: true,
            status: 200,
            json: async () => ({
              id: "media-evidence",
              kind: "MEDIA_ASSET",
              source: { id: "media-1", name: "clip.mp4", mediaType: "video/mp4" },
              transcript: null,
              frame: {
                index: 0,
                timestampMs: 500,
                contentType: "image/jpeg",
                byteSize: 42,
                url: "/api/v1/projects/proj_video/evidence/media-evidence/frame",
              },
              limitation: null,
            }),
          } as Response;
        }
        return {
          ok: true,
          status: 200,
          json: async () => ({
            run: { id: "run-video", version: 1, status: "COMPLETED" },
            outputs: [
              {
                id: "out-1",
                kind: "OBSERVATION",
                content: "[OBSERVED @ 00:00.5] The actor crosses the doorway.",
                confidence: 0.9,
                evidenceReferenceIds: ["media-evidence"],
              },
            ],
            recommendations: [],
          }),
        } as Response;
      }),
    );
    const user = userEvent.setup();
    render(<AutomaticAnalysis projectId="proj_video" />);
    await user.click(await screen.findByRole("button", { name: "Inspect source 1" }));
    expect(
      await screen.findByRole("img", { name: /exact sampled frame at 0:00\.5/i }),
    ).toHaveAttribute("src", "/api/v1/projects/proj_video/evidence/media-evidence/frame");
    expect(screen.getByText(/Exact sampled frame · 0:00\.5/)).toBeInTheDocument();
  });
});
