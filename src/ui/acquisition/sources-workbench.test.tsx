import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { SourcesWorkbench } from "./sources-workbench";
import { createSource, listSources } from "./acquisition-api";

const { router } = vi.hoisted(() => ({ router: { replace: vi.fn() } }));
vi.mock("next/navigation", () => ({ useRouter: () => router }));
vi.mock("./acquisition-api", () => ({ listSources: vi.fn(), createSource: vi.fn() }));

beforeEach(() => {
  router.replace.mockReset();
  vi.mocked(listSources).mockReset().mockResolvedValue([]);
  vi.mocked(createSource)
    .mockReset()
    .mockResolvedValue({ data: {}, etag: null } as never);
});

describe("SourcesWorkbench", () => {
  it("renders loading then the empty state", async () => {
    render(<SourcesWorkbench />);
    expect(screen.getByText(/loading sources/i)).toBeInTheDocument();
    expect(await screen.findByText(/no sources yet/i)).toBeInTheDocument();
  });

  it("validates and creates a source", async () => {
    const user = userEvent.setup();
    render(<SourcesWorkbench />);
    await user.click(screen.getByRole("button", { name: /create source/i }));
    expect(screen.getByRole("alert")).toHaveTextContent(/name is required/i);
    await user.type(screen.getByLabelText("Name"), "Founder interviews");
    await user.click(screen.getByRole("button", { name: /create source/i }));
    await waitFor(() =>
      expect(createSource).toHaveBeenCalledWith({
        name: "Founder interviews",
        sourceType: "MANUAL",
        sourceReliability: "UNKNOWN",
      }),
    );
    expect(await screen.findByText("Source created.")).toBeInTheDocument();
  });

  it("redirects to login after a 401", async () => {
    vi.mocked(listSources).mockRejectedValue({ status: 401 });
    render(<SourcesWorkbench />);
    await waitFor(() => expect(router.replace).toHaveBeenCalledWith("/login"));
  });
});
