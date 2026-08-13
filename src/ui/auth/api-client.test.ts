import { afterEach, describe, expect, it, vi } from "vitest";
import {
  ApiRequestError,
  createProject,
  friendlyError,
  getSession,
  listProjects,
  signOut,
  startOtp,
  verifyOtp,
} from "./api-client";

function stubFetch(status: number, body: unknown) {
  vi.stubGlobal(
    "fetch",
    vi.fn(async () => ({
      ok: status >= 200 && status < 300,
      status,
      text: async () => (body === undefined ? "" : JSON.stringify(body)),
    })),
  );
}

function stubRawFetch(status: number, body: string) {
  vi.stubGlobal(
    "fetch",
    vi.fn(async () => ({
      ok: status >= 200 && status < 300,
      status,
      text: async () => body,
    })),
  );
}

afterEach(() => vi.unstubAllGlobals());

describe("api-client", () => {
  it("getSession distinguishes authorized, denied, signed-out, and unavailable state", async () => {
    stubFetch(200, { authenticated: true, privateBetaAccess: true });
    expect(await getSession()).toEqual({ state: "AUTHORIZED" });
    stubFetch(200, { authenticated: true, privateBetaAccess: false });
    expect(await getSession()).toEqual({ state: "PRIVATE_BETA_DENIED" });
    stubFetch(200, { authenticated: false, privateBetaAccess: false });
    expect(await getSession()).toEqual({ state: "SIGNED_OUT" });
    stubFetch(401, { error: { code: "AUTHENTICATION_REQUIRED", message: "Sign in." } });
    expect(await getSession()).toEqual({ state: "SIGNED_OUT" });
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => {
        throw new Error("network");
      }),
    );
    expect(await getSession()).toEqual({ state: "UNAVAILABLE" });
  });

  it("startOtp resolves on 200 and throws a typed error on 429", async () => {
    stubFetch(200, { message: "sent" });
    await expect(startOtp("a@b.co")).resolves.toEqual({ message: "sent" });
    stubFetch(429, { error: { code: "RATE_LIMITED", message: "Too many requests." } });
    await expect(startOtp("a@b.co")).rejects.toMatchObject({ status: 429, code: "RATE_LIMITED" });
  });

  it("verifyOtp surfaces INVALID_OTP as a typed ApiRequestError", async () => {
    stubFetch(401, { error: { code: "INVALID_OTP", message: "bad code" } });
    const err = await verifyOtp("a@b.co", "000000").catch((e) => e);
    expect(err).toBeInstanceOf(ApiRequestError);
    expect(err).toMatchObject({ status: 401, code: "INVALID_OTP" });
  });

  it("createProject returns the project on 201 and throws on 422", async () => {
    stubFetch(201, { id: "proj_1", name: "Reel", status: "DRAFT" });
    await expect(createProject("Reel")).resolves.toMatchObject({ id: "proj_1", name: "Reel" });
    stubFetch(422, { error: { code: "UNPROCESSABLE_ENTITY", message: "nope" } });
    await expect(createProject("x")).rejects.toMatchObject({ status: 422 });
  });

  it("listProjects returns items", async () => {
    stubFetch(200, { items: [{ id: "proj_1", name: "A", status: "DRAFT" }] });
    const items = await listProjects();
    expect(items).toHaveLength(1);
    expect(items[0]?.name).toBe("A");
  });

  it("turns a plain-text proxy response into a typed error without leaking parser details", async () => {
    stubRawFetch(502, "upstream error");
    const error = await listProjects().catch((caught) => caught);

    expect(error).toBeInstanceOf(ApiRequestError);
    expect(error).toMatchObject({ status: 502, code: "INVALID_UPSTREAM_RESPONSE" });
    expect(error.message).not.toContain("upstream error");
    expect(error.message).not.toContain("Unexpected token");
  });

  it("signOut resolves on 200", async () => {
    stubFetch(200, { ok: true });
    await expect(signOut()).resolves.toEqual({ ok: true });
  });
});

describe("friendlyError — status-specific messages", () => {
  it("maps 401 codes to a session-expired prompt", () => {
    expect(friendlyError(new ApiRequestError(401, "AUTHENTICATION_REQUIRED", "x"))).toBe(
      "Your session expired. Please sign in again.",
    );
    expect(friendlyError(new ApiRequestError(401, "INVALID_SESSION", "x"))).toBe(
      "Your session expired. Please sign in again.",
    );
  });

  it("maps 403 codes to a permission message", () => {
    expect(friendlyError(new ApiRequestError(403, "FORBIDDEN", "x"))).toBe(
      "You do not have permission to access this resource.",
    );
    expect(friendlyError(new ApiRequestError(403, "ACCOUNT_DISABLED", "x"))).toBe(
      "You do not have permission to access this resource.",
    );
    expect(friendlyError(new ApiRequestError(403, "REQUEST_ORIGIN_REJECTED", "x"))).toBe(
      "You do not have permission to access this resource.",
    );
  });

  it("maps 503 codes to a service-unavailable message", () => {
    expect(friendlyError(new ApiRequestError(503, "SERVICE_UNAVAILABLE", "x"))).toBe(
      "A required service is unavailable.",
    );
    expect(friendlyError(new ApiRequestError(503, "AUTHENTICATION_UNAVAILABLE", "x"))).toBe(
      "A required service is unavailable.",
    );
  });

  it("keeps generic proxy errors endpoint-neutral and creative pending guidance non-duplicating", () => {
    expect(friendlyError(new ApiRequestError(502, "INVALID_UPSTREAM_RESPONSE", "x"))).toBe(
      "The service returned an unexpected response. Please try again.",
    );
    expect(friendlyError(new ApiRequestError(504, "CREATIVE_DEVELOPMENT_PENDING", "x"))).toBe(
      "Creative development is still finishing. Keep this page open or return shortly; do not submit it again.",
    );
  });

  it("falls back to the status family when the code is unrecognized", () => {
    expect(friendlyError(new ApiRequestError(401, "SOMETHING_NEW", "x"))).toBe(
      "Your session expired. Please sign in again.",
    );
    expect(friendlyError(new ApiRequestError(403, "SOMETHING_NEW", "x"))).toBe(
      "You do not have permission to access this resource.",
    );
    expect(friendlyError(new ApiRequestError(503, "SOMETHING_NEW", "x"))).toBe(
      "A required service is unavailable.",
    );
  });
});
