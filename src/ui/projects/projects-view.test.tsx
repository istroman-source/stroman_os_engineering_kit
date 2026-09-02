import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { ProjectsView } from "./projects-view";
import { createProject, listProjects } from "@/ui/auth/api-client";
import { getCreativeIntent } from "@/ui/creative/creative-api";

const { pushMock, replaceMock, routerMock } = vi.hoisted(() => {
  const replaceMock = vi.fn();
  const pushMock = vi.fn();
  return {
    pushMock,
    replaceMock,
    routerMock: { replace: replaceMock, push: pushMock, prefetch: vi.fn(), refresh: vi.fn() },
  };
});
vi.mock("next/navigation", () => ({ useRouter: () => routerMock }));
vi.mock("@/ui/auth/api-client", () => ({
  listProjects: vi.fn(),
  createProject: vi.fn(),
  errorStatus: (err: { status?: number }) => err?.status,
  friendlyError: (err: { message?: string }) => err?.message ?? "error",
}));
vi.mock("@/ui/creative/creative-api", () => ({ getCreativeIntent: vi.fn() }));

function project(id: string, name: string) {
  return { id, name, status: "DRAFT", createdAt: "", updatedAt: "" };
}

beforeEach(() => {
  replaceMock.mockReset();
  pushMock.mockReset();
  vi.mocked(listProjects).mockReset();
  vi.mocked(createProject).mockReset();
  vi.mocked(getCreativeIntent).mockReset();
  vi.mocked(getCreativeIntent).mockRejectedValue({ status: 404 });
});

describe("ProjectsView", () => {
  it("renders the owner's projects", async () => {
    vi.mocked(listProjects).mockResolvedValue([project("proj_1", "Signature Reel")]);
    render(<ProjectsView />);
    expect(await screen.findByText("Signature Reel")).toBeInTheDocument();
  });

  it("shows an empty state when there are no projects", async () => {
    vi.mocked(listProjects).mockResolvedValue([]);
    render(<ProjectsView />);
    expect(await screen.findByText(/your films will appear here/i)).toBeInTheDocument();
  });

  it("creates a project and moves directly into its story workspace", async () => {
    const user = userEvent.setup();
    vi.mocked(listProjects).mockResolvedValue([]);
    vi.mocked(createProject).mockResolvedValue(project("proj_9", "New Reel"));
    render(<ProjectsView />);

    await screen.findByText(/your films will appear here/i);
    await user.type(screen.getByLabelText(/project working title/i), "New Reel");
    await user.click(screen.getByRole("button", { name: /start a film/i }));

    await waitFor(() => expect(createProject).toHaveBeenCalledWith("New Reel"));
    expect(pushMock).toHaveBeenCalledWith("/projects/proj_9/brief");
    expect(listProjects).toHaveBeenCalledTimes(1);
  });

  it("surfaces a create error without crashing", async () => {
    const user = userEvent.setup();
    vi.mocked(listProjects).mockResolvedValue([]);
    vi.mocked(createProject).mockRejectedValue({ status: 422, message: "Name is invalid." });
    render(<ProjectsView />);

    await screen.findByText(/your films will appear here/i);
    await user.type(screen.getByLabelText(/project working title/i), "bad");
    await user.click(screen.getByRole("button", { name: /start a film/i }));

    expect(await screen.findByRole("alert")).toHaveTextContent(/invalid/i);
  });

  it("recovers from a temporary project-list failure without reloading the app", async () => {
    const user = userEvent.setup();
    vi.mocked(listProjects)
      .mockRejectedValueOnce({ status: 503, message: "Temporarily unavailable." })
      .mockResolvedValueOnce([project("proj_2", "Recovered project")]);
    render(<ProjectsView />);

    expect(await screen.findByRole("alert")).toHaveTextContent(/temporarily unavailable/i);
    await user.click(screen.getByRole("button", { name: "Reload projects" }));

    expect(await screen.findByText("Recovered project")).toBeInTheDocument();
    expect(listProjects).toHaveBeenCalledTimes(2);
  });

  it("shows the project type, filmmaking stage, next action, and one direct Continue route", async () => {
    vi.mocked(listProjects).mockResolvedValue([project("proj_1", "Harbor Light")]);
    vi.mocked(getCreativeIntent).mockResolvedValue({
      projectType: "Commercial",
      developmentStatus: "READY",
      planningContext: { stage: "PRE_PRODUCTION" },
    } as never);
    render(<ProjectsView />);

    expect(await screen.findByText("Commercial")).toBeInTheDocument();
    expect(screen.getByText("SHOT PLANNING")).toBeInTheDocument();
    expect(screen.getByText(/review the suggested shots/i)).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Continue Harbor Light" })).toHaveAttribute(
      "href",
      "/projects/proj_1/storyboard",
    );
    expect(screen.queryByText(/open workspace/i)).not.toBeInTheDocument();
  });

  it("sends an unbriefed film directly to the first development step", async () => {
    vi.mocked(listProjects).mockResolvedValue([project("proj_2", "Faithful")]);
    render(<ProjectsView />);

    expect(
      await screen.findByText(/tell Stroman what you want this film to become/i),
    ).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Continue Faithful" })).toHaveAttribute(
      "href",
      "/projects/proj_2/brief",
    );
  });
});
