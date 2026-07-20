import { render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { CallbackView } from "./callback-view";
import { completeCallback } from "./api-client";

const { replaceMock, routerMock } = vi.hoisted(() => {
  const replaceMock = vi.fn();
  return {
    replaceMock,
    routerMock: { replace: replaceMock, push: vi.fn(), prefetch: vi.fn(), refresh: vi.fn() },
  };
});
vi.mock("next/navigation", () => ({ useRouter: () => routerMock }));
vi.mock("./api-client", () => ({
  completeCallback: vi.fn(),
  friendlyError: (err: { message?: string }) => err?.message ?? "error",
}));

function setUrl(pathWithHash: string) {
  window.history.replaceState(null, "", pathWithHash);
}

beforeEach(() => {
  replaceMock.mockReset();
  vi.mocked(completeCallback).mockReset();
});
afterEach(() => setUrl("/"));

describe("CallbackView", () => {
  it("posts the fragment session, scrubs the hash, and redirects to /projects", async () => {
    vi.mocked(completeCallback).mockResolvedValue({ authenticated: true });
    setUrl("/auth/callback#access_token=aaa&refresh_token=bbb&expires_in=3600&token_type=bearer");
    render(<CallbackView />);

    await waitFor(() =>
      expect(completeCallback).toHaveBeenCalledWith({
        accessToken: "aaa",
        refreshToken: "bbb",
        expiresInSeconds: 3600,
      }),
    );
    await waitFor(() => expect(replaceMock).toHaveBeenCalledWith("/projects"));
    expect(window.location.hash).toBe("");
  });

  it("redirects to a validated `next` and rejects open redirects", async () => {
    vi.mocked(completeCallback).mockResolvedValue({ authenticated: true });
    setUrl("/auth/callback?next=//evil.com#access_token=aaa&refresh_token=bbb");
    render(<CallbackView />);
    await waitFor(() => expect(replaceMock).toHaveBeenCalledWith("/projects"));
  });

  it("shows an error and does not call the API when the link carries an error", async () => {
    setUrl("/auth/callback#error=access_denied&error_description=otp_expired");
    render(<CallbackView />);
    expect(await screen.findByRole("alert")).toHaveTextContent(/invalid or has expired/i);
    expect(completeCallback).not.toHaveBeenCalled();
    expect(replaceMock).not.toHaveBeenCalled();
  });

  it("shows an error when the session parameters are missing", async () => {
    setUrl("/auth/callback#token_type=bearer");
    render(<CallbackView />);
    expect(await screen.findByRole("alert")).toHaveTextContent(/missing its session/i);
    expect(completeCallback).not.toHaveBeenCalled();
  });

  it("surfaces a server rejection", async () => {
    vi.mocked(completeCallback).mockRejectedValue({ message: "Your session has ended." });
    setUrl("/auth/callback#access_token=aaa&refresh_token=bbb");
    render(<CallbackView />);
    expect(await screen.findByRole("alert")).toHaveTextContent(/session has ended/i);
    expect(replaceMock).not.toHaveBeenCalled();
  });
});
