import { render, screen, waitFor } from "@testing-library/react";
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
    const onStart = vi.fn().mockResolvedValue({
      id: "lrec_ROOM0001",
      name: "Actual kitchen",
      status: "PROCESSING",
      phase: "QUEUED",
      photoCount: 20,
      environmentId: null,
      failureCode: null,
      createdAt: "2026-08-20T12:00:00.000Z",
      updatedAt: "2026-08-20T12:00:00.000Z",
    });

    render(<LocationPhotoInput busy={false} onGet={onGet} onStart={onStart} onRefresh={vi.fn()} />);

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
  });

  it("explains a long-running provider task without inviting a duplicate paid scan", () => {
    const message = locationReconstructionProgress(
      {
        id: "lrec_ROOM0002",
        name: "Office",
        status: "PROCESSING",
        phase: "PROCESSING",
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
});
