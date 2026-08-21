import { afterEach, describe, expect, it, vi } from "vitest";
import {
  analyzeProject,
  retryLocationPhotoReconstruction,
  startLocationPhotoReconstruction,
  type Analysis,
  type AnalyzeFields,
} from "./creative-api";
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

describe("location reconstruction upload memory boundary", () => {
  it("retries a failed reconstruction through the preserved-photo endpoint", async () => {
    const fetch = vi.fn().mockResolvedValue(
      response(202, {
        job: {
          id: "lrec_retry",
          name: "Office",
          status: "PROCESSING",
          phase: "QUEUED",
          photoCount: 29,
          environmentId: null,
          failureCode: null,
          createdAt: "2026-08-20T12:00:00.000Z",
          updatedAt: "2026-08-20T12:00:00.000Z",
        },
      }),
    );
    vi.stubGlobal("fetch", fetch);

    await expect(retryLocationPhotoReconstruction("proj_1", "lrec_failed")).resolves.toMatchObject({
      id: "lrec_retry",
      status: "PROCESSING",
    });
    expect(fetch).toHaveBeenCalledWith(
      "/api/v1/projects/proj_1/location-reconstructions/lrec_failed/retry",
      expect.objectContaining({ method: "POST" }),
    );
  });

  it("stages a 40-photo set as bounded single-photo requests before starting the job", async () => {
    const photos = Array.from(
      { length: 40 },
      (_, index) =>
        new File([new Uint8Array([0xff, 0xd8, 0xff, index])], `angle-${index + 1}.jpg`, {
          type: "image/jpeg",
        }),
    );
    const progress = vi.fn();
    const fetch = vi.fn(async (_path: string, init?: RequestInit) => {
      if (init?.body instanceof FormData) {
        expect(init.body.getAll("photo")).toHaveLength(1);
        const photo = init.body.get("photo") as File;
        const index = photos.findIndex((candidate) => candidate.name === photo.name);
        return response(201, { upload: { uploadId: `simp_${index + 1}` } });
      }
      const body = JSON.parse(String(init?.body)) as { name: string; uploadIds: string[] };
      expect(body).toEqual({
        name: "Full office",
        uploadIds: Array.from({ length: 40 }, (_, index) => `simp_${index + 1}`),
      });
      return response(202, {
        job: {
          id: "lrec_1",
          name: body.name,
          status: "PROCESSING",
          phase: "QUEUED",
          photoCount: 40,
          environmentId: null,
          failureCode: null,
          createdAt: "2026-08-20T12:00:00.000Z",
          updatedAt: "2026-08-20T12:00:00.000Z",
        },
      });
    });
    vi.stubGlobal("fetch", fetch);

    await expect(
      startLocationPhotoReconstruction("proj_1", {
        name: "Full office",
        photos,
        onProgress: progress,
      }),
    ).resolves.toMatchObject({ status: "PROCESSING", photoCount: 40 });
    expect(fetch).toHaveBeenCalledTimes(41);
    expect(progress).toHaveBeenLastCalledWith(40, 40);
  });

  it("recovers the committed job when the edge closes after the bounded uploads", async () => {
    const photos = Array.from(
      { length: 20 },
      (_, index) =>
        new File([new Uint8Array([0xff, 0xd8, 0xff, index])], `angle-${index + 1}.jpg`, {
          type: "image/jpeg",
        }),
    );
    const recovered = {
      id: "lrec_recovered",
      name: "Recovered office",
      status: "PROCESSING",
      phase: "PROCESSING",
      photoCount: 20,
      environmentId: null,
      failureCode: null,
      createdAt: "2026-08-20T12:00:00.000Z",
      updatedAt: "2026-08-20T12:00:00.000Z",
    };
    let uploads = 0;
    const fetch = vi.fn(async (_path: string, init?: RequestInit) => {
      if (init?.body instanceof FormData) {
        uploads += 1;
        return response(201, { upload: { uploadId: `simp_${uploads}` } });
      }
      if (init?.method === "POST") return response(502, "upstream error", true);
      return response(200, { job: recovered });
    });
    vi.stubGlobal("fetch", fetch);

    await expect(
      startLocationPhotoReconstruction("proj_1", { name: "Recovered office", photos }),
    ).resolves.toEqual(recovered);
    expect(fetch).toHaveBeenCalledTimes(22);
  });
});
