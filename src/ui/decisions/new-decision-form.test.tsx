import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { NewDecisionForm } from "./new-decision-form";
import { proposeDecision } from "./decisions-api";

vi.mock("./decisions-api", () => ({ proposeDecision: vi.fn() }));
vi.mock("@/ui/auth/api-client", () => ({
  errorStatus: (err: { status?: number }) => err?.status,
  friendlyError: (err: { message?: string }) => err?.message ?? "error",
}));

const decision = { id: "dec_1", question: "Q", options: [], status: "PROPOSED" };

beforeEach(() => vi.mocked(proposeDecision).mockReset());

describe("NewDecisionForm", () => {
  it("requires a question and at least two options", async () => {
    const user = userEvent.setup();
    render(<NewDecisionForm projectId="proj_1" onCreated={vi.fn()} onUnauthorized={vi.fn()} />);

    await user.type(screen.getByLabelText(/decision question/i), "Which opening?");
    await user.type(screen.getByLabelText("Option 1"), "Cold open");
    // Only one option filled → invalid.
    await user.click(screen.getByRole("button", { name: /frame decision/i }));

    expect(await screen.findByRole("alert")).toHaveTextContent(/at least two options/i);
    expect(proposeDecision).not.toHaveBeenCalled();
  });

  it("proposes a decision with generated option ids and reports it", async () => {
    const user = userEvent.setup();
    const onCreated = vi.fn();
    vi.mocked(proposeDecision).mockResolvedValue({ data: decision as never, etag: '"decision:1"' });
    render(<NewDecisionForm projectId="proj_1" onCreated={onCreated} onUnauthorized={vi.fn()} />);

    await user.type(screen.getByLabelText(/decision question/i), "Which opening?");
    await user.type(screen.getByLabelText("Option 1"), "Cold open");
    await user.type(screen.getByLabelText("Option 2"), "Interview");
    await user.click(screen.getByRole("button", { name: /frame decision/i }));

    await waitFor(() =>
      expect(proposeDecision).toHaveBeenCalledWith({
        projectId: "proj_1",
        question: "Which opening?",
        options: [
          { id: "opt-1", label: "Cold open" },
          { id: "opt-2", label: "Interview" },
        ],
      }),
    );
    expect(onCreated).toHaveBeenCalledWith(decision);
  });
});
