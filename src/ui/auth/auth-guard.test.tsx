import { render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { AuthGuard } from "./auth-guard";
import { getSession } from "./api-client";

const { replaceMock, routerMock } = vi.hoisted(() => {
  const replaceMock = vi.fn();
  return {
    replaceMock,
    routerMock: { replace: replaceMock, push: vi.fn(), prefetch: vi.fn(), refresh: vi.fn() },
  };
});
vi.mock("next/navigation", () => ({ useRouter: () => routerMock }));
vi.mock("./api-client", () => ({ getSession: vi.fn() }));

beforeEach(() => {
  replaceMock.mockReset();
  vi.mocked(getSession).mockReset();
});

describe("AuthGuard", () => {
  it("redirects unauthenticated users to /login and hides children", async () => {
    vi.mocked(getSession).mockResolvedValue(false);
    render(
      <AuthGuard>
        <p>secret content</p>
      </AuthGuard>,
    );
    await waitFor(() => expect(replaceMock).toHaveBeenCalledWith("/login"));
    expect(screen.queryByText("secret content")).not.toBeInTheDocument();
  });

  it("renders children for an authenticated user", async () => {
    vi.mocked(getSession).mockResolvedValue(true);
    render(
      <AuthGuard>
        <p>secret content</p>
      </AuthGuard>,
    );
    expect(await screen.findByText("secret content")).toBeInTheDocument();
    expect(replaceMock).not.toHaveBeenCalled();
  });
});
