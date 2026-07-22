import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { SourceDetail } from "./source-detail";
import * as api from "./acquisition-api";

vi.mock("next/navigation", () => ({ useRouter: () => ({ replace: vi.fn() }) }));
vi.mock("./acquisition-api", () => ({
  getSource: vi.fn(),
  listDocuments: vi.fn(),
  listRuns: vi.fn(),
  pauseSource: vi.fn(),
  resumeSource: vi.fn(),
  archiveSource: vi.fn(),
  addDocument: vi.fn(),
  createRun: vi.fn(),
}));
const source = {
  id: "source-1",
  name: "Interviews",
  sourceType: "MANUAL",
  origin: null,
  sourceReliability: "VERIFIED",
  status: "ACTIVE",
  createdAt: "",
} as api.KnowledgeSource;
beforeEach(() => {
  vi.clearAllMocks();
  vi.mocked(api.getSource).mockResolvedValue({ data: source, etag: '"knowledgesource:1"' });
  vi.mocked(api.listDocuments).mockResolvedValue([]);
  vi.mocked(api.listRuns).mockResolvedValue([]);
});

describe("SourceDetail", () => {
  it("loads empty panels and passes the source ETag to lifecycle actions", async () => {
    vi.mocked(api.pauseSource).mockResolvedValue({
      data: { ...source, status: "PAUSED" },
      etag: '"knowledgesource:2"',
    });
    const user = userEvent.setup();
    render(<SourceDetail sourceId="source-1" />);
    expect(await screen.findByText("No documents yet.")).toBeInTheDocument();
    expect(screen.getByText("No runs yet.")).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Pause" }));
    expect(api.pauseSource).toHaveBeenCalledWith("source-1", '"knowledgesource:1"');
  });
  it("adds documents and creates runs", async () => {
    vi.mocked(api.addDocument).mockResolvedValue({ data: {} as never, etag: null });
    vi.mocked(api.createRun).mockResolvedValue({ data: {} as never, etag: null });
    const user = userEvent.setup();
    render(<SourceDetail sourceId="source-1" />);
    await user.type(await screen.findByLabelText("Title"), "Transcript");
    await user.type(screen.getByLabelText("Content hash"), "sha256:value");
    await user.click(screen.getByRole("button", { name: "Add document" }));
    await waitFor(() => expect(api.addDocument).toHaveBeenCalled());
    expect(await screen.findByText("Document added.")).toBeInTheDocument();
    await user.type(screen.getByLabelText("Extractor"), "manual");
    await user.type(screen.getByLabelText("Version"), "1");
    await user.click(screen.getByRole("button", { name: "Create run" }));
    await waitFor(() =>
      expect(api.createRun).toHaveBeenCalledWith("source-1", {
        extractor: "manual",
        extractorVersion: "1",
      }),
    );
  });
  it("treats an idempotent duplicate document response as success", async () => {
    vi.mocked(api.addDocument).mockResolvedValue({
      data: { id: "existing-document" } as never,
      etag: null,
    });
    const user = userEvent.setup();
    render(<SourceDetail sourceId="source-1" />);
    await user.type(await screen.findByLabelText("Title"), "Existing transcript");
    await user.type(screen.getByLabelText("Content hash"), "sha256:duplicate");
    await user.click(screen.getByRole("button", { name: "Add document" }));
    expect(await screen.findByText("Document added.")).toBeInTheDocument();
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
  });
  it("refreshes after a lifecycle conflict", async () => {
    vi.mocked(api.pauseSource).mockRejectedValue({ status: 409, message: "conflict" });
    const user = userEvent.setup();
    render(<SourceDetail sourceId="source-1" />);
    await user.click(await screen.findByRole("button", { name: "Pause" }));
    expect(await screen.findByRole("alert")).toHaveTextContent(
      /refreshed with the latest version/i,
    );
    await waitFor(() => expect(vi.mocked(api.getSource).mock.calls.length).toBeGreaterThan(1));
  });
});
