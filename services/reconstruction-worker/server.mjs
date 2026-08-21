import { createHash, createHmac, randomUUID, timingSafeEqual } from "node:crypto";
import { createReadStream } from "node:fs";
import { copyFile, mkdir, readFile, readdir, rename, stat, writeFile } from "node:fs/promises";
import http from "node:http";
import path from "node:path";
import { pathToFileURL } from "node:url";
import { runApplePipeline } from "./apple-pipeline.mjs";
import { runColmapPipeline } from "./pipeline.mjs";

const MAX_JSON_BYTES = 64 * 1024;
const MAX_PHOTO_BYTES = 8 * 1024 * 1024;
const AUTH_WINDOW_MS = 5 * 60_000;
const JOB_ID = /^rjob_[a-f0-9]{32}$/;
const JOB_STATUSES = new Set(["UPLOADING", "QUEUED", "PROCESSING", "SUCCEEDED", "FAILED"]);
const PHOTO_TYPES = new Map([
  ["image/jpeg", "jpg"],
  ["image/png", "png"],
]);

function json(response, status, value) {
  const body = Buffer.from(JSON.stringify(value));
  response.writeHead(status, {
    "Content-Type": "application/json",
    "Content-Length": body.byteLength,
    "Cache-Control": "no-store",
  });
  response.end(body);
}

async function readBounded(request, maximum) {
  const chunks = [];
  let total = 0;
  for await (const chunk of request) {
    total += chunk.byteLength;
    if (total > maximum)
      throw Object.assign(new Error("Request body is too large."), { status: 413 });
    chunks.push(chunk);
  }
  return Buffer.concat(chunks, total);
}

function safeEqual(left, right) {
  const a = Buffer.from(left);
  const b = Buffer.from(right);
  return a.byteLength === b.byteLength && timingSafeEqual(a, b);
}

function parseJobPath(pathname) {
  const match = pathname.match(/^\/v1\/jobs\/([^/]+)(?:\/(photos\/(\d+)|start|result))?$/);
  if (!match) return null;
  const id = decodeURIComponent(match[1]);
  if (!JOB_ID.test(id)) return null;
  return { id, action: match[2] ?? null, photoIndex: match[3] ? Number(match[3]) : null };
}

function matchesImageSignature(type, body) {
  if (type === "image/jpeg") {
    return body.byteLength >= 3 && body[0] === 0xff && body[1] === 0xd8 && body[2] === 0xff;
  }
  return (
    type === "image/png" &&
    body.byteLength >= 8 &&
    body.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]))
  );
}

function isRecoverableJob(job, expectedId) {
  return (
    job !== null &&
    typeof job === "object" &&
    !Array.isArray(job) &&
    job.id === expectedId &&
    typeof job.name === "string" &&
    job.name.length > 0 &&
    job.name.length <= 160 &&
    Number.isInteger(job.photoCount) &&
    job.photoCount >= 20 &&
    job.photoCount <= 40 &&
    job.photos !== null &&
    typeof job.photos === "object" &&
    !Array.isArray(job.photos) &&
    JOB_STATUSES.has(job.status) &&
    Number.isInteger(job.attempts) &&
    job.attempts >= 0 &&
    job.attempts <= 1_000
  );
}

