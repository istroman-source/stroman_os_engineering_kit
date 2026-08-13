import { afterEach, describe, expect, it, vi } from "vitest";
import { analyzeProject, type Analysis, type AnalyzeFields } from "./creative-api";
import { creativeAnalysisFixture } from "./creative-test-fixtures";

const FIELDS: AnalyzeFields = {
  title: "A cup crosses a working harbor before the first ferry leaves",
  client: "Harbor Light Coffee",
  projectType: "Commercial",
  creativeGoal: "Make the ritual feel earned",
  targetAudience: "Working commuters",
  desiredEmotion: "Bracing tenderness",
  context: "One dawn; no interruption to ferry operations.",
};

function response(status: number, body: unknown, raw = false) {
  return {
    ok: status >= 200 && status < 300,
    status,
    text: async () => (raw ? String(body) : JSON.stringify(body)),
    headers: { get: () => null },
  };
}

function analysis(updatedAt: string): Analysis {
  const fixture = creativeAnalysisFixture();
  return { ...fixture, brief: { ...fixture.brief, updatedAt } };
}

afterEach(() => {
  vi.useRealTimers();
  vi.unstubAllGlobals();
});

describe("analyzeProject edge recovery", () => {
  it("returns the direct hosted result when the POST completes through the edge", async () => {
    const completed = analysis("2026-08-13T20:00:00.000Z");
    const fetch = vi
      .fn()
      .mockResolvedValueOnce(response(404, { error: { code: "NOT_FOUND" } }))
      .mockResolvedValueOnce(response(200, completed));
    vi.stubGlobal("fetch", fetch);

    await expect(analyzeProject("proj_1", FIELDS)).resolves.toEqual(completed);
    expect(fetch).toHaveBeenCalledTimes(2);
  });

  it("keeps polling until a new analysis is committed after a plain-text edge timeout", async () => {
    vi.useFakeTimers();
    const completed = analysis("2026-08-13T20:05:00.000Z");
    const fetch = vi
      .fn()
      .mockResolvedValueOnce(response(404, { error: { code: "NOT_FOUND" } }))
      .mockResolvedValueOnce(response(502, "upstream error", true))
      .mockResolvedValueOnce(response(404, { error: { code: "NOT_FOUND" } }))
      .mockResolvedValueOnce(response(200, completed));
    vi.stubGlobal("fetch", fetch);

    const pending = analyzeProject("proj_1", FIELDS);
    await vi.advanceTimersByTimeAsync(10_000);

    await expect(pending).resolves.toEqual(completed);
    expect(fetch).toHaveBeenCalledTimes(4);
  });

  it("does not mistake a stale blueprint for a completed re-development", async () => {
    vi.useFakeTimers();
    const stale = analysis("2026-08-13T20:00:00.000Z");
    const revised = analysis("2026-08-13T20:10:00.000Z");
    const fetch = vi
      .fn()
      .mockResolvedValueOnce(response(200, stale))
      .mockResolvedValueOnce(response(504, "upstream error", true))
      .mockResolvedValueOnce(response(200, stale))
      .mockResolvedValueOnce(response(200, revised));
    vi.stubGlobal("fetch", fetch);

    const pending = analyzeProject("proj_1", FIELDS);
    await vi.advanceTimersByTimeAsync(10_000);

    await expect(pending).resolves.toEqual(revised);
    expect(fetch).toHaveBeenCalledTimes(4);
  });

  it("stops at the full hosted-pipeline recovery bound with non-duplicating guidance", async () => {
    vi.useFakeTimers();
    const fetch = vi
      .fn()
      .mockResolvedValueOnce(response(404, { error: { code: "NOT_FOUND" } }))
      .mockResolvedValueOnce(response(504, "upstream error", true))
      .mockResolvedValue(response(404, { error: { code: "NOT_FOUND" } }));
    vi.stubGlobal("fetch", fetch);

    const pending = analyzeProject("proj_1", FIELDS);
    const rejection = expect(pending).rejects.toMatchObject({
      status: 504,
      code: "CREATIVE_DEVELOPMENT_PENDING",
    });
    await vi.advanceTimersByTimeAsync(41 * 60_000);

    await rejection;
    expect(fetch.mock.calls.filter(([, init]) => init?.method === "POST")).toHaveLength(1);
  });

  it("propagates a non-recoverable authorization failure encountered while polling", async () => {
    vi.useFakeTimers();
    const fetch = vi
      .fn()
      .mockResolvedValueOnce(response(404, { error: { code: "NOT_FOUND" } }))
      .mockResolvedValueOnce(response(502, "upstream error", true))
      .mockResolvedValueOnce(
        response(401, { error: { code: "AUTHENTICATION_REQUIRED", message: "Sign in." } }),
      );
    vi.stubGlobal("fetch", fetch);

    const pending = analyzeProject("proj_1", FIELDS);
    const rejection = expect(pending).rejects.toMatchObject({
      status: 401,
      code: "AUTHENTICATION_REQUIRED",
    });
    await vi.advanceTimersByTimeAsync(5_000);

    await rejection;
    expect(fetch).toHaveBeenCalledTimes(3);
  });
});
