import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { AnalyzeWorkspace } from "./analyze-workspace";
import { analyzeProject, getAnalysis } from "./creative-api";
import { creativeAnalysisFixture } from "./creative-test-fixtures";

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

beforeEach(() => {
  replaceMock.mockReset();
  vi.mocked(getAnalysis).mockReset();
  vi.mocked(analyzeProject).mockReset();
});

describe("AnalyzeWorkspace", () => {
  it("shows the form when the project has not been analyzed (404)", async () => {
    vi.mocked(getAnalysis).mockRejectedValue({ status: 404 });
    render(<AnalyzeWorkspace projectId="proj_1" />);
    expect(await screen.findByRole("form", { name: /develop idea/i })).toBeInTheDocument();
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

    await screen.findByRole("form", { name: /develop idea/i });
    await user.type(
      screen.getByLabelText("Video concept"),
      "Morning routine of an everyday mom who eats Jimmy's Famous Meals",
    );
    await user.click(screen.getByRole("button", { name: /develop creative direction/i }));

    await waitFor(() => expect(analyzeProject).toHaveBeenCalledWith("proj_1", expect.any(Object)));
    expect(
      await screen.findByRole("heading", {
        level: 1,
        name: "Morning routine of an everyday mom who eats Jimmy's Famous Meals",
      }),
    ).toBeInTheDocument();
  });
});
