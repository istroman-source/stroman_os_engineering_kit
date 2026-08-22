import { createHash, createHmac, randomUUID } from "node:crypto";

const appOrigin = (process.env.STROMAN_RECONSTRUCTION_APP_URL ?? "").replace(/\/$/, "");
const localOrigin = (
  process.env.STROMAN_LOCAL_RECONSTRUCTION_URL ?? "http://127.0.0.1:3211"
).replace(/\/$/, "");
const secret = process.env.STROMAN_RECONSTRUCTION_WORKER_SECRET;
const pollMs = Number(process.env.STROMAN_RECONSTRUCTION_POLL_MS ?? "5000");
if (!appOrigin.startsWith("https://"))
  throw new Error("STROMAN_RECONSTRUCTION_APP_URL must be the HTTPS Stroman app URL.");
if (!secret || Buffer.byteLength(secret) < 32)
  throw new Error("STROMAN_RECONSTRUCTION_WORKER_SECRET must be at least 32 bytes.");

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function signedFetch(origin, path, init = {}, extraHeaders = {}) {
  const bytes = init.body
    ? new Uint8Array(await new Response(init.body).arrayBuffer())
    : new Uint8Array();
  const timestamp = String(Date.now());
  const nonce = randomUUID();
  const hash = createHash("sha256").update(bytes).digest("hex");
  const signature = createHmac("sha256", secret)
    .update(`${init.method ?? "GET"}\n${path}\n${timestamp}\n${nonce}\n${hash}`)
    .digest("hex");
  return fetch(`${origin}${path}`, {
    ...init,
    body: bytes.byteLength ? bytes : undefined,
    headers: {
      ...(init.headers ?? {}),
      ...extraHeaders,
      Authorization: `Stroman-HMAC-SHA256 ${signature}`,
      "X-Stroman-Timestamp": timestamp,
      "X-Stroman-Nonce": nonce,
      "X-Content-Sha256": hash,
    },
  });
}

async function requireResponse(response, label) {
  if (!response.ok) throw new Error(`${label} failed (${response.status}).`);
  return response;
}

async function waitForLocalWorker() {
  for (;;) {
    try {
      const response = await fetch(`${localOrigin}/health/ready`, {
        signal: AbortSignal.timeout(3000),
      });
      if (response.ok) return;
    } catch {}
    await sleep(1000);
  }
}

async function runJob(job) {
  console.log(`Leased room reconstruction ${job.id}; downloading preserved evidence.`);
  const localCreate = await signedFetch(localOrigin, "/v1/jobs", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name: job.name, photoCount: job.photos.length, idempotencyKey: job.id }),
  });
  const localJob = await requireResponse(localCreate, "Create local job").then((r) => r.json());
  const initialStatus = await signedFetch(
    localOrigin,
    `/v1/jobs/${encodeURIComponent(localJob.jobId)}`,
    { method: "GET" },
  )
    .then((response) => requireResponse(response, "Read local reconstruction"))
    .then((response) => response.json());
  if (initialStatus.status === "UPLOADING")
    for (const photo of job.photos) {
      const remote = await signedFetch(
        appOrigin,
        photo.path,
        { method: "GET" },
        { "X-Stroman-Worker-Lease": job.leaseId },
      );
      await requireResponse(remote, "Download room photo");
      const bytes = new Uint8Array(await remote.arrayBuffer());
      const actual = `sha256:${createHash("sha256").update(bytes).digest("hex")}`;
      if (bytes.byteLength !== photo.byteSize || actual !== photo.contentHash)
        throw new Error("A preserved room photo failed its integrity check.");
      const local = await signedFetch(
        localOrigin,
        `/v1/jobs/${encodeURIComponent(localJob.jobId)}/photos/${photo.index}`,
        {
          method: "PUT",
          headers: { "Content-Type": photo.contentType, "X-Stroman-Photo-Hash": actual },
          body: bytes,
        },
      );
      await requireResponse(local, "Stage local room photo");
    }
  if (initialStatus.status === "UPLOADING") {
    const started = await signedFetch(
      localOrigin,
      `/v1/jobs/${encodeURIComponent(localJob.jobId)}/start`,
      { method: "POST" },
    );
    if (!started.ok && started.status !== 409)
      await requireResponse(started, "Start local reconstruction");
  }
  for (;;) {
    await sleep(pollMs);
    const statusResponse = await signedFetch(
      localOrigin,
      `/v1/jobs/${encodeURIComponent(localJob.jobId)}`,
      { method: "GET" },
    );
    const status = await requireResponse(statusResponse, "Read local reconstruction").then((r) =>
      r.json(),
    );
    if (status.status === "FAILED")
      throw new Error(
        "The local Apple reconstruction failed; its source photos remain available to retry.",
      );
    if (status.status !== "SUCCEEDED") continue;
    const result = await signedFetch(
      localOrigin,
      `/v1/jobs/${encodeURIComponent(localJob.jobId)}/result`,
      { method: "GET" },
    );
    await requireResponse(result, "Read local room result");
    const bytes = new Uint8Array(await result.arrayBuffer());
    const completed = await signedFetch(
      appOrigin,
      job.resultPath ?? `/api/v1/reconstruction-worker/jobs/${encodeURIComponent(job.id)}/result`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "model/gltf-binary",
          "X-Stroman-Worker-Lease": job.leaseId,
          "X-Stroman-Result-File-Name":
            result.headers.get("x-stroman-file-name") ?? "reconstructed-location.glb",
        },
        body: bytes,
      },
    );
    await requireResponse(completed, "Persist reconstructed room");
    console.log(`Completed room reconstruction ${job.id}.`);
    return;
  }
}

await waitForLocalWorker();
console.log("Stroman Mac worker is connected. It will safely wait for room builds.");
for (;;) {
  try {
    // Prepared rooms take priority: they unblock location setup before a story
    // exists. The legacy endpoint remains intact for project-scoped jobs.
    const paths = [
      "/api/v1/reconstruction-worker/prepared-locations/lease",
      "/api/v1/reconstruction-worker/lease",
    ];
    let job = null;
    for (const path of paths) {
      const lease = await signedFetch(appOrigin, path, { method: "POST" });
      const body = await requireResponse(lease, "Lease reconstruction work").then((r) => r.json());
      if (body.job) {
        job = body.job;
        break;
      }
    }
    if (job) await runJob(job);
    else await sleep(pollMs);
  } catch (error) {
    console.error(`Mac worker will retry: ${error.message}`);
    await sleep(Math.max(pollMs, 10_000));
  }
}
