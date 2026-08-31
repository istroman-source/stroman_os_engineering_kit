import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { apiGetWithEtag } from "@/ui/auth/api-client";
import { ProjectReview, type ProjectReviewData } from "./project-review";

const { replace } = vi.hoisted(() => ({ replace: vi.fn() }));
vi.mock("next/navigation", () => ({ useRouter: () => ({ replace }) }));
vi.mock("@/ui/auth/api-client", () => ({
  apiGetWithEtag: vi.fn(),
  errorStatus: (error: { status?: number }) => error.status,
  friendlyError: (error: { message?: string }) => error.message ?? "Request failed",
}));

const base: ProjectReviewData = {
  project: { id: "proj_1", name: "Harbor Light", status: "ACTIVE" },
  readiness: "READY",
  intent: {
    title: "Harbor Light",
    creativeGoal: "Make the cost of leaving visible.",
    targetAudience: "People deciding whether to return home.",
    desiredEmotion: "Uneasy hope",
    currentDirection: "The tide decides",
    version: 2,
    updatedAt: "2026-08-31T10:00:00.000Z",
  },
  sources: { total: 1, completed: 1, needsAttention: 0, kinds: ["TRANSCRIPT"] },
  evidence: [
    {
      id: "out_1",
      sourceKind: "TRANSCRIPT",
      kind: "OBSERVATION",
      content: "The subject pauses before answering.",
      confidence: 0.92,
      evidenceReferenceIds: ["evref_1"],
    },
    {
      id: "out_2",
      sourceKind: "TRANSCRIPT",
      kind: "THEME",
      content: "The pause may carry the conflict.",
      confidence: 0.7,
      evidenceReferenceIds: ["evref_1"],
    },
  ],
  recommendations: [],
  decisions: [
    {
      id: "dec_1",
      projectId: "proj_1",
      question: "Use the silence before the reveal?",
      options: [
        { id: "keep", label: "Keep the silence", rationale: null },
        { id: "reject", label: "Reject", rationale: null },
      ],
      advisory: null,
      context: {
        originStage: "EDIT",
        artifactKind: "EDIT_RECOMMENDATION",
        artifactId: "rec_1",
        artifactVersion: 1,
        needsReview: false,
        reviewReason: null,
      },
      status: "DECIDED",
      selectedOptionId: "keep",
      decidedBy: "usr_1",
      decisionRationale: "The pause lets the turn land.",
      createdAt: "",
      decidedAt: "",
    },
  ],
  decisionSummary: { accepted: 1, rejected: 0, deferred: 0, unresolved: 0 },
  conflicts: [],
  missingCoverage: [],
  unresolvedActions: [],
};

beforeEach(() => {
  replace.mockReset();
  vi.mocked(apiGetWithEtag).mockReset().mockResolvedValue({ data: base, etag: null });
});

describe("ProjectReview", () => {
  it("separates source facts from interpretations and makes decisions inspectable", async () => {
    const user = userEvent.setup();
    render(<ProjectReview projectId="proj_1" />);
    expect(await screen.findByRole("heading", { name: "What the film currently is" })).toBeInTheDocument();
    expect(screen.getByText("The subject pauses before answering.")).toBeInTheDocument();
    const interpretationSummary = screen.getByText(/See editorial interpretations/);
    expect(interpretationSummary.closest("details")).not.toHaveAttribute("open");
    await user.click(interpretationSummary);
    expect(interpretationSummary.closest("details")).toHaveAttribute("open");
    expect(screen.getByText("The pause may carry the conflict.")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /Use the silence/ })).toHaveAttribute(
      "href",
      "/projects/proj_1/decisions/dec_1",
    );
    expect(screen.getByText("Ready to hand off")).toBeInTheDocument();
  });

  it("gives an empty project one clear next action", async () => {
    vi.mocked(apiGetWithEtag).mockResolvedValue({
      data: {
        ...base,
        readiness: "EMPTY",
        intent: null,
        sources: { total: 0, completed: 0, needsAttention: 0, kinds: [] },
        evidence: [],
        decisions: [],
        decisionSummary: { accepted: 0, rejected: 0, deferred: 0, unresolved: 0 },
      },
      etag: null,
    });
    render(<ProjectReview projectId="proj_1" />);
    expect(await screen.findByRole("heading", { name: "There is nothing to review yet" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Develop the idea" })).toHaveAttribute(
      "href",
      "/projects/proj_1",
    );
  });

  it("shows conflicts and reloads a temporary failure", async () => {
    const user = userEvent.setup();
    vi.mocked(apiGetWithEtag).mockRejectedValue({
      status: 503,
      message: "Review is temporarily unavailable.",
    });
    render(<ProjectReview projectId="proj_1" />);
    expect(await screen.findByRole("alert")).toHaveTextContent(/temporarily unavailable/i);
    vi.mocked(apiGetWithEtag).mockResolvedValue({
      data: {
        ...base,
        readiness: "NEEDS_ATTENTION",
        conflicts: ["Use this shot?: The room plan changed."],
        missingCoverage: ["No completed source analysis is available."],
      },
      etag: null,
    });
    await user.click(screen.getByRole("button", { name: "Reload review" }));
    expect(await screen.findByText(/The room plan changed/)).toBeInTheDocument();
    expect(screen.getByText("Needs a final pass")).toBeInTheDocument();
  });
});
