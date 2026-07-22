import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { RunDetail } from "./run-detail";
import * as api from "./acquisition-api";
vi.mock("next/navigation", () => ({ useRouter: () => ({ replace: vi.fn() }) }));
vi.mock("./acquisition-api", () => ({
  getRun: vi.fn(),
  listObservationsByRun: vi.fn(),
  getObservation: vi.fn(),
  startRun: vi.fn(),
  completeRun: vi.fn(),
  failRun: vi.fn(),
  reviewObservation: vi.fn(),
  materializeObservation: vi.fn(),
}));
const run = {
  id: "run-1",
  knowledgeSourceId: "source-1",
  extractor: "manual",
  extractorVersion: "1",
  status: "PENDING",
  startedAt: null,
  finishedAt: null,
  summary: null,
  createdAt: "",
} as api.AcquisitionRun;
const observation = {
  id: "obs-1",
  observationType: "ENTITY",
  payload: { kind: "ENTITY", name: "Michael", entityKind: "person" },
  evidence: {
    sourceDocumentId: "doc-1",
    knowledgeSourceId: "source-1",
    acquisitionRunId: "run-1",
    location: null,
  },
  confidence: 0.9,
  createdBy: "AI",
  status: "PENDING_REVIEW",
  createdAt: "",
} as api.KnowledgeObservation;
beforeEach(() => {
  vi.clearAllMocks();
  vi.mocked(api.getRun).mockResolvedValue({ data: run, etag: '"acquisitionrun:1"' });
  vi.mocked(api.listObservationsByRun).mockResolvedValue([observation]);
  vi.mocked(api.getObservation).mockResolvedValue({
    data: { observation, review: null },
    etag: '"knowledgeobservation:1"',
  });
});
describe("RunDetail", () => {
  it("starts a pending run with its ETag and selects an observation", async () => {
    vi.mocked(api.startRun).mockResolvedValue({
      data: { ...run, status: "RUNNING" },
      etag: '"acquisitionrun:2"',
    });
    const user = userEvent.setup();
    render(<RunDetail runId="run-1" />);
    await user.click(await screen.findByRole("button", { name: "Start" }));
    expect(api.startRun).toHaveBeenCalledWith("run-1", '"acquisitionrun:1"');
    await user.click(screen.getByRole("button", { name: /ENTITY/ }));
    expect(await screen.findByText(/Confidence: 0.9/)).toBeInTheDocument();
  });
  it("accepts, rejects, and edit-accepts using the observation ETag", async () => {
    vi.mocked(api.reviewObservation).mockResolvedValue({
      data: {
        observation: { ...observation, status: "ACCEPTED" },
        review: {
          id: "review-1",
          outcome: "ACCEPT",
          note: null,
          editedPayload: null,
          reviewedAt: "",
        },
      },
      etag: '"knowledgeobservation:2"',
    });
    const user = userEvent.setup();
    render(<RunDetail runId="run-1" />);
    await user.click(await screen.findByRole("button", { name: /ENTITY/ }));
    await user.selectOptions(await screen.findByLabelText("Outcome"), "EDIT_AND_ACCEPT");
    await user.clear(screen.getByLabelText("name"));
    await user.type(screen.getByLabelText("name"), "Edited");
    await user.click(screen.getByRole("button", { name: "Submit review" }));
    await waitFor(() =>
      expect(api.reviewObservation).toHaveBeenCalledWith(
        "obs-1",
        expect.objectContaining({
          outcome: "EDIT_AND_ACCEPT",
          editedPayload: expect.objectContaining({ name: "Edited" }),
        }),
        '"knowledgeobservation:1"',
      ),
    );
  });
  it("materializes accepted observations and displays the record id", async () => {
    const accepted = { ...observation, status: "ACCEPTED" } as api.KnowledgeObservation;
    vi.mocked(api.getObservation).mockResolvedValue({
      data: { observation: accepted, review: null },
      etag: '"knowledgeobservation:2"',
    });
    vi.mocked(api.materializeObservation).mockResolvedValue({
      data: {
        knowledgeObservationId: "obs-1",
        knowledgeReviewId: "review-1",
        record: { recordType: "ENTITY", recordId: "ent-1" },
        createdAt: "",
      },
      etag: null,
    });
    const user = userEvent.setup();
    render(<RunDetail runId="run-1" />);
    await user.click(await screen.findByRole("button", { name: /ENTITY/ }));
    await user.click(await screen.findByRole("button", { name: "Materialize entity" }));
    expect(await screen.findByText("ent-1")).toBeInTheDocument();
    expect(api.materializeObservation).toHaveBeenCalledWith("obs-1", { kind: "ENTITY" });
  });
});
