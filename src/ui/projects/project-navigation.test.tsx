import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { ProjectNavigation } from "./project-navigation";
import { getProject } from "@/ui/auth/api-client";

const { replaceMock, navigation } = vi.hoisted(() => ({
  replaceMock: vi.fn(),
  navigation: { pathname: "/projects/proj_1/storyboard" },
}));

vi.mock("next/navigation", () => ({
  usePathname: () => navigation.pathname,
  useRouter: () => ({ replace: replaceMock }),
}));
vi.mock("@/ui/auth/api-client", () => ({
  getProject: vi.fn(),
  errorStatus: (error: { status?: number }) => error.status,
  friendlyError: (error: { message?: string }) => error.message ?? "error",
}));

beforeEach(() => {
  navigation.pathname = "/projects/proj_1/storyboard";
  replaceMock.mockReset();
  vi.mocked(getProject).mockResolvedValue({
    id: "proj_1",
    name: "Harbor Light",
    status: "DRAFT",
    createdAt: "",
    updatedAt: "",
  });
});

describe("ProjectNavigation", () => {
  it("makes the four project destinations and locations discoverable", async () => {
    render(<ProjectNavigation projectId="proj_1" />);

    expect(await screen.findByRole("heading", { name: "Harbor Light" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Idea" })).toHaveAttribute("href", "/projects/proj_1");
    expect(screen.getByRole("link", { name: "Plan shots" })).toHaveAttribute(
      "aria-current",
      "page",
    );
    expect(screen.getByRole("link", { name: "Footage & notes" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Choices" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Rooms" })).toHaveAttribute("href", "/locations");
  });
});