export function createReconstructionWorker({
  dataPath,
  sharedSecret,
  runPipeline = runColmapPipeline,
  engineName = "stroman-colmap-v1",
  now = Date.now,
  logger = console,
}) {
  if (!dataPath) throw new Error("STROMAN_RECONSTRUCTION_DATA_PATH is required.");
  if (Buffer.byteLength(sharedSecret ?? "") < 32) {
    throw new Error("STROMAN_RECONSTRUCTION_WORKER_SECRET must be at least 32 bytes.");
  }
  const jobs = new Map();
  const queue = [];
  const nonces = new Map();
  let active = false;

  const jobDirectory = (id) => path.join(dataPath, id);
  const metadataPath = (id) => path.join(jobDirectory(id), "job.json");

  async function persist(job) {
    const destination = metadataPath(job.id);
    const temporary = `${destination}.${randomUUID()}.tmp`;
    await writeFile(temporary, JSON.stringify(job), { mode: 0o600 });
    await rename(temporary, destination);
    jobs.set(job.id, job);
  }

  async function loadJobs() {
    await mkdir(dataPath, { recursive: true, mode: 0o700 });
    for (const entry of await readdir(dataPath, { withFileTypes: true })) {
      if (!entry.isDirectory() || !JOB_ID.test(entry.name)) continue;
      try {
        const job = JSON.parse(await readFile(metadataPath(entry.name), "utf8"));
        if (!isRecoverableJob(job, entry.name)) {
          logger.error?.(`Ignored invalid reconstruction metadata for ${entry.name}.`);
          continue;
        }
        if (job.status === "PROCESSING") {
          job.status = "QUEUED";
          job.phase = "QUEUED";
          job.failureCode = null;
          await persist(job);
        } else {
          jobs.set(job.id, job);
        }
        if (job.status === "QUEUED") queue.push(job.id);
      } catch (error) {
        logger.error?.(`Could not recover reconstruction job ${entry.name}: ${error.message}`);
      }
    }
  }

  async function processJob(id) {
    let job = jobs.get(id);
    if (!job || job.status !== "QUEUED") return;
    job = {
      ...job,
      status: "PROCESSING",
      phase: "ALIGNING",
      percent: 1,
      attempts: (job.attempts ?? 0) + 1,
      startedAt: new Date(now()).toISOString(),
      updatedAt: new Date(now()).toISOString(),
    };
    await persist(job);
    try {
      const attemptPath = path.join(jobDirectory(id), "attempts", String(job.attempts));
      await mkdir(attemptPath, { recursive: true, mode: 0o700 });
      const resultPath = await runPipeline(attemptPath, {
        imagesPath: path.join(jobDirectory(id), "images"),
        onProgress: async ({ phase, percent }) => {
          job = {
            ...job,
            phase,
            percent,
            updatedAt: new Date(now()).toISOString(),
          };
          await persist(job);
        },
        log: (message) => logger.info?.(`[${id}] ${message.trim()}`),
      });
      const result = await stat(resultPath);
      const publishedResult = path.join(jobDirectory(id), "result.glb");
      const temporaryResult = `${publishedResult}.${randomUUID()}.tmp`;
      await copyFile(resultPath, temporaryResult);
      await rename(temporaryResult, publishedResult);
      job = {
        ...job,
        status: "SUCCEEDED",
        phase: null,
        percent: 100,
        resultBytes: result.size,
        failureCode: null,
        completedAt: new Date(now()).toISOString(),
        updatedAt: new Date(now()).toISOString(),
      };
      await persist(job);
    } catch (error) {
      logger.error?.(`Reconstruction job ${id} failed: ${error.message}`);
      job = {
        ...job,
        status: "FAILED",
        phase: null,
        percent: null,
        failureCode: "PIPELINE_FAILED",
        completedAt: new Date(now()).toISOString(),
        updatedAt: new Date(now()).toISOString(),
      };
      await persist(job);
    }
  }

  async function pump() {
    if (active) return;
    active = true;
    try {
      while (queue.length > 0) await processJob(queue.shift());
    } finally {
      active = false;
      if (queue.length > 0) void pump();
    }
  }

  function authenticate(request, pathname, body) {
    const authorization = request.headers.authorization ?? "";
    const timestamp = request.headers["x-stroman-timestamp"];
    const nonce = request.headers["x-stroman-nonce"];
    const claimedHash = request.headers["x-content-sha256"];
    if (
      !authorization.startsWith("Stroman-HMAC-SHA256 ") ||
      typeof timestamp !== "string" ||
      typeof nonce !== "string" ||
      typeof claimedHash !== "string" ||
      !/^[a-f0-9]{64}$/.test(claimedHash) ||
      !/^[a-zA-Z0-9-]{8,100}$/.test(nonce)
    ) {
      return false;
    }
    const timestampMs = Number(timestamp);
    if (!Number.isFinite(timestampMs) || Math.abs(now() - timestampMs) > AUTH_WINDOW_MS)
      return false;
    for (const [seen, expiresAt] of nonces) if (expiresAt <= now()) nonces.delete(seen);
    if (nonces.has(nonce)) return false;
    const actualHash = createHash("sha256").update(body).digest("hex");
    if (!safeEqual(actualHash, claimedHash)) return false;
    const canonical = `${request.method}\n${pathname}\n${timestamp}\n${nonce}\n${actualHash}`;
    const expected = createHmac("sha256", sharedSecret).update(canonical).digest("hex");
    const supplied = authorization.slice("Stroman-HMAC-SHA256 ".length);
    if (!safeEqual(expected, supplied)) return false;
    nonces.set(nonce, now() + AUTH_WINDOW_MS);
    return true;
  }

  async function handler(request, response) {
    const url = new URL(request.url ?? "/", "http://worker.local");
    if (request.method === "GET" && url.pathname === "/health/ready") {
      return json(response, 200, { status: "ready", engine: engineName });
    }
    const isPhoto = request.method === "PUT" && /\/photos\/\d+$/.test(url.pathname);
    let body;
    try {
      body = await readBounded(request, isPhoto ? MAX_PHOTO_BYTES : MAX_JSON_BYTES);
    } catch (error) {
      return json(response, error.status ?? 400, { error: "INVALID_BODY" });
    }
    if (!authenticate(request, url.pathname, body)) {
      return json(response, 401, { error: "UNAUTHORIZED" });
    }

    try {
      if (request.method === "POST" && url.pathname === "/v1/jobs") {
        const input = JSON.parse(body.toString("utf8"));
        if (
          typeof input.name !== "string" ||
          !input.name.trim() ||
          input.name.trim().length > 160 ||
          !Number.isInteger(input.photoCount) ||
          input.photoCount < 20 ||
          input.photoCount > 40 ||
          (input.idempotencyKey !== undefined &&
            (typeof input.idempotencyKey !== "string" ||
              !/^[a-zA-Z0-9:_-]{8,160}$/.test(input.idempotencyKey)))
        ) {
          return json(response, 400, { error: "INVALID_JOB" });
        }
        const id = input.idempotencyKey
          ? `rjob_${createHash("sha256").update(input.idempotencyKey).digest("hex").slice(0, 32)}`
          : `rjob_${randomUUID().replaceAll("-", "")}`;
        const existing = jobs.get(id);
        if (existing) {
          if (existing.name !== input.name.trim() || existing.photoCount !== input.photoCount) {
            return json(response, 409, { error: "IDEMPOTENCY_CONFLICT" });
          }
          return json(response, 201, { jobId: id });
        }
        await mkdir(path.join(jobDirectory(id), "images"), { recursive: true, mode: 0o700 });
        const createdAt = new Date(now()).toISOString();
        await persist({
          id,
          name: input.name.trim(),
          photoCount: input.photoCount,
          photos: {},
          status: "UPLOADING",
          phase: "UPLOADING",
          percent: 0,
          failureCode: null,
          resultBytes: null,
          attempts: 0,
          createdAt,
          updatedAt: createdAt,
          startedAt: null,
          completedAt: null,
        });
        return json(response, 201, { jobId: id });
      }

      const route = parseJobPath(url.pathname);
      const job = route ? jobs.get(route.id) : null;
      if (!route || !job) return json(response, 404, { error: "NOT_FOUND" });

      if (request.method === "PUT" && route.action?.startsWith("photos/")) {
        const type = request.headers["content-type"]?.split(";", 1)[0];
        const extension = PHOTO_TYPES.get(type);
        const claimed = request.headers["x-stroman-photo-hash"];
        if (
          job.status !== "UPLOADING" ||
          route.photoIndex === null ||
          route.photoIndex < 0 ||
          route.photoIndex >= job.photoCount ||
          !extension ||
          body.byteLength === 0 ||
          !matchesImageSignature(type, body) ||
          typeof claimed !== "string"
        ) {
          return json(response, 409, { error: "INVALID_PHOTO" });
        }
        const actual = `sha256:${createHash("sha256").update(body).digest("hex")}`;
        if (!safeEqual(actual, claimed))
          return json(response, 400, { error: "PHOTO_HASH_MISMATCH" });
        const fileName = `image-${String(route.photoIndex + 1).padStart(4, "0")}.${extension}`;
        const destination = path.join(jobDirectory(job.id), "images", fileName);
        const temporary = `${destination}.${randomUUID()}.tmp`;
        await writeFile(temporary, body, { mode: 0o600 });
        await rename(temporary, destination);
        job.photos[String(route.photoIndex)] = {
          hash: actual,
          fileName,
          byteSize: body.byteLength,
        };
        job.percent = Math.min(
          4,
          Math.floor((Object.keys(job.photos).length / job.photoCount) * 4),
        );
        job.updatedAt = new Date(now()).toISOString();
        await persist(job);
        return json(response, 200, { ok: true });
      }

      if (request.method === "POST" && route.action === "start") {
        if (job.status !== "UPLOADING" || Object.keys(job.photos).length !== job.photoCount) {
          return json(response, 409, { error: "CAPTURE_INCOMPLETE" });
        }
        job.status = "QUEUED";
        job.phase = "QUEUED";
        job.percent = 4;
        job.updatedAt = new Date(now()).toISOString();
        await persist(job);
        queue.push(job.id);
        void pump();
        return json(response, 202, { ok: true });
      }

      if (request.method === "GET" && route.action === null) {
        return json(response, 200, {
          status: job.status,
          phase: job.phase,
          percent: job.percent,
          failureCode: job.failureCode,
        });
      }

      if (request.method === "GET" && route.action === "result") {
        if (job.status !== "SUCCEEDED") return json(response, 409, { error: "RESULT_NOT_READY" });
        const resultPath = path.join(jobDirectory(job.id), "result.glb");
        const result = await stat(resultPath);
        response.writeHead(200, {
          "Content-Type": "model/gltf-binary",
          "Content-Length": result.size,
          "X-Stroman-File-Name": "reconstructed-location.glb",
          "Cache-Control": "no-store",
        });
        return createReadStream(resultPath).pipe(response);
      }

      return json(response, 405, { error: "METHOD_NOT_ALLOWED" });
    } catch (error) {
      logger.error?.(`Worker request failed: ${error.message}`);
      return json(response, 500, { error: "INTERNAL" });
    }
  }

  const server = http.createServer((request, response) => void handler(request, response));
  server.headersTimeout = 15_000;
  server.requestTimeout = 3 * 60_000;
  server.keepAliveTimeout = 5_000;
  server.maxHeadersCount = 40;
  return {
    server,
    async initialize() {
      await loadJobs();
      void pump();
    },
  };
}

async function main() {
  const engine = process.env.STROMAN_RECONSTRUCTION_ENGINE ?? "colmap";
  if (!new Set(["apple", "colmap"]).has(engine)) {
    throw new Error("STROMAN_RECONSTRUCTION_ENGINE must be apple or colmap.");
  }
  const worker = createReconstructionWorker({
    dataPath: process.env.STROMAN_RECONSTRUCTION_DATA_PATH,
    sharedSecret: process.env.STROMAN_RECONSTRUCTION_WORKER_SECRET,
    runPipeline: engine === "apple" ? runApplePipeline : runColmapPipeline,
    engineName: engine === "apple" ? "stroman-apple-v1" : "stroman-colmap-v1",
  });
  await worker.initialize();
  const port = Number(process.env.PORT ?? 8080);
  worker.server.listen(port, "0.0.0.0", () =>
    console.log(`Stroman reconstruction worker (${engine}) on ${port}`),
  );
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  await main();
}
