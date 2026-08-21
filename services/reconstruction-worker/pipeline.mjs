import { spawn } from "node:child_process";
import { mkdir, open, stat } from "node:fs/promises";
import path from "node:path";

const MAX_RESULT_BYTES = 100 * 1024 * 1024;
const MAX_STAGE_MS = 45 * 60_000;

export function buildColmapStages(workspace, { imagesPath = path.join(workspace, "images") } = {}) {
  const images = imagesPath;
  const database = path.join(workspace, "database.db");
  const sparse = path.join(workspace, "sparse");
  const sparseModel = path.join(sparse, "0");
  const dense = path.join(workspace, "dense");
  const fused = path.join(dense, "fused.ply");
  const mesh = path.join(dense, "meshed-poisson.ply");
  const simplified = path.join(dense, "meshed-simplified.ply");
  const textured = path.join(dense, "textured.obj");
  const result = path.join(workspace, "result.glb");

  return [
    {
      phase: "ALIGNING",
      percent: 6,
      command: "colmap",
      args: [
        "feature_extractor",
        "--database_path",
        database,
        "--image_path",
        images,
        "--ImageReader.camera_model",
        "SIMPLE_RADIAL",
        "--ImageReader.single_camera",
        "1",
        "--FeatureExtraction.max_image_size",
        "2400",
        "--FeatureExtraction.use_gpu",
        "1",
      ],
    },
    {
      phase: "ALIGNING",
      percent: 16,
      command: "colmap",
      args: ["exhaustive_matcher", "--database_path", database, "--FeatureMatching.use_gpu", "1"],
    },
    {
      phase: "ALIGNING",
      percent: 28,
      command: "colmap",
      args: [
        "mapper",
        "--database_path",
        database,
        "--image_path",
        images,
        "--output_path",
        sparse,
        "--Mapper.multiple_models",
        "0",
      ],
    },
    {
      phase: "DENSIFYING",
      percent: 36,
      command: "colmap",
      args: [
        "image_undistorter",
        "--image_path",
        images,
        "--input_path",
        sparseModel,
        "--output_path",
        dense,
        "--output_type",
        "COLMAP",
        "--max_image_size",
        "2400",
      ],
    },
    {
      phase: "DENSIFYING",
      percent: 48,
      command: "colmap",
      args: [
        "patch_match_stereo",
        "--workspace_path",
        dense,
        "--workspace_format",
        "COLMAP",
        "--PatchMatchStereo.geom_consistency",
        "1",
      ],
    },
    {
      phase: "DENSIFYING",
      percent: 64,
      command: "colmap",
      args: [
        "stereo_fusion",
        "--workspace_path",
        dense,
        "--workspace_format",
        "COLMAP",
        "--input_type",
        "geometric",
        "--output_path",
        fused,
      ],
    },
    {
      phase: "MESHING",
      percent: 74,
      command: "colmap",
      args: ["poisson_mesher", "--input_path", fused, "--output_path", mesh],
    },
    {
      phase: "MESHING",
      percent: 82,
      command: "colmap",
      args: [
        "mesh_simplifier",
        "--input_path",
        mesh,
        "--output_path",
        simplified,
        "--MeshSimplification.target_face_ratio",
        "0.25",
      ],
    },
    {
      phase: "TEXTURING",
      percent: 90,
      command: "colmap",
      args: [
        "mesh_texturer",
        "--workspace_path",
        dense,
        "--input_path",
        simplified,
        "--output_path",
        textured,
      ],
    },
    {
      phase: "PACKAGING",
      percent: 97,
      command: "gltfpack",
      args: ["-i", textured, "-o", result],
    },
  ];
}

function runCommand(stage, { timeoutMs = MAX_STAGE_MS, log }) {
  return new Promise((resolve, reject) => {
    const child = spawn(stage.command, stage.args, {
      shell: false,
      stdio: ["ignore", "pipe", "pipe"],
    });
    const timer = setTimeout(() => {
      child.kill("SIGKILL");
      reject(new Error(`Reconstruction stage ${stage.phase} timed out.`));
    }, timeoutMs);
    child.stdout.on("data", (chunk) => log?.(String(chunk)));
    child.stderr.on("data", (chunk) => log?.(String(chunk)));
    child.once("error", (error) => {
      clearTimeout(timer);
      reject(error);
    });
    child.once("exit", (code, signal) => {
      clearTimeout(timer);
      if (code === 0) resolve();
      else reject(new Error(`Reconstruction stage ${stage.phase} exited ${code ?? signal}.`));
    });
  });
}

export async function validateGlbResult(resultPath) {
  const resultStat = await stat(resultPath);
  if (resultStat.size <= 0 || resultStat.size > MAX_RESULT_BYTES) {
    throw new Error("Reconstruction result is outside the supported 100 MB limit.");
  }
  const handle = await open(resultPath, "r");
  const header = Buffer.alloc(4);
  try {
    await handle.read(header, 0, header.byteLength, 0);
  } finally {
    await handle.close();
  }
  if (header.toString("ascii") !== "glTF") {
    throw new Error("Reconstruction result is not a binary glTF asset.");
  }
}

export async function runColmapPipeline(
  workspace,
  { imagesPath, onProgress, runStage = runCommand, timeoutMs = MAX_STAGE_MS, log } = {},
) {
  await mkdir(path.join(workspace, "sparse"), { recursive: true });
  await mkdir(path.join(workspace, "dense"), { recursive: true });
  for (const stage of buildColmapStages(workspace, { imagesPath })) {
    await onProgress?.({ phase: stage.phase, percent: stage.percent });
    await runStage(stage, { timeoutMs, log });
  }
  const resultPath = path.join(workspace, "result.glb");
  await validateGlbResult(resultPath);
  await onProgress?.({ phase: "PACKAGING", percent: 100 });
  return resultPath;
}
