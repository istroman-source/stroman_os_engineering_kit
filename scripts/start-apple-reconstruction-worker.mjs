import { spawn } from "node:child_process";
import { mkdir } from "node:fs/promises";
import path from "node:path";

const root = process.cwd();
const runtimePath = path.join(root, ".data", "apple-reconstruction-worker");
const binary = path.join(runtimePath, "stroman-apple-photogrammetry");
const source = path.join(root, "services", "reconstruction-worker", "apple-photogrammetry.swift");
const port = process.env.PORT ?? "3211";
const detail = process.env.STROMAN_APPLE_RECONSTRUCTION_DETAIL ?? "reduced";
const secret = process.env.STROMAN_RECONSTRUCTION_WORKER_SECRET;

function run(command, args) {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, {
      cwd: root,
      env: process.env,
      shell: false,
      stdio: "inherit",
    });
    child.once("error", reject);
    child.once("exit", (code, signal) => {
      if (code === 0) resolve();
      else reject(new Error(`${command} exited ${code ?? signal}.`));
    });
  });
}

if (process.platform !== "darwin") throw new Error("Apple reconstruction workers require macOS.");
if (!secret || Buffer.byteLength(secret) < 32) {
  throw new Error("STROMAN_RECONSTRUCTION_WORKER_SECRET must be set to at least 32 bytes.");
}
if (!new Set(["reduced", "medium"]).has(detail)) {
  throw new Error("STROMAN_APPLE_RECONSTRUCTION_DETAIL must be reduced or medium.");
}

await mkdir(runtimePath, { recursive: true, mode: 0o700 });
console.log("Preparing Stroman's Apple reconstruction worker...");
await run("swiftc", ["-parse-as-library", source, "-o", binary]);
await run(binary, ["--check"]);

const worker = spawn(process.execPath, ["services/reconstruction-worker/server.mjs"], {
  cwd: root,
  env: {
    ...process.env,
    PORT: port,
    STROMAN_RECONSTRUCTION_ENGINE: "apple",
    STROMAN_GLTFPACK_BIN: path.join(root, "node_modules", ".bin", "gltfpack"),
    STROMAN_RECONSTRUCTION_DATA_PATH:
      process.env.STROMAN_RECONSTRUCTION_DATA_PATH ?? path.join(runtimePath, "jobs"),
  },
  shell: false,
  stdio: "inherit",
});

function stop(signal) {
  if (!worker.killed) worker.kill(signal);
}

process.once("SIGINT", () => stop("SIGINT"));
process.once("SIGTERM", () => stop("SIGTERM"));
worker.once("exit", (code, signal) => {
  process.exitCode = code ?? (signal ? 1 : 0);
});
