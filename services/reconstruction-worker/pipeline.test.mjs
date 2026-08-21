import { mkdtemp, mkdir, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { buildColmapStages, runColmapPipeline } from "./pipeline.mjs";

describe("Stroman COLMAP pipeline", () => {
  it("uses the robust bounded room pipeline without shell interpolation", () => {
    const stages = buildColmapStages("/safe/job");

    expect(stages.map(({ phase }) => phase)).toEqual([
      "ALIGNING",
      "ALIGNING",
      "ALIGNING",
      "DENSIFYING",
      "DENSIFYING",
      "DENSIFYING",
      "MESHING",
      "MESHING",
      "TEXTURING",
      "PACKAGING",
    ]);
    expect(stages.map(({ command }) => command)).toEqual([
      "colmap",
      "colmap",
      "colmap",
      "colmap",
      "colmap",
      "colmap",
      "colmap",
      "colmap",
      "colmap",
      "gltfpack",
    ]);
    expect(stages.every(({ args }) => args.every((argument) => typeof argument === "string"))).toBe(
      true,
    );
    expect(stages[1].args).toContain("exhaustive_matcher");
    expect(stages[2].args).toContain("mapper");
    expect(stages[4].args).toContain("patch_match_stereo");
  });

  it("publishes progressive stages and accepts only a bounded binary glTF result", async () => {
    const workspace = await mkdtemp(path.join(os.tmpdir(), "stroman-pipeline-"));
    await mkdir(path.join(workspace, "images"));
    const progress = [];
    const result = await runColmapPipeline(workspace, {
      onProgress: async (value) => progress.push(value),
      runStage: async (stage) => {
        if (stage.phase === "PACKAGING") {
          await writeFile(path.join(workspace, "result.glb"), Buffer.from("glTF-room"));
        }
      },
    });

    expect(result).toBe(path.join(workspace, "result.glb"));
    expect(progress.at(-1)).toEqual({ phase: "PACKAGING", percent: 100 });
    expect(progress.some(({ phase }) => phase === "TEXTURING")).toBe(true);
  });
});
