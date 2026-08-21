import { randomBytes } from "node:crypto";
import { spawn } from "node:child_process";
import { mkdir } from "node:fs/promises";
import path from "node:path";
import { localReconstructionEnvironment } from "./local-reconstruction-config.mjs";

const root = process.cwd();
const runtimePath = path.join(root, ".data", "apple-reconstruction-runtime");
const binary = path.join(runtimePath, "stroman-apple-photogrammetry");
const source = path.join(root, "services", "reconstruction-worker", "apple-photogrammetry.swift");
const workerPort = 3211;
const appPort = 3200;
const secret = randomBytes(48).toString("base64url");
const detail = process.env.STROMAN_APPLE_RECONSTRUCTION_DETAIL ?? "reduced";
const children = new Set();
let stopping = false;

function run(command, args, options = {}) {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, {
      cwd: root,
      env: process.env,
      shell: false,
      stdio: "inherit",
      ...options,
    });
    child.once("error", reject);
    child.once("exit", (code, signal) => {
      if (code === 0) resolve();
      else reject(new Error(`${command} exited ${code ?? signal}.`));
    });
  });
}

function start(command, args, env) {
  const child = spawn(command, args, {
    cwd: root,
    env,
    shell: false,
    stdio: "inherit",
    detached: true,
  });
  children.add(child);
  child.once("exit", (code) => {
    children.delete(child);
    if (!stopping) {
      console.error(`${command} stopped unexpectedly with exit code ${code}.`);
      stop(1);
    }
  });
  return child;
}

function stop(exitCode = 0) {
  if (stopping) return;
  stopping = true;
  for (const child of children) {
    try {
      process.kill(-child.pid, "SIGTERM");
    } catch {}
  }
  setTimeout(() => process.exit(exitCode), 250).unref();
}

async function waitForWorker() {
  const deadline = Date.now() + 20_000;
  while (Date.now() < deadline) {
    try {
      const response = await fetch(`http://127.0.0.1:${workerPort}/health/ready`);
      if (response.ok) return;
    } catch {}
    await new Promise((resolve) => setTimeout(resolve, 250));
  }
  throw new Error("The local reconstruction worker did not become ready.");
}

if (process.platform !== "darwin") {
  throw new Error("Local Apple reconstruction requires macOS.");
}
if (!new Set(["reduced", "medium"]).has(detail)) {
  throw new Error("STROMAN_APPLE_RECONSTRUCTION_DETAIL must be reduced or medium.");
}

await mkdir(runtimePath, { recursive: true, mode: 0o700 });
console.log("Preparing Stroman's local Apple reconstruction engine...");
await run("swiftc", ["-parse-as-library", source, "-o", binary]);
await run(binary, ["--check"]);

const sharedEnvironment = localReconstructionEnvironment(process.env, {
  appPort,
  workerPort,
  secret,
});
start(process.execPath, ["services/reconstruction-worker/server.mjs"], {
  ...sharedEnvironment,
  PORT: String(workerPort),
  STROMAN_RECONSTRUCTION_ENGINE: "apple",
  STROMAN_GLTFPACK_BIN: path.join(root, "node_modules", ".bin", "gltfpack"),
  STROMAN_RECONSTRUCTION_DATA_PATH: path.join(runtimePath, "jobs"),
});

try {
  await waitForWorker();
  console.log(`Local reconstruction is ready. Opening Stroman OS on port ${appPort}...`);
  start("npm", ["run", "dev", "--", "--port", String(appPort)], sharedEnvironment);
} catch (error) {
  console.error(error instanceof Error ? error.message : String(error));
  stop(1);
}

process.once("SIGINT", () => stop());
process.once("SIGTERM", () => stop());
await new Promise(() => {});
