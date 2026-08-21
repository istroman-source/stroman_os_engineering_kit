import { createHash, createHmac } from "node:crypto";
import { mkdir, mkdtemp, readFile, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { afterEach, describe, expect, it } from "vitest";
import { createReconstructionWorker } from "./server.mjs";

const secret = "w".repeat(32);
const servers = [];

afterEach(async () => {
  await Promise.all(
    servers.splice(0).map((server) => new Promise((resolve) => server.close(() => resolve()))),
  );
});

function signedHeaders(method, pathname, body, nonce) {
  const timestamp = "1777000000000";
  const hash = createHash("sha256").update(body).digest("hex");
  const canonical = `${method}\n${pathname}\n${timestamp}\n${nonce}\n${hash}`;
  const signature = createHmac("sha256", secret).update(canonical).digest("hex");
  return {
    Authorization: `Stroman-HMAC-SHA256 ${signature}`,
    "X-Stroman-Timestamp": timestamp,
    "X-Stroman-Nonce": nonce,
    "X-Content-SHA256": hash,
  };
}

describe("Stroman reconstruction worker", () => {
  it("preserves uploads, reports live stages, and serves only the completed GLB", async () => {
    const dataPath = await mkdtemp(path.join(os.tmpdir(), "stroman-worker-"));
    let releasePipeline;
    const holdPipeline = new Promise((resolve) => {
      releasePipeline = resolve;
    });
    const worker = createReconstructionWorker({
      dataPath,
      sharedSecret: secret,
      now: () => 1_777_000_000_000,
      logger: { info() {}, error() {} },
      runPipeline: async (workspace, { onProgress }) => {
        await onProgress({ phase: "DENSIFYING", percent: 55 });
        await holdPipeline;
        const result = path.join(workspace, "result.glb");
        await writeFile(result, Buffer.from("glTF-room"));
        return result;
      },
    });
    await worker.initialize();
    await new Promise((resolve) => worker.server.listen(0, "127.0.0.1", resolve));
    servers.push(worker.server);
    const address = worker.server.address();
    const base = `http://127.0.0.1:${address.port}`;
    let nonce = 0;
    const call = async (method, pathname, value, extraHeaders = {}) => {
      const body =
        value === undefined
          ? Buffer.alloc(0)
          : Buffer.isBuffer(value)
            ? value
            : Buffer.from(JSON.stringify(value));
      return fetch(`${base}${pathname}`, {
        method,
        headers: {
          ...signedHeaders(method, pathname, body, `nonce-${String(++nonce).padStart(8, "0")}`),
          ...(value !== undefined && !Buffer.isBuffer(value)
            ? { "Content-Type": "application/json" }
            : {}),
          ...extraHeaders,
        },
        body: method === "GET" ? undefined : body,
      });
    };

    const createdResponse = await call("POST", "/v1/jobs", {
      name: "Office",
      photoCount: 20,
      idempotencyKey: "location:lrec_workertest",
    });
    expect(createdResponse.status).toBe(201);
    const { jobId } = await createdResponse.json();
    const repeated = await call("POST", "/v1/jobs", {
      name: "Office",
      photoCount: 20,
      idempotencyKey: "location:lrec_workertest",
    });
    await expect(repeated.json()).resolves.toEqual({ jobId });
    for (let index = 0; index < 20; index += 1) {
      const photo = Buffer.from([0xff, 0xd8, 0xff, index]);
      const hash = `sha256:${createHash("sha256").update(photo).digest("hex")}`;
      const upload = await call("PUT", `/v1/jobs/${jobId}/photos/${index}`, photo, {
        "Content-Type": "image/jpeg",
        "X-Stroman-Photo-Hash": hash,
      });
      expect(upload.status).toBe(200);
    }
    const started = await call("POST", `/v1/jobs/${jobId}/start`, {});
    expect(started.status).toBe(202);
    await new Promise((resolve) => setTimeout(resolve, 20));
    const processing = await call("GET", `/v1/jobs/${jobId}`);
    await expect(processing.json()).resolves.toMatchObject({
      status: "PROCESSING",
      phase: "DENSIFYING",
      percent: 55,
    });

    releasePipeline();
    let completed;
    for (let attempt = 0; attempt < 20; attempt += 1) {
      await new Promise((resolve) => setTimeout(resolve, 10));
      completed = await call("GET", `/v1/jobs/${jobId}`);
      const value = await completed.clone().json();
      if (value.status === "SUCCEEDED") break;
    }
    await expect(completed.json()).resolves.toMatchObject({ status: "SUCCEEDED", percent: 100 });
    const result = await call("GET", `/v1/jobs/${jobId}/result`);
    expect(result.status).toBe(200);
    expect(Buffer.from(await result.arrayBuffer()).toString()).toBe("glTF-room");
  });

  it("rejects replayed signed requests", async () => {
    const dataPath = await mkdtemp(path.join(os.tmpdir(), "stroman-worker-auth-"));
    const worker = createReconstructionWorker({
      dataPath,
      sharedSecret: secret,
      now: () => 1_777_000_000_000,
      logger: { info() {}, error() {} },
    });
    await worker.initialize();
    await new Promise((resolve) => worker.server.listen(0, "127.0.0.1", resolve));
    servers.push(worker.server);
    const address = worker.server.address();
    const body = Buffer.from(JSON.stringify({ name: "Office", photoCount: 20 }));
    const headers = {
      ...signedHeaders("POST", "/v1/jobs", body, "nonce-replay-0001"),
      "Content-Type": "application/json",
    };

    const first = await fetch(`http://127.0.0.1:${address.port}/v1/jobs`, {
      method: "POST",
      headers,
      body,
    });
    expect(first.status).toBe(201);
    const replay = await fetch(`http://127.0.0.1:${address.port}/v1/jobs`, {
      method: "POST",
      headers,
      body,
    });
    expect(replay.status).toBe(401);
  });

  it("recovers an interrupted job into a clean attempt without touching source photos", async () => {
    const dataPath = await mkdtemp(path.join(os.tmpdir(), "stroman-worker-recovery-"));
    const jobId = "rjob_1234567890abcdef1234567890abcdef";
    const jobPath = path.join(dataPath, jobId);
    const imagesPath = path.join(jobPath, "images");
    await mkdir(imagesPath, { recursive: true });
    await writeFile(path.join(imagesPath, "image-0001.jpg"), Buffer.from([0xff, 0xd8, 0xff, 0]));
    await writeFile(
      path.join(jobPath, "job.json"),
      JSON.stringify({
        id: jobId,
        name: "Office",
        photoCount: 20,
        photos: {},
        status: "PROCESSING",
        phase: "DENSIFYING",
        percent: 50,
        failureCode: null,
        resultBytes: null,
        attempts: 1,
        createdAt: "2026-08-20T12:00:00.000Z",
        updatedAt: "2026-08-20T12:01:00.000Z",
        startedAt: "2026-08-20T12:00:10.000Z",
        completedAt: null,
      }),
    );
    let received;
    const worker = createReconstructionWorker({
      dataPath,
      sharedSecret: secret,
      now: () => 1_777_000_000_000,
      logger: { info() {}, error() {} },
      runPipeline: async (workspace, options) => {
        received = { workspace, imagesPath: options.imagesPath };
        const result = path.join(workspace, "result.glb");
        await mkdir(workspace, { recursive: true });
        await writeFile(result, Buffer.from("glTF-room"));
        return result;
      },
    });

    await worker.initialize();
    let recovered;
    for (let attempt = 0; attempt < 20; attempt += 1) {
      await new Promise((resolve) => setTimeout(resolve, 10));
      recovered = JSON.parse(await readFile(path.join(jobPath, "job.json"), "utf8"));
      if (recovered.status === "SUCCEEDED") break;
    }

    expect(received).toEqual({
      workspace: path.join(jobPath, "attempts", "2"),
      imagesPath,
    });
    expect(recovered).toMatchObject({ status: "SUCCEEDED", attempts: 2, percent: 100 });
    expect(await readFile(path.join(imagesPath, "image-0001.jpg"))).toEqual(
      Buffer.from([0xff, 0xd8, 0xff, 0]),
    );
  });

  it("ignores corrupted persisted metadata instead of deriving an unsafe attempt path", async () => {
    const dataPath = await mkdtemp(path.join(os.tmpdir(), "stroman-worker-corrupt-"));
    const jobId = "rjob_abcdef1234567890abcdef1234567890";
    const jobPath = path.join(dataPath, jobId);
    await mkdir(jobPath, { recursive: true });
    await writeFile(
      path.join(jobPath, "job.json"),
      JSON.stringify({
        id: jobId,
        name: "Office",
        photoCount: 20,
        photos: {},
        status: "PROCESSING",
        attempts: "../../outside",
      }),
    );
    const errors = [];
    let pipelineRuns = 0;
    const worker = createReconstructionWorker({
      dataPath,
      sharedSecret: secret,
      logger: {
        info() {},
        error(message) {
          errors.push(message);
        },
      },
      runPipeline: async () => {
        pipelineRuns += 1;
      },
    });

    await worker.initialize();

    expect(pipelineRuns).toBe(0);
    expect(errors).toContain(`Ignored invalid reconstruction metadata for ${jobId}.`);
  });
});
