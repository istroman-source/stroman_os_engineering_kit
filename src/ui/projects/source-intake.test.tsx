import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";
import { SourceIntake } from "./source-intake";

afterEach(() => {
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

describe("SourceIntake", () => {
  it("keeps a successful transcript import successful after resetting the form", async () => {
    const BrowserFormData = window.FormData;
    class FormDataWithUploadedFiles extends BrowserFormData {
      constructor(form?: HTMLFormElement) {
        super();
        const input = form?.elements.namedItem("file");
        const selected = input instanceof HTMLInputElement ? input.files?.[0] : null;
        if (selected) this.set("file", selected);
      }
    }
    vi.stubGlobal("File", window.File);
    vi.stubGlobal("FormData", FormDataWithUploadedFiles);
    const resetSpy = vi.spyOn(window.HTMLFormElement.prototype, "reset");
    const completed = {
      id: "import-1",
      status: "COMPLETED" as const,
      sourceName: "interview.txt",
      sourceKind: "TRANSCRIPT" as const,
      byteSize: 36,
    };
    const existing = {
      id: "import-existing",
      status: "PROCESSING" as const,
      sourceName: "existing-interview.txt",
      sourceKind: "TRANSCRIPT" as const,
      byteSize: 24,
    };
    let getCount = 0;
    const fetchMock = vi.fn(async (_input: RequestInfo | URL, init?: RequestInit) => {
      if (init?.method === "POST") {
        return { ok: true, status: 201, json: async () => completed } as Response;
      }
      const items = getCount++ === 0 ? [existing] : [completed];
      return { ok: true, status: 200, json: async () => ({ items }) } as Response;
    });
    vi.stubGlobal("fetch", fetchMock);
    const user = userEvent.setup();
    render(<SourceIntake projectId="proj_1" />);
    await screen.findByText("existing-interview.txt");

    const input = screen.getByLabelText("Transcript or script") as HTMLInputElement;
    const file = new window.File(["A meaningful interview transcript."], "interview.txt", {
      type: "text/plain",
    });
    await user.upload(input, file);
    expect(input.files?.[0]).toBe(file);
    expect(input.files?.[0]).toBeInstanceOf(File);
    const submittedFile = new FormData(input.closest("form")!).get("file");
    expect(submittedFile).toBeInstanceOf(File);
    expect((submittedFile as File).size).toBeGreaterThan(0);
    fireEvent.submit(input.closest("form")!);

    await waitFor(() =>
      expect(fetchMock).toHaveBeenCalledWith(
        "/api/v1/projects/proj_1/imports",
        expect.objectContaining({ method: "POST" }),
      ),
    );
    expect(await screen.findByText("Ready")).toBeInTheDocument();
    expect(resetSpy).toHaveBeenCalledTimes(1);
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
  });

  it("shows honest failure states and retries preserved input without opening a file picker", async () => {
    const failed = {
      id: "import-failed",
      status: "RETRYABLE_FAILURE" as const,
      sourceName: "interview.wav",
      sourceKind: "MEDIA" as const,
      byteSize: 42,
      failureCode: "PERSISTENCE_UNAVAILABLE",
    };
    const completed = { ...failed, status: "COMPLETED" as const, failureCode: null };
    let retried = false;
    const fetchMock = vi.fn(async (_input: RequestInfo | URL, init?: RequestInit) => {
      if (init?.method === "POST") {
        retried = true;
        return { ok: true, status: 200, json: async () => completed } as Response;
      }
      return {
        ok: true,
        status: 200,
        json: async () => ({ items: [retried ? completed : failed] }),
      } as Response;
    });
    vi.stubGlobal("fetch", fetchMock);
    const user = userEvent.setup();
    render(<SourceIntake projectId="proj_1" />);

    expect(await screen.findByText("Needs retry")).toBeInTheDocument();
    expect(screen.getByText(/original is preserved/i)).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: /retry preserved source/i }));
    expect(await screen.findByText("Ready")).toBeInTheDocument();
    expect(fetchMock).toHaveBeenCalledWith(
      "/api/v1/projects/proj_1/imports/import-failed/retry",
      expect.objectContaining({ method: "POST" }),
    );
  });

  it("asks for replacement when a source cannot be read safely", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(
        async () =>
          ({
            ok: true,
            json: async () => ({
              items: [
                {
                  id: "import-terminal",
                  status: "TERMINAL_FAILURE",
                  sourceName: "broken.vtt",
                  sourceKind: "TRANSCRIPT",
                  byteSize: 12,
                },
              ],
            }),
          }) as Response,
      ),
    );
    render(<SourceIntake projectId="proj_1" />);
    expect(await screen.findByText("Needs replacement")).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /retry/i })).not.toBeInTheDocument();
  });
});
