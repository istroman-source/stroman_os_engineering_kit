import { afterEach, describe, expect, it, vi } from "vitest";
import {
  ApiRequestError,
  createProject,
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

afterEach(() => vi.unstubAllGlobals());

describe("api-client", () => {
  it("getSession returns true/false and never throws", async () => {
    stubFetch(200, { authenticated: true });
    expect(await getSession()).toBe(true);
    stubFetch(200, { authenticated: false });
    expect(await getSession()).toBe(false);
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => {
        throw new Error("network");
      }),
    );
    expect(await getSession()).toBe(false);
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

  it("signOut resolves on 200", async () => {
    stubFetch(200, { ok: true });
    await expect(signOut()).resolves.toEqual({ ok: true });
  });
});
