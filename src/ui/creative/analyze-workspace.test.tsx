import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { AnalyzeWorkspace } from "./analyze-workspace";
import { analyzeProject, getAnalysis, type Analysis } from "./creative-api";

const { replaceMock, routerMock } = vi.hoisted(() => {
  const replaceMock = vi.fn();
  return {
    replaceMock,
    routerMock: { replace: replaceMock, push: vi.fn(), prefetch: vi.fn(), refresh: vi.fn() },
  };
});
vi.mock("next/navigation", () => ({ useRouter: () => routerMock }));
vi.mock("./creative-api", () => ({ getAnalysis: vi.fn(), analyzeProject: vi.fn() }));
vi.mock("@/ui/auth/api-client", () => ({
  errorStatus: (err: { status?: number }) => err?.status,
  friendlyError: (err: { message?: string }) => err?.message ?? "error",
}));

function analysis(): Analysis {
  return {
    brief: {
      id: "brief_1",
      projectId: "proj_1",
      title: "Signature Dish Reel",
      client: "Jimmy's",
      projectType: "Instagram reel",
      creativeGoal: "crave the crab cake",
      targetAudience: "Baltimore foodies",
      desiredEmotion: "hungry",
      context: "20s vertical",
      createdAt: "",
      updatedAt: "",
    },
    blueprint: {
      projectSummary: "Summary",
      storyObjective: "Objective",
      audienceAnalysis: "Audience",
      emotionalArc: ["a", "b", "c"],
      recommendedStructure: "Hook-led",
      hookConcepts: [
        { title: "h1", description: "d" },
        { title: "h2", description: "d" },
        { title: "h3", description: "d" },
      ],
      editingBlueprint: ["cut"],
      interviewStrategy: null,
      brollPriorities: ["b-roll"],
      risks: ["risk"],
      masterPrompt: "prompt",
    },
  };
}

beforeEach(() => {
  replaceMock.mockReset();
  vi.mocked(getAnalysis).mockReset();
  vi.mocked(analyzeProject).mockReset();
});

describe("AnalyzeWorkspace", () => {
  it("shows the form when the project has not been analyzed (404)", async () => {
    vi.mocked(getAnalysis).mockRejectedValue({ status: 404 });
    render(<AnalyzeWorkspace projectId="proj_1" />);
    expect(await screen.findByRole("form", { name: /describe video/i })).toBeInTheDocument();
  });

  it("shows the existing blueprint immediately when already analyzed", async () => {
    vi.mocked(getAnalysis).mockResolvedValue(analysis());
    render(<AnalyzeWorkspace projectId="proj_1" />);
    expect(
      await screen.findByRole("heading", { level: 1, name: "Signature Dish Reel" }),
    ).toBeInTheDocument();
  });

  it("analyzes from the form and shows the blueprint", async () => {
    vi.mocked(getAnalysis).mockRejectedValue({ status: 404 });
    vi.mocked(analyzeProject).mockResolvedValue(analysis());
    const user = userEvent.setup();
    render(<AnalyzeWorkspace projectId="proj_1" />);

    await screen.findByRole("form", { name: /describe video/i });
    await user.type(screen.getByLabelText("Video concept"), "Signature Dish Reel");
    await user.type(screen.getByLabelText("Client"), "Jimmy's");
    await user.type(screen.getByLabelText("Project type"), "Instagram reel");
    await user.type(screen.getByLabelText("Creative intent"), "crave the crab cake");
    await user.type(screen.getByLabelText("Target audience"), "Baltimore foodies");
    await user.type(screen.getByLabelText("Desired emotion"), "hungry");
    await user.type(screen.getByLabelText("Source material and constraints"), "20s vertical");
    await user.click(screen.getByRole("button", { name: /build story plan/i }));

    await waitFor(() => expect(analyzeProject).toHaveBeenCalledWith("proj_1", expect.any(Object)));
    expect(
      await screen.findByRole("heading", { level: 1, name: "Signature Dish Reel" }),
    ).toBeInTheDocument();
  });
});
