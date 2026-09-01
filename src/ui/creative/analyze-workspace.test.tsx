import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { AnalyzeWorkspace } from "./analyze-workspace";
import { analyzeProject, getAnalysis, getCreativeIntent, getIntentHistory } from "./creative-api";
import { getProject } from "@/ui/auth/api-client";
import { proposeRecommendationDecision } from "@/ui/decisions/decisions-api";
import { creativeAnalysisFixture } from "./creative-test-fixtures";

const { replaceMock, routerMock } = vi.hoisted(() => {
  const replaceMock = vi.fn();
  return {
    replaceMock,
    routerMock: { replace: replaceMock, push: vi.fn(), prefetch: vi.fn(), refresh: vi.fn() },
  };
});
vi.mock("next/navigation", () => ({ useRouter: () => routerMock }));
vi.mock("./creative-api", () => ({
  getAnalysis: vi.fn(),
  getIntentHistory: vi.fn(),
  getCreativeIntent: vi.fn(),
  analyzeProject: vi.fn(),
}));
vi.mock("@/ui/decisions/decisions-api", () => ({ proposeRecommendationDecision: vi.fn() }));
vi.mock("@/ui/auth/api-client", () => ({
  errorStatus: (err: { status?: number }) => err?.status,
  friendlyError: (err: { message?: string }) => err?.message ?? "error",
  getProject: vi.fn(),
}));

beforeEach(() => {
  replaceMock.mockReset();
  vi.mocked(getAnalysis).mockReset();
  vi.mocked(analyzeProject).mockReset();
  vi.mocked(getIntentHistory).mockReset();
  vi.mocked(getCreativeIntent).mockReset();
  vi.mocked(getProject).mockReset();
  vi.mocked(getProject).mockResolvedValue({
    id: "proj_1",
    name: "Faithful — music video",
    status: "ACTIVE",
    createdAt: "2026-09-01T00:00:00.000Z",
    updatedAt: "2026-09-01T00:00:00.000Z",
  });
  vi.mocked(getCreativeIntent).mockRejectedValue({ status: 404 });
  vi.mocked(getIntentHistory).mockResolvedValue([]);
  vi.mocked(proposeRecommendationDecision).mockReset();
  routerMock.push.mockReset();
});

describe("AnalyzeWorkspace", () => {
  it("shows the form when the project has not been analyzed (404)", async () => {
    vi.mocked(getAnalysis).mockRejectedValue({ status: 404 });
    render(<AnalyzeWorkspace projectId="proj_1" />);
    expect(await screen.findByRole("form", { name: /start a video/i })).toBeInTheDocument();
  });

  it("keeps optional project details out of the first decision", async () => {
    const user = userEvent.setup();
    vi.mocked(getAnalysis).mockRejectedValue({ status: 404 });
    render(<AnalyzeWorkspace projectId="proj_1" />);

    expect(await screen.findByRole("button", { name: /add format details/i })).toBeInTheDocument();
    expect(screen.queryByLabelText("Project type")).not.toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: /add format details/i }));
    expect(screen.getByLabelText("Project type")).toBeInTheDocument();
  });

  it("shows the existing blueprint immediately when already analyzed", async () => {
    vi.mocked(getAnalysis).mockResolvedValue(creativeAnalysisFixture());
    render(<AnalyzeWorkspace projectId="proj_1" />);
    expect(
      await screen.findByRole("heading", {
        level: 1,
        name: "Morning routine of an everyday mom who eats Jimmy's Famous Meals",
      }),
    ).toBeInTheDocument();
  });

  it("analyzes from the form and shows the blueprint", async () => {
    vi.mocked(getAnalysis).mockRejectedValue({ status: 404 });
    vi.mocked(analyzeProject).mockResolvedValue(creativeAnalysisFixture());
    const user = userEvent.setup();
    render(<AnalyzeWorkspace projectId="proj_1" />);

    await screen.findByRole("form", { name: /start a video/i });
    await user.type(
      screen.getByLabelText("Describe the video"),
      "A mother and baby move through a truthful morning ritual built around the first quiet bite.",
    );
    await user.click(screen.getByRole("button", { name: /make my plan/i }));

    await waitFor(() => expect(analyzeProject).toHaveBeenCalledWith("proj_1", expect.any(Object)));
    expect(
      await screen.findByRole("heading", {
        level: 1,
        name: "Morning routine of an everyday mom who eats Jimmy's Famous Meals",
      }),
    ).toBeInTheDocument();
  });

  it("restores a saved in-progress brief after reload instead of presenting an empty form", async () => {
    vi.mocked(getAnalysis).mockRejectedValue({ status: 404 });
    const saved = creativeAnalysisFixture().brief;
    vi.mocked(getCreativeIntent).mockResolvedValue({
      ...saved,
      context: "A detailed music-video treatment that must survive a provider delay.",
      developmentStatus: "PROCESSING",
      developmentStartedAt: new Date().toISOString(),
    });
    render(<AnalyzeWorkspace projectId="proj_1" />);

    expect(await screen.findByText("Building your film plan")).toBeInTheDocument();
    expect(screen.getByText("Brief saved")).toBeInTheDocument();
    expect(screen.queryByRole("form", { name: /start a video/i })).not.toBeInTheDocument();
  });

  it("creates a traceable open choice from the recommended direction", async () => {
    vi.mocked(getAnalysis).mockResolvedValue(creativeAnalysisFixture());
    vi.mocked(proposeRecommendationDecision).mockResolvedValue({
      data: { id: "dec_direction" },
      etag: '"decision:1"',
    } as never);
    const user = userEvent.setup();
    render(<AnalyzeWorkspace projectId="proj_1" />);

    await user.click(await screen.findByRole("button", { name: /turn this into a choice/i }));

    await waitFor(() =>
      expect(proposeRecommendationDecision).toHaveBeenCalledWith(
        expect.objectContaining({
          projectId: "proj_1",
          question: expect.stringContaining("Which creative direction"),
          context: expect.objectContaining({
            originStage: "DEVELOP",
            artifactKind: "CREATIVE_DIRECTION",
          }),
          recommendation: expect.objectContaining({
            label: "The first quiet bite",
            confidence: 0.78,
            evidence: expect.arrayContaining([
              expect.objectContaining({ sourceLabel: "Audience and emotional job" }),
            ]),
          }),
          alternatives: expect.any(Array),
        }),
      ),
    );
    expect(routerMock.push).toHaveBeenCalledWith("/projects/proj_1/decisions/dec_direction");
  });
});
