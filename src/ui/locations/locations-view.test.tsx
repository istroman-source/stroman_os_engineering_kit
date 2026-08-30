import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { createPreparedLocation, listPreparedLocations } from "@/ui/auth/api-client";
import { LocationsView } from "./locations-view";

const { push, replace } = vi.hoisted(() => ({ push: vi.fn(), replace: vi.fn() }));
vi.mock("next/navigation", () => ({
  useRouter: () => ({ push, replace, prefetch: vi.fn(), refresh: vi.fn() }),
}));
vi.mock("@/ui/auth/api-client", () => ({
  createPreparedLocation: vi.fn(),
  listPreparedLocations: vi.fn(),
  errorStatus: (error: { status?: number }) => error.status,
  friendlyError: (error: { message?: string }) => error.message ?? "Something went wrong.",
}));

const ready = {
  id: "loc_READY0001",
  name: "Downtown kitchen",
  inputKind: "PHOTOS" as const,
  status: "READY" as const,
  inputCount: 21,
  hasEnvironment: true,
  failureCode: null,
  createdAt: "2026-08-21T13:00:00.000Z",
  updatedAt: "2026-08-21T13:00:00.000Z",
};

beforeEach(() => {
  push.mockReset();
  replace.mockReset();
  vi.mocked(createPreparedLocation).mockReset();
  vi.mocked(listPreparedLocations).mockReset();
});

describe("LocationsView", () => {
  it("makes a ready reusable room plainly openable", async () => {
    vi.mocked(listPreparedLocations).mockResolvedValue([ready]);
    render(<LocationsView />);
    expect(await screen.findByText("Downtown kitchen")).toBeVisible();
    expect(screen.getByText("Ready to use")).toBeVisible();
    expect(screen.getByRole("link", { name: /open room/i })).toHaveAttribute(
      "href",
      "/locations/loc_READY0001",
    );
  });

  it("keeps adding a location to one guided flow", async () => {
    const user = userEvent.setup();
    vi.mocked(listPreparedLocations).mockResolvedValue([]);
    vi.mocked(createPreparedLocation).mockResolvedValue({
      ...ready,
      id: "loc_NEW0001",
      status: "DRAFT",
      hasEnvironment: false,
      inputCount: 0,
    });
    render(<LocationsView />);
    await screen.findByText(/add your first room/i);
    await user.click(screen.getAllByRole("button", { name: /add a room/i })[0]!);
    await user.type(screen.getByLabelText(/location name/i), "Studio office");
    await user.click(screen.getByRole("button", { name: /continue/i }));
    await waitFor(() =>
      expect(createPreparedLocation).toHaveBeenCalledWith({
        name: "Studio office",
        inputKind: "PHOTOS",
      }),
    );
    expect(push).toHaveBeenCalledWith("/locations/loc_NEW0001");
  });
});
