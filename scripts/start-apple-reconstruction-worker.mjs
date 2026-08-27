import { spawn } from "node:child_process";
import { mkdir } from "node:fs/promises";
import path from "node:path";
import { appleReconstructionWorkerEnvironment } from "./apple-reconstruction-worker-config.mjs";
import { appleReconstructionWorkerLaunchConfig } from "./apple-reconstruction-worker-launch-config.mjs";
import { appleSwiftCompileArguments, compatibleAppleSdkPath } from "./apple-toolchain-config.mjs";

const root = process.cwd();
const runtimePath = path.join(root, ".data", "apple-reconstruction-worker");
const binary = path.join(runtimePath, "stroman-apple-photogrammetry");
const moduleCachePath = path.join(runtimePath, "swift-module-cache");
const source = path.join(root, "services", "reconstruction-worker", "apple-photogrammetry.swift");
const port = process.env.PORT ?? "3211";
const detail = process.env.STROMAN_APPLE_RECONSTRUCTION_DETAIL ?? "reduced";

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
if (!new Set(["reduced", "medium"]).has(detail)) {
  throw new Error("STROMAN_APPLE_RECONSTRUCTION_DETAIL must be reduced or medium.");
}

const { secret } = await appleReconstructionWorkerLaunchConfig(process.env);
process.env.STROMAN_RECONSTRUCTION_WORKER_SECRET = secret;

await mkdir(runtimePath, { recursive: true, mode: 0o700 });
await mkdir(moduleCachePath, { recursive: true, mode: 0o700 });
console.log("Preparing Stroman's Apple reconstruction worker...");
const compatibleSdk = compatibleAppleSdkPath();
if (compatibleSdk) console.log(`Using compatible Apple SDK: ${compatibleSdk}`);
await run(
  "swiftc",
  appleSwiftCompileArguments({ source, binary, moduleCachePath, sdkPath: compatibleSdk }),
);
await run(binary, ["--check"]);

const worker = spawn(process.execPath, ["services/reconstruction-worker/server.mjs"], {
  cwd: root,
  env: appleReconstructionWorkerEnvironment(process.env, { root, port, binary, runtimePath }),
  shell: false,
  stdio: "inherit",
});

const pullClient = spawn(process.execPath, ["scripts/pull-apple-reconstruction-worker.mjs"], {
  cwd: root,
  env: { ...process.env, STROMAN_LOCAL_RECONSTRUCTION_URL: `http://127.0.0.1:${port}` },
  shell: false,
  stdio: "inherit",
});

function stop(signal) {
  if (!worker.killed) worker.kill(signal);
  if (!pullClient.killed) pullClient.kill(signal);
}

process.once("SIGINT", () => stop("SIGINT"));
process.once("SIGTERM", () => stop("SIGTERM"));
worker.once("exit", (code, signal) => {
  if (!pullClient.killed) pullClient.kill("SIGTERM");
  process.exitCode = code ?? (signal ? 1 : 0);
});
