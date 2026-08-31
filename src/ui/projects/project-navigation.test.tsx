import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { ProjectNavigation } from "./project-navigation";
import { getProject, renameProject, updateProjectLifecycle } from "@/ui/auth/api-client";

const { replaceMock, routerMock, navigation } = vi.hoisted(() => {
  const replaceMock = vi.fn();
  return {
    replaceMock,
    routerMock: { replace: replaceMock },
    navigation: { pathname: "/projects/proj_1/storyboard" },
  };
});

vi.mock("next/navigation", () => ({
  usePathname: () => navigation.pathname,
  useRouter: () => routerMock,
}));
vi.mock("@/ui/auth/api-client", () => ({
  getProject: vi.fn(),
  renameProject: vi.fn(),
  updateProjectLifecycle: vi.fn(),
  errorStatus: (error: { status?: number }) => error.status,
  friendlyError: (error: { message?: string }) => error.message ?? "error",
}));

beforeEach(() => {
  navigation.pathname = "/projects/proj_1/storyboard";
  replaceMock.mockReset();
  vi.mocked(getProject).mockReset();
  vi.mocked(getProject).mockResolvedValue({
    id: "proj_1",
    name: "Harbor Light",
    status: "DRAFT",
    createdAt: "",
    updatedAt: "",
    concurrencyToken: '"project:1"',
  });
  vi.mocked(renameProject).mockReset();
  vi.mocked(updateProjectLifecycle).mockReset();
});

describe("ProjectNavigation", () => {
  it("makes the five project destinations and locations discoverable", async () => {
    render(<ProjectNavigation projectId="proj_1" />);

    expect(await screen.findByRole("heading", { name: "Harbor Light" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Idea" })).toHaveAttribute("href", "/projects/proj_1");
    expect(screen.getByRole("link", { name: "Plan shots" })).toHaveAttribute(
      "aria-current",
      "page",
    );
    expect(screen.getByRole("link", { name: "Footage & notes" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Choices" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Review" })).toHaveAttribute(
      "href",
      "/projects/proj_1/review",
    );
    expect(screen.getByRole("link", { name: "Rooms" })).toHaveAttribute("href", "/locations");
  });

  it("renames the project with the loaded concurrency token", async () => {
    const user = userEvent.setup();
    vi.mocked(renameProject).mockResolvedValue({
      id: "proj_1",
      name: "Harbor at Dawn",
      status: "DRAFT",
      createdAt: "",
      updatedAt: "",
      concurrencyToken: '"project:2"',
    });
    render(<ProjectNavigation projectId="proj_1" />);

    await screen.findByRole("heading", { name: "Harbor Light" });
    await user.click(screen.getByText("Project settings"));
    const input = screen.getByLabelText("Working title");
    await user.clear(input);
    await user.type(input, "Harbor at Dawn");
    await user.click(screen.getByRole("button", { name: "Save title" }));

    await waitFor(() =>
      expect(renameProject).toHaveBeenCalledWith("proj_1", "Harbor at Dawn", '"project:1"'),
    );
    expect(await screen.findByRole("heading", { name: "Harbor at Dawn" })).toBeInTheDocument();
  });

  it("explains a stale rename without losing the edited title", async () => {
    const user = userEvent.setup();
    vi.mocked(renameProject).mockRejectedValue({ status: 409 });
    render(<ProjectNavigation projectId="proj_1" />);

    await screen.findByRole("heading", { name: "Harbor Light" });
    await user.click(screen.getByText("Project settings"));
    const input = screen.getByLabelText("Working title");
    await user.clear(input);
    await user.type(input, "Conflicting title");
    await user.click(screen.getByRole("button", { name: "Save title" }));

    expect(await screen.findByRole("alert")).toHaveTextContent(/changed elsewhere/i);
    expect(input).toHaveValue("Conflicting title");
  });

  it("moves a draft into progress using the same concurrency chain", async () => {
    const user = userEvent.setup();
    vi.mocked(updateProjectLifecycle).mockResolvedValue({
      id: "proj_1",
      name: "Harbor Light",
      status: "ACTIVE",
      createdAt: "",
      updatedAt: "",
      concurrencyToken: '"project:2"',
    });
    render(<ProjectNavigation projectId="proj_1" />);

    await screen.findByRole("heading", { name: "Harbor Light" });
    await user.click(screen.getByText("Project settings"));
    await user.click(screen.getByRole("button", { name: "Start project" }));

    await waitFor(() =>
      expect(updateProjectLifecycle).toHaveBeenCalledWith("proj_1", "activate", '"project:1"'),
    );
    expect(await screen.findByText(/in progress · continue making/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Mark complete" })).toBeInTheDocument();
  });

  it("retries a temporary project-detail failure in place", async () => {
    const user = userEvent.setup();
    vi.mocked(getProject)
      .mockReset()
      .mockRejectedValueOnce({ status: 503, message: "Temporarily unavailable." })
      .mockResolvedValueOnce({
        id: "proj_1",
        name: "Harbor Light",
        status: "DRAFT",
        createdAt: "",
        updatedAt: "",
        concurrencyToken: '"project:1"',
      });
    render(<ProjectNavigation projectId="proj_1" />);

    expect(await screen.findByRole("alert")).toHaveTextContent(/temporarily unavailable/i);
    await user.click(screen.getByRole("button", { name: "Reload project" }));

    expect(await screen.findByRole("heading", { name: "Harbor Light" })).toBeInTheDocument();
    expect(getProject).toHaveBeenCalledTimes(2);
  });

  it("offers a safe exit when the project is missing", async () => {
    vi.mocked(getProject).mockReset().mockRejectedValue({ status: 404 });
    render(<ProjectNavigation projectId="proj_missing" />);

    expect(await screen.findByRole("alert")).toHaveTextContent(/doesn’t exist or isn’t yours/i);
    expect(screen.getByRole("link", { name: "Back to projects" })).toHaveAttribute(
      "href",
      "/projects",
    );
  });
});
