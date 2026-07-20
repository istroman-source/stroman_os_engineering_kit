import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { DecisionDetail } from "./decision-detail";
import { attachAdvisory, getDecision, recordHumanDecision } from "./decisions-api";

const { replaceMock, routerMock } = vi.hoisted(() => {
  const replaceMock = vi.fn();
  return {
    replaceMock,
    routerMock: { replace: replaceMock, push: vi.fn(), prefetch: vi.fn(), refresh: vi.fn() },
  };
});
vi.mock("next/navigation", () => ({ useRouter: () => routerMock }));
vi.mock("./decisions-api", () => ({
  getDecision: vi.fn(),
  attachAdvisory: vi.fn(),
  recordHumanDecision: vi.fn(),
}));
vi.mock("@/ui/auth/api-client", () => ({
  errorStatus: (err: { status?: number }) => err?.status,
  friendlyError: (err: { message?: string }) => err?.message ?? "error",
}));

const base = {
  id: "dec_1",
  projectId: "proj_1",
  question: "Which opening shot?",
  options: [
    { id: "opt-1", label: "Cold open", rationale: null },
    { id: "opt-2", label: "Interview open", rationale: null },
  ],
  advisory: null as null | {
    recommendedOptionId: string | null;
    rationale: string;
    confidence: number;
    evidence: Array<{ sourceLabel: string; observation: string; relevance: string }>;
  },
  status: "PROPOSED" as "PROPOSED" | "DECIDED",
  selectedOptionId: null as string | null,
  decidedBy: null as string | null,
  decisionRationale: null as string | null,
  createdAt: "2026-07-19T00:00:00.000Z",
  decidedAt: null as string | null,
};

beforeEach(() => {
  replaceMock.mockReset();
  vi.mocked(getDecision).mockReset();
  vi.mocked(recordHumanDecision).mockReset();
  vi.mocked(attachAdvisory).mockReset();
});

describe("DecisionDetail", () => {
  it("shows the question, options, and the decision forms while PROPOSED", async () => {
    vi.mocked(getDecision).mockResolvedValue({ data: base, etag: '"decision:1"' });
    render(<DecisionDetail projectId="proj_1" decisionId="dec_1" />);

    expect(await screen.findByText("Which opening shot?")).toBeInTheDocument();
    expect(
      within(screen.getByRole("list", { name: "Options" })).getByText("Cold open"),
    ).toBeInTheDocument();
    expect(screen.getByRole("form", { name: /attach ai advisory/i })).toBeInTheDocument();
    expect(screen.getByRole("form", { name: /record decision/i })).toBeInTheDocument();
  });

  it("renders an existing AI advisory", async () => {
    vi.mocked(getDecision).mockResolvedValue({
      data: {
        ...base,
        advisory: {
          recommendedOptionId: "opt-1",
          rationale: "Hooks faster",
          confidence: 0.9,
          evidence: [
            {
              sourceLabel: "Client brief",
              observation: "Wants a fast hook",
              relevance: "Cold open is faster",
            },
          ],
        },
      },
      etag: '"decision:1"',
    });
    render(<DecisionDetail projectId="proj_1" decisionId="dec_1" />);

    expect(await screen.findByText(/AI advisory/i)).toBeInTheDocument();
    expect(screen.getByText(/Recommends:/)).toHaveTextContent(/Cold open/);
    expect(screen.getByText(/90% confidence/i)).toBeInTheDocument();
    expect(screen.getByText(/Hooks faster/)).toBeInTheDocument();
    // Supporting evidence is shown, separately from the human decision.
    const evidence = within(screen.getByRole("list", { name: /supporting evidence/i }));
    expect(evidence.getByText("Client brief")).toBeInTheDocument();
    expect(evidence.getByText(/Wants a fast hook/)).toBeInTheDocument();
    expect(evidence.getByText(/Cold open is faster/)).toBeInTheDocument();
  });

  it("records the human decision with the current ETag and shows the result", async () => {
    vi.mocked(getDecision).mockResolvedValue({ data: base, etag: '"decision:1"' });
    vi.mocked(recordHumanDecision).mockResolvedValue({
      data: {
        ...base,
        status: "DECIDED",
        selectedOptionId: "opt-2",
        decidedBy: "usr_1",
        decisionRationale: "Sets stakes faster",
        decidedAt: "2026-07-19T01:00:00.000Z",
      },
      etag: '"decision:2"',
    });
    const user = userEvent.setup();
    render(<DecisionDetail projectId="proj_1" decisionId="dec_1" />);

    await screen.findByText("Which opening shot?");
    await user.selectOptions(screen.getByLabelText(/chosen option/i), "opt-2");
    await user.type(screen.getByLabelText(/decision rationale/i), "Sets stakes faster");
    await user.click(screen.getByRole("button", { name: /record decision/i }));

    await waitFor(() =>
      expect(recordHumanDecision).toHaveBeenCalledWith("dec_1", '"decision:1"', {
        selectedOptionId: "opt-2",
        rationale: "Sets stakes faster",
      }),
    );
    expect(await screen.findByText(/Human decision/i)).toBeInTheDocument();
    expect(screen.getByText(/chose:/i)).toHaveTextContent(/Interview open/);
  });

  it("attaches an advisory with supporting evidence via If-Match", async () => {
    vi.mocked(getDecision).mockResolvedValue({ data: base, etag: '"decision:1"' });
    vi.mocked(attachAdvisory).mockResolvedValue({
      data: {
        ...base,
        advisory: {
          recommendedOptionId: "opt-1",
          rationale: "Faster hook",
          confidence: 0.7,
          evidence: [
            { sourceLabel: "Brief", observation: "Fast hook", relevance: "Cold open wins" },
          ],
        },
      },
      etag: '"decision:2"',
    });
    const user = userEvent.setup();
    render(<DecisionDetail projectId="proj_1" decisionId="dec_1" />);

    await screen.findByText("Which opening shot?");
    await user.type(screen.getByLabelText(/advisory rationale/i), "Faster hook");
    await user.click(screen.getByRole("button", { name: /add evidence/i }));
    await user.type(screen.getByLabelText(/evidence 1 source/i), "Brief");
    await user.type(screen.getByLabelText(/evidence 1 observation/i), "Fast hook");
    await user.type(screen.getByLabelText(/evidence 1 relevance/i), "Cold open wins");
    await user.click(screen.getByRole("button", { name: /attach advisory/i }));

    await waitFor(() =>
      expect(attachAdvisory).toHaveBeenCalledWith("dec_1", '"decision:1"', {
        recommendedOptionId: null,
        rationale: "Faster hook",
        confidence: 0.7,
        evidence: [{ sourceLabel: "Brief", observation: "Fast hook", relevance: "Cold open wins" }],
      }),
    );
    expect(await screen.findByRole("list", { name: /supporting evidence/i })).toBeInTheDocument();
  });

  it("flags an override of the AI recommendation on a decided decision", async () => {
    vi.mocked(getDecision).mockResolvedValue({
      data: {
        ...base,
        advisory: { recommendedOptionId: "opt-1", rationale: "x", confidence: 0.8, evidence: [] },
        status: "DECIDED",
        selectedOptionId: "opt-2",
        decisionRationale: "I disagree",
        decidedAt: "2026-07-19T01:00:00.000Z",
      },
      etag: '"decision:2"',
    });
    render(<DecisionDetail projectId="proj_1" decisionId="dec_1" />);
    expect(await screen.findByText(/Overrode the AI recommendation/i)).toBeInTheDocument();
  });
});
