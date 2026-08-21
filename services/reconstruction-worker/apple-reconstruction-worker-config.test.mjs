import { describe, expect, it } from "vitest";
import { appleReconstructionWorkerEnvironment } from "../../scripts/apple-reconstruction-worker-config.mjs";

describe("Apple reconstruction worker environment", () => {
  it("passes the freshly compiled photogrammetry binary into the worker process", () => {
    const environment = appleReconstructionWorkerEnvironment(
      { STROMAN_RECONSTRUCTION_WORKER_SECRET: "s".repeat(32) },
      {
        root: "/safe/project",
        port: 3212,
        binary: "/safe/project/.data/apple-reconstruction-worker/stroman-apple-photogrammetry",
        runtimePath: "/safe/project/.data/apple-reconstruction-worker",
      },
    );

    expect(environment).toMatchObject({
      PORT: "3212",
      STROMAN_RECONSTRUCTION_ENGINE: "apple",
      STROMAN_APPLE_PHOTOGRAMMETRY_BIN:
        "/safe/project/.data/apple-reconstruction-worker/stroman-apple-photogrammetry",
      STROMAN_GLTFPACK_BIN: "/safe/project/node_modules/.bin/gltfpack",
      STROMAN_RECONSTRUCTION_DATA_PATH: "/safe/project/.data/apple-reconstruction-worker/jobs",
    });
  });

  it("keeps an explicitly configured private job-data path", () => {
    const environment = appleReconstructionWorkerEnvironment(
      { STROMAN_RECONSTRUCTION_DATA_PATH: "/private/jobs" },
      {
        root: "/safe/project",
        port: 3211,
        binary: "/safe/bin",
        runtimePath: "/safe/runtime",
      },
    );

    expect(environment.STROMAN_RECONSTRUCTION_DATA_PATH).toBe("/private/jobs");
  });

  it("always prefers the freshly compiled binary over an inherited path", () => {
    const environment = appleReconstructionWorkerEnvironment(
      { STROMAN_APPLE_PHOTOGRAMMETRY_BIN: "/untrusted/stale-binary" },
      {
        root: "/safe/project",
        port: 3211,
        binary: "/safe/project/.data/apple-reconstruction-worker/stroman-apple-photogrammetry",
        runtimePath: "/safe/project/.data/apple-reconstruction-worker",
      },
    );

    expect(environment.STROMAN_APPLE_PHOTOGRAMMETRY_BIN).toBe(
      "/safe/project/.data/apple-reconstruction-worker/stroman-apple-photogrammetry",
    );
  });
});
