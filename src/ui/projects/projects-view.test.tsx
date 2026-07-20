import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { ProjectsView } from "./projects-view";
import { createProject, listProjects } from "@/ui/auth/api-client";

const { replaceMock, routerMock } = vi.hoisted(() => {
  const replaceMock = vi.fn();
  return {
    replaceMock,
    routerMock: { replace: replaceMock, push: vi.fn(), prefetch: vi.fn(), refresh: vi.fn() },
  };
});
vi.mock("next/navigation", () => ({ useRouter: () => routerMock }));
vi.mock("@/ui/auth/api-client", () => ({
  listProjects: vi.fn(),
  createProject: vi.fn(),
  errorStatus: (err: { status?: number }) => err?.status,
  friendlyError: (err: { message?: string }) => err?.message ?? "error",
}));

function project(id: string, name: string) {
  return { id, name, status: "DRAFT", createdAt: "", updatedAt: "" };
}

beforeEach(() => {
  replaceMock.mockReset();
  vi.mocked(listProjects).mockReset();
  vi.mocked(createProject).mockReset();
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
    expect(await screen.findByText(/no projects yet/i)).toBeInTheDocument();
  });

  it("creates a project and reflects it in the reloaded list", async () => {
    const user = userEvent.setup();
    vi.mocked(listProjects)
      .mockResolvedValueOnce([]) // initial load
      .mockResolvedValueOnce([project("proj_9", "New Reel")]); // after create
    vi.mocked(createProject).mockResolvedValue(project("proj_9", "New Reel"));
    render(<ProjectsView />);

    await screen.findByText(/no projects yet/i);
    await user.type(screen.getByLabelText(/project name/i), "New Reel");
    await user.click(screen.getByRole("button", { name: /create project/i }));

    await waitFor(() => expect(createProject).toHaveBeenCalledWith("New Reel"));
    expect(await screen.findByText("New Reel")).toBeInTheDocument();
  });

  it("surfaces a create error without crashing", async () => {
    const user = userEvent.setup();
    vi.mocked(listProjects).mockResolvedValue([]);
    vi.mocked(createProject).mockRejectedValue({ status: 422, message: "Name is invalid." });
    render(<ProjectsView />);

    await screen.findByText(/no projects yet/i);
    await user.type(screen.getByLabelText(/project name/i), "bad");
    await user.click(screen.getByRole("button", { name: /create project/i }));

    expect(await screen.findByRole("alert")).toHaveTextContent(/invalid/i);
  });
});
