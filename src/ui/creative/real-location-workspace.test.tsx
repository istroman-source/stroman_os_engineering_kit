import { act, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { LocationPhotoInput, locationReconstructionProgress } from "./real-location-workspace";

vi.mock("@/ui/auth/api-client", () => ({
  friendlyError: (error: { message?: string }) => error.message ?? "Something went wrong.",
}));

describe("LocationPhotoInput", () => {
  it("starts a seamless reconstruction from ordinary photos without dimensions", async () => {
    const user = userEvent.setup();
    const onGet = vi.fn().mockResolvedValue(null);
    const job = {
      id: "lrec_ROOM0001",
      name: "Actual kitchen",
      status: "PROCESSING" as const,
      phase: "QUEUED" as const,
      percent: null,
      photoCount: 20,
      environmentId: null,
      failureCode: null,
      createdAt: "2026-08-20T12:00:00.000Z",
      updatedAt: "2026-08-20T12:00:00.000Z",
    };
    const onStart = vi.fn().mockResolvedValue(job);
    const onRefresh = vi.fn().mockResolvedValue(job);

    render(
      <LocationPhotoInput busy={false} onGet={onGet} onStart={onStart} onRefresh={onRefresh} />,
    );

    expect(await screen.findByText(/no dimensions or separate scanning software/i)).toBeVisible();
    expect(screen.queryByLabelText(/dimensions/i)).not.toBeInTheDocument();
    await user.type(screen.getByLabelText(/location name/i), "Actual kitchen");
    const photos = Array.from(
      { length: 20 },
      (_, index) => new File([`photo-${index}`], `angle-${index + 1}.jpg`, { type: "image/jpeg" }),
    );
    await user.upload(screen.getByLabelText(/20–40 overlapping photos/i), photos);
    await user.click(screen.getByRole("button", { name: /build this space/i }));

    await waitFor(() => expect(onStart).toHaveBeenCalledOnce());
    expect(onStart.mock.calls[0]![0]).toMatchObject({ name: "Actual kitchen", photos });
    expect(onStart.mock.calls[0]![0].onProgress).toEqual(expect.any(Function));
    expect(await screen.findByText(/building actual kitchen/i)).toBeVisible();
    expect(screen.getByRole("status")).toHaveTextContent(/upload is complete.*waiting/i);
    await waitFor(() => expect(onRefresh).toHaveBeenCalledWith("lrec_ROOM0001"));
    expect(await screen.findByText(/last status check/i)).toBeVisible();
  });

  it("makes Check now visibly refresh the same live job without a page reload", async () => {
    const user = userEvent.setup();
    const queued = {
      id: "lrec_ROOM0003",
      name: "Office",
      status: "PROCESSING" as const,
      phase: "QUEUED" as const,
      percent: null,
      photoCount: 29,
      environmentId: null,
      failureCode: null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    const processing = { ...queued, phase: "PROCESSING" as const };
    let resolveManual!: (value: typeof processing) => void;
    const manual = new Promise<typeof processing>((resolve) => {
      resolveManual = resolve;
    });
    const onRefresh = vi.fn().mockResolvedValueOnce(queued).mockReturnValueOnce(manual);

    render(
      <LocationPhotoInput
        busy={false}
        onGet={vi.fn().mockResolvedValue(queued)}
        onStart={vi.fn()}
        onRefresh={onRefresh}
      />,
    );

    await waitFor(() => expect(onRefresh).toHaveBeenCalledTimes(1));
    await screen.findByText(/last status check/i);
    await user.click(screen.getByRole("button", { name: /check now/i }));
    expect(screen.getByRole("button", { name: /checking/i })).toBeDisabled();
    expect(screen.getByText(/checking the reconstruction service now/i)).toBeVisible();

    await act(async () => resolveManual(processing));
    await waitFor(() => expect(onRefresh).toHaveBeenCalledTimes(2));
    expect(screen.getByRole("button", { name: /check now/i })).toBeEnabled();
    expect(screen.getByRole("status")).toHaveTextContent(/aligning the overlapping views/i);
  });

  it("explains a long-running provider task without inviting a duplicate paid scan", () => {
    const message = locationReconstructionProgress(
      {
        id: "lrec_ROOM0002",
        name: "Office",
        status: "PROCESSING",
        phase: "PROCESSING",
        percent: null,
        photoCount: 29,
        environmentId: null,
        failureCode: null,
        createdAt: "2026-08-20T12:00:00.000Z",
        updatedAt: "2026-08-20T12:00:00.000Z",
      },
      Date.parse("2026-08-20T12:31:00.000Z"),
    );

    expect(message).toMatch(/still being reconstructed after 31 minutes/i);
    expect(message).toMatch(/do not resubmit/i);
  });

  it("shows queue age and confirms that reloading is unnecessary", () => {
    const message = locationReconstructionProgress(
      {
        id: "lrec_ROOM0004",
        name: "Office",
        status: "PROCESSING",
        phase: "QUEUED",
        percent: null,
        photoCount: 29,
        environmentId: null,
        failureCode: null,
        createdAt: "2026-08-20T12:00:00.000Z",
        updatedAt: "2026-08-20T12:00:00.000Z",
      },
      Date.parse("2026-08-20T12:42:00.000Z"),
    );

    expect(message).toMatch(/waiting 42 minutes/i);
    expect(message).toMatch(/no reload is needed/i);
  });

  it("translates owned-worker stages into useful live progress", () => {
    const message = locationReconstructionProgress({
      id: "lrec_ROOM0005",
      name: "Office",
      status: "PROCESSING",
      phase: "DENSIFYING",
      percent: 55,
      photoCount: 29,
      environmentId: null,
      failureCode: null,
      createdAt: "2026-08-20T12:00:00.000Z",
      updatedAt: "2026-08-20T12:03:00.000Z",
    });

    expect(message).toMatch(/dense room geometry/i);
    expect(message).toMatch(/55% complete/i);
    expect(message).toMatch(/no reload is needed/i);
  });
});
