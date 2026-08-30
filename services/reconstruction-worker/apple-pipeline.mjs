import { spawn } from "node:child_process";
import { readdir } from "node:fs/promises";
import path from "node:path";
import { validateGlbResult } from "./pipeline.mjs";

const MAX_STAGE_MS = 90 * 60_000;

function run(command, args, { timeoutMs = MAX_STAGE_MS, log, onStdout } = {}) {
  return new Promise((resolve, reject) => {
    let timer;
    const child = spawn(command, args, {
      shell: false,
      stdio: ["ignore", "pipe", "pipe"],
    });
    let stdoutBuffer = "";
    let outputProcessing = Promise.resolve();
    let outputFailure = null;
    let settled = false;
    const fail = (error) => {
      if (settled) return;
      settled = true;
      clearTimeout(timer);
      child.kill("SIGKILL");
      reject(error);
    };
    const processLine = (line) => {
      if (!line.trim()) return;
      outputProcessing = outputProcessing
        .then(() => onStdout?.(line.trim()))
        .catch((error) => {
          outputFailure = error;
          fail(error);
        });
    };
    timer = setTimeout(() => {
      fail(new Error("Apple reconstruction timed out."));
    }, timeoutMs);
    child.stdout.on("data", (chunk) => {
      const value = String(chunk);
      stdoutBuffer += value;
      const lines = stdoutBuffer.split("\n");
      stdoutBuffer = lines.pop() ?? "";
      for (const line of lines) processLine(line);
    });
    child.stderr.on("data", (chunk) => log?.(String(chunk)));
    child.once("error", (error) => {
      fail(error);
    });
    child.once("exit", async (code, signal) => {
      if (settled) return;
      clearTimeout(timer);
      processLine(stdoutBuffer);
      await outputProcessing;
      if (settled || outputFailure) return;
      settled = true;
      if (code === 0) resolve();
      else reject(new Error(`Apple reconstruction exited ${code ?? signal}.`));
    });
  });
}

export function mapAppleProgress(fraction) {
  const bounded = Math.max(0, Math.min(1, fraction));
  if (bounded < 0.2) {
    return { phase: "ALIGNING", percent: Math.round(5 + bounded * 115) };
  }
  if (bounded < 0.55) {
    return { phase: "DENSIFYING", percent: Math.round(28 + (bounded - 0.2) * 106) };
  }
  if (bounded < 0.8) {
    return { phase: "MESHING", percent: Math.round(65 + (bounded - 0.55) * 68) };
  }
  return { phase: "TEXTURING", percent: Math.round(82 + (bounded - 0.8) * 60) };
}

async function findObj(directory) {
  const candidates = [];
  async function visit(current) {
    for (const entry of await readdir(current, { withFileTypes: true })) {
      const entryPath = path.join(current, entry.name);
      if (entry.isDirectory()) await visit(entryPath);
      else if (entry.isFile() && entry.name.toLowerCase().endsWith(".obj")) {
        candidates.push(entryPath);
      }
    }
  }
  await visit(directory);
  if (candidates.length !== 1) {
    throw new Error(`Apple reconstruction produced ${candidates.length} OBJ models; expected one.`);
  }
  return candidates[0];
}

export async function runApplePipeline(
  workspace,
  {
    imagesPath,
    onProgress,
    runCommand = run,
    timeoutMs = MAX_STAGE_MS,
    log,
    executable = process.env.STROMAN_APPLE_PHOTOGRAMMETRY_BIN,
    // A room is a camera-planning environment, not a thumbnail asset. Keep the
    // cheaper reduced setting available as an explicit operator override, but
    // make medium the baseline so the worker retains usable surface detail.
    detail = process.env.STROMAN_APPLE_RECONSTRUCTION_DETAIL ?? "medium",
    gltfpack = process.env.STROMAN_GLTFPACK_BIN ??
      path.join(process.cwd(), "node_modules/.bin/gltfpack"),
  } = {},
) {
  if (process.platform !== "darwin" && !executable) {
    throw new Error("The Apple reconstruction engine requires macOS.");
  }
  if (!executable) throw new Error("STROMAN_APPLE_PHOTOGRAMMETRY_BIN is required.");
  if (!new Set(["reduced", "medium"]).has(detail)) {
    throw new Error("STROMAN_APPLE_RECONSTRUCTION_DETAIL must be reduced or medium.");
  }
  const appleOutput = path.join(workspace, "apple-output");
  let reportedComplete = false;
  await onProgress?.({ phase: "ALIGNING", percent: 5 });
  await runCommand(executable, [imagesPath, appleOutput, detail], {
    timeoutMs,
    log,
    onStdout: async (line) => {
      let event;
      try {
        event = JSON.parse(line);
      } catch {
        log?.(line);
        return;
      }
      if (event.event === "error") throw new Error(event.message ?? "Apple reconstruction failed.");
      if (typeof event.fraction === "number") {
        const progress = mapAppleProgress(event.fraction);
        await onProgress?.(progress);
      }
      if (event.event === "complete") reportedComplete = true;
    },
  });
  if (!reportedComplete) throw new Error("Apple reconstruction ended without a completion event.");

  const sourceObj = await findObj(appleOutput);
  const resultPath = path.join(workspace, "result.glb");
  await onProgress?.({ phase: "PACKAGING", percent: 97 });
  // gltfpack's default integer quantization discards precision from large-room
  // vertices and UVs. Preserve positions, normals, and texture coordinates so
  // the viewer receives the spatial relationships Apple reconstructed.
  await runCommand(gltfpack, ["-i", sourceObj, "-o", resultPath, "-vpf", "-vtf", "-vnf"], {
    timeoutMs,
    log,
  });
  await validateGlbResult(resultPath);
  await onProgress?.({ phase: "PACKAGING", percent: 100 });
  return resultPath;
}
