import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  createPreparedLocation,
  getPreparedLocation,
  renamePreparedLocation,
  startPreparedLocationReconstruction,
  uploadPreparedLocationPhotos,
} from "@/ui/auth/api-client";
import { LocationDetailView } from "./location-detail-view";

const { push, replace } = vi.hoisted(() => ({ push: vi.fn(), replace: vi.fn() }));

vi.mock("next/navigation", () => ({ useRouter: () => ({ push, replace }) }));
vi.mock("./prepared-room-viewer", () => ({
  PreparedRoomViewer: ({ locationName }: { locationName: string }) => (
    <div aria-label={`Room viewer for ${locationName}`} />
  ),
}));
vi.mock("@/ui/auth/api-client", () => ({
  createPreparedLocation: vi.fn(),
  getPreparedLocation: vi.fn(),
  renamePreparedLocation: vi.fn(),
  startPreparedLocationReconstruction: vi.fn(),
  uploadPreparedLocationGlb: vi.fn(),
  uploadPreparedLocationPhotos: vi.fn(),
  errorStatus: (error: { status?: number }) => error.status,
  friendlyError: (error: { message?: string }) => error.message ?? "Something went wrong.",
}));

const ready = {
  id: "loc_READY0001",
  name: "Downtown kitchen",
  inputKind: "PHOTOS" as const,
  status: "READY" as const,
  inputCount: 21,
  photoCount: 20,
  hasEnvironment: true,
  failureCode: null,
  createdAt: "2026-08-21T13:00:00.000Z",
  updatedAt: "2026-08-21T13:00:00.000Z",
  environment: {
    source: "PHOTOS" as const,
    bounds: { min: { x: 0, y: 0, z: 0 }, max: { x: 4, y: 3, z: 5 } },
    sourceToCanonical: [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1],
    scaleMetersPerUnit: 1,
    scaleConfidence: "ESTIMATED" as const,
  },
};

beforeEach(() => {
  push.mockReset();
  replace.mockReset();
  vi.mocked(createPreparedLocation).mockReset();
  vi.mocked(getPreparedLocation).mockReset();
  vi.mocked(renamePreparedLocation).mockReset();
  vi.mocked(startPreparedLocationReconstruction).mockReset();
  vi.mocked(uploadPreparedLocationPhotos).mockReset();
});

describe("LocationDetailView", () => {
  it("keeps the filmmaker's storyboard context visible when opening a room", async () => {
    vi.mocked(getPreparedLocation).mockResolvedValue(ready);
    render(
      <LocationDetailView locationId={ready.id} returnTo="/projects/proj_STORY001/storyboard" />,
    );

    expect(await screen.findByRole("link", { name: /back to storyboard/i })).toHaveAttribute(
      "href",
      "/projects/proj_STORY001/storyboard",
    );
  });

  it("opens a ready room, renames it, and offers safe rebuild and new-version paths", async () => {
    const user = userEvent.setup();
    vi.mocked(getPreparedLocation)
      .mockResolvedValueOnce(ready)
      .mockResolvedValue({ ...ready, name: "Hero kitchen" });
    vi.mocked(renamePreparedLocation).mockResolvedValue({ ...ready, name: "Hero kitchen" });
    vi.mocked(createPreparedLocation).mockResolvedValue({
      ...ready,
      id: "loc_NEWVERSION1",
      name: "Hero kitchen — new version",
      status: "DRAFT",
      inputCount: 0,
      hasEnvironment: false,
    });
    render(<LocationDetailView locationId={ready.id} />);

    expect(await screen.findByLabelText(/room viewer for downtown kitchen/i)).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: /rename location/i }));
    const input = screen.getByLabelText("Location name");
    await user.clear(input);
    await user.type(input, "Hero kitchen");
    await user.click(screen.getByRole("button", { name: /save location name/i }));
    await waitFor(() =>
      expect(renamePreparedLocation).toHaveBeenCalledWith(ready.id, "Hero kitchen"),
    );

    await user.click(screen.getByText(/replace or rebuild room/i));
    await user.click(screen.getByRole("button", { name: /rebuild from saved photos/i }));
    await waitFor(() => expect(startPreparedLocationReconstruction).toHaveBeenCalledWith(ready.id));
    await user.click(screen.getByRole("button", { name: /prepare a new version/i }));
    await waitFor(() =>
      expect(createPreparedLocation).toHaveBeenCalledWith({
        name: "Hero kitchen — new version",
        inputKind: "PHOTOS",
      }),
    );
    expect(push).toHaveBeenCalledWith("/locations/loc_NEWVERSION1");
  });

  it("keeps an existing room visible while its saved photos rebuild", async () => {
    vi.mocked(getPreparedLocation).mockResolvedValue({ ...ready, status: "PROCESSING" });
    render(<LocationDetailView locationId={ready.id} />);

    expect(await screen.findByLabelText(/room viewer for downtown kitchen/i)).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: /building your room/i })).toBeInTheDocument();
  });

  it("explains that a failed 3D scan remains available for retry", async () => {
    vi.mocked(getPreparedLocation).mockResolvedValue({
      ...ready,
      inputKind: "GLB",
      status: "FAILED",
      photoCount: 0,
      environment: null,
    });
    render(<LocationDetailView locationId={ready.id} />);

    expect(
      await screen.findByRole("heading", { name: /try that build again/i }),
    ).toBeInTheDocument();
    expect(screen.getByText(/your original 3d scan remains safely attached/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /try build again/i })).toBeInTheDocument();
  });

  it("uploads draft photos and queues their build as one action", async () => {
    const user = userEvent.setup();
    const draft = {
      ...ready,
      status: "DRAFT" as const,
      inputCount: 0,
      photoCount: 0,
      hasEnvironment: false,
      environment: null,
    };
    vi.mocked(getPreparedLocation).mockResolvedValue(draft);
    vi.mocked(uploadPreparedLocationPhotos).mockResolvedValue({
      ...draft,
      status: "NEEDS_ATTENTION",
    });
    vi.mocked(startPreparedLocationReconstruction).mockResolvedValue({
      id: "locrec_1",
      status: "PROCESSING",
    });
    render(<LocationDetailView locationId={draft.id} />);
    await screen.findByRole("heading", { name: /add the room/i });
    const photos = Array.from(
      { length: 20 },
      (_, index) => new File([String(index)], `room-${index}.jpg`, { type: "image/jpeg" }),
    );
    await user.upload(screen.getByLabelText(/choose room photos/i), photos);

    await waitFor(() =>
      expect(uploadPreparedLocationPhotos).toHaveBeenCalledWith(
        draft.id,
        photos,
        expect.any(Function),
      ),
    );
    expect(startPreparedLocationReconstruction).toHaveBeenCalledWith(draft.id);
  });
});
