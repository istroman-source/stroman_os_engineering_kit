import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { ProjectWorkspace } from "./project-workspace";
import { getProject } from "@/ui/auth/api-client";
import { listDecisions, proposeDecision } from "@/ui/decisions/decisions-api";

const { routerMock } = vi.hoisted(() => ({
  routerMock: { replace: vi.fn(), push: vi.fn(), prefetch: vi.fn(), refresh: vi.fn() },
}));
vi.mock("next/navigation", () => ({ useRouter: () => routerMock }));
vi.mock("@/ui/auth/api-client", () => ({
  getProject: vi.fn(),
  errorStatus: (err: { status?: number }) => err?.status,
  friendlyError: (err: { message?: string }) => err?.message ?? "error",
}));
vi.mock("@/ui/decisions/decisions-api", () => ({
  listDecisions: vi.fn(),
  proposeDecision: vi.fn(),
}));

const project = {
  id: "proj_1",
  name: "Signature Reel",
  status: "DRAFT",
  createdAt: "",
  updatedAt: "",
};

function decision(id: string, question: string) {
  return {
    id,
    projectId: "proj_1",
    question,
    options: [
      { id: "opt-1", label: "A", rationale: null },
      { id: "opt-2", label: "B", rationale: null },
    ],
    advisory: null,
    status: "PROPOSED" as const,
    selectedOptionId: null,
    decidedBy: null,
    decisionRationale: null,
    createdAt: "",
    decidedAt: null,
    concurrencyToken: '"decision:1"',
  };
}

beforeEach(() => {
  vi.mocked(getProject).mockReset();
  vi.mocked(listDecisions).mockReset();
  vi.mocked(proposeDecision).mockReset();
});

describe("ProjectWorkspace", () => {
  it("shows the project header and an empty decision feed", async () => {
    vi.mocked(getProject).mockResolvedValue(project);
    vi.mocked(listDecisions).mockResolvedValue([]);
    render(<ProjectWorkspace projectId="proj_1" />);

    expect(await screen.findByRole("heading", { name: "Signature Reel" })).toBeInTheDocument();
    expect(screen.getByText(/no decisions yet/i)).toBeInTheDocument();
  });

  it("lists existing decisions in the feed", async () => {
    vi.mocked(getProject).mockResolvedValue(project);
    vi.mocked(listDecisions).mockResolvedValue([decision("dec_1", "Which opening?")]);
    render(<ProjectWorkspace projectId="proj_1" />);
    expect(await screen.findByText("Which opening?")).toBeInTheDocument();
  });

  it("frames a new decision and prepends it to the feed", async () => {
    vi.mocked(getProject).mockResolvedValue(project);
    vi.mocked(listDecisions).mockResolvedValue([]);
    vi.mocked(proposeDecision).mockResolvedValue({
      data: decision("dec_9", "Which thumbnail?") as never,
      etag: '"decision:1"',
    });
    const user = userEvent.setup();
    render(<ProjectWorkspace projectId="proj_1" />);

    await screen.findByRole("heading", { name: "Signature Reel" });
    await user.type(screen.getByLabelText(/decision question/i), "Which thumbnail?");
    await user.type(screen.getByLabelText("Option 1"), "Dish");
    await user.type(screen.getByLabelText("Option 2"), "Chef");
    await user.click(screen.getByRole("button", { name: /frame decision/i }));

    await waitFor(() => expect(proposeDecision).toHaveBeenCalled());
    expect(await screen.findByText("Which thumbnail?")).toBeInTheDocument();
  });
});
