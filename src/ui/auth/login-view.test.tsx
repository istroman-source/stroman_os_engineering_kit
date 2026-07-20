import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { LoginView } from "./login-view";
import { getSession, startOtp, verifyOtp } from "./api-client";

const { replaceMock, routerMock } = vi.hoisted(() => {
  const replaceMock = vi.fn();
  return {
    replaceMock,
    routerMock: { replace: replaceMock, push: vi.fn(), prefetch: vi.fn(), refresh: vi.fn() },
  };
});
vi.mock("next/navigation", () => ({ useRouter: () => routerMock }));
vi.mock("./api-client", () => ({
  getSession: vi.fn(),
  startOtp: vi.fn(),
  verifyOtp: vi.fn(),
  friendlyError: (err: { message?: string }) => err?.message ?? "error",
}));

beforeEach(() => {
  replaceMock.mockReset();
  vi.mocked(getSession).mockReset();
  vi.mocked(startOtp).mockReset();
  vi.mocked(verifyOtp).mockReset();
});

describe("LoginView", () => {
  it("redirects an already-authenticated visitor to /projects", async () => {
    vi.mocked(getSession).mockResolvedValue(true);
    render(<LoginView />);
    await waitFor(() => expect(replaceMock).toHaveBeenCalledWith("/projects"));
  });

  it("requests a code then reveals the OTP field", async () => {
    const user = userEvent.setup();
    vi.mocked(getSession).mockResolvedValue(false);
    vi.mocked(startOtp).mockResolvedValue({ message: "sent" });
    render(<LoginView />);

    await user.type(await screen.findByLabelText(/email/i), "chef@example.com");
    await user.click(screen.getByRole("button", { name: /send sign-in link/i }));

    expect(await screen.findByLabelText(/verification code/i)).toBeInTheDocument();
    expect(startOtp).toHaveBeenCalledWith("chef@example.com");
  });

  it("verifies the code and redirects to /projects", async () => {
    const user = userEvent.setup();
    vi.mocked(getSession).mockResolvedValue(false);
    vi.mocked(startOtp).mockResolvedValue({ message: "sent" });
    vi.mocked(verifyOtp).mockResolvedValue({ authenticated: true });
    render(<LoginView />);

    await user.type(await screen.findByLabelText(/email/i), "chef@example.com");
    await user.click(screen.getByRole("button", { name: /send sign-in link/i }));
    await user.type(await screen.findByLabelText(/verification code/i), "123456");
    await user.click(screen.getByRole("button", { name: /verify & sign in/i }));

    await waitFor(() => expect(verifyOtp).toHaveBeenCalledWith("chef@example.com", "123456"));
    await waitFor(() => expect(replaceMock).toHaveBeenCalledWith("/projects"));
  });

  it("shows an error when verification fails", async () => {
    const user = userEvent.setup();
    vi.mocked(getSession).mockResolvedValue(false);
    vi.mocked(startOtp).mockResolvedValue({ message: "sent" });
    vi.mocked(verifyOtp).mockRejectedValue({
      code: "INVALID_OTP",
      message: "That code is invalid.",
    });
    render(<LoginView />);

    await user.type(await screen.findByLabelText(/email/i), "chef@example.com");
    await user.click(screen.getByRole("button", { name: /send sign-in link/i }));
    await user.type(await screen.findByLabelText(/verification code/i), "000000");
    await user.click(screen.getByRole("button", { name: /verify & sign in/i }));

    expect(await screen.findByRole("alert")).toHaveTextContent(/invalid/i);
    expect(replaceMock).not.toHaveBeenCalledWith("/projects");
  });

  it("shows a sanitized message on a provider rate limit (429)", async () => {
    const user = userEvent.setup();
    vi.mocked(getSession).mockResolvedValue(false);
    vi.mocked(startOtp).mockRejectedValue({ status: 429, code: "RATE_LIMITED", message: "raw" });
    render(<LoginView />);

    await user.type(await screen.findByLabelText(/email/i), "chef@example.com");
    await user.click(screen.getByRole("button", { name: /send sign-in link/i }));

    const alert = await screen.findByRole("alert");
    expect(alert).toHaveTextContent(/test email limit/i);
    expect(alert).toHaveTextContent(/newest email/i);
    // Raw provider text is never shown.
    expect(alert).not.toHaveTextContent(/raw/i);
  });

  it("disables the send button on a cooldown after a successful request", async () => {
    const user = userEvent.setup();
    vi.mocked(getSession).mockResolvedValue(false);
    vi.mocked(startOtp).mockResolvedValue({ message: "sent" });
    render(<LoginView />);

    await user.type(await screen.findByLabelText(/email/i), "chef@example.com");
    await user.click(screen.getByRole("button", { name: /send sign-in link/i }));

    // Back to the email step; the send button is now on cooldown and disabled.
    await user.click(await screen.findByRole("button", { name: /use a different email/i }));
    const resend = await screen.findByRole("button", { name: /resend in \d+s/i });
    expect(resend).toBeDisabled();
  });
});
