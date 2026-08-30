import { mkdir, mkdtemp, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { mapAppleProgress, runApplePipeline } from "./apple-pipeline.mjs";

describe("Stroman Apple photogrammetry pipeline", () => {
  it("maps native progress into truthful provider-neutral phases", () => {
    expect(mapAppleProgress(0)).toEqual({ phase: "ALIGNING", percent: 5 });
    expect(mapAppleProgress(0.4).phase).toBe("DENSIFYING");
    expect(mapAppleProgress(0.7).phase).toBe("MESHING");
    expect(mapAppleProgress(0.95).phase).toBe("TEXTURING");
    expect(mapAppleProgress(2)).toEqual({ phase: "TEXTURING", percent: 94 });
  });

  it("packages the one native OBJ as a bounded GLB", async () => {
    const workspace = await mkdtemp(path.join(os.tmpdir(), "stroman-apple-pipeline-"));
    const imagesPath = path.join(workspace, "images");
    await mkdir(imagesPath);
    const progress = [];
    const commands = [];
    const result = await runApplePipeline(workspace, {
      imagesPath,
      executable: "/safe/apple-photogrammetry",
      gltfpack: "/safe/gltfpack",
      onProgress: async (value) => progress.push(value),
      runCommand: async (command, args, options) => {
        commands.push({ command, args });
        if (command === "/safe/apple-photogrammetry") {
          const output = args[1];
          await mkdir(path.join(output, "model"), { recursive: true });
          await writeFile(path.join(output, "model", "room.obj"), "o room\n");
          await options.onStdout(JSON.stringify({ event: "progress", fraction: 0.72 }));
          await options.onStdout(JSON.stringify({ event: "complete", fraction: 1 }));
        } else {
          await writeFile(path.join(workspace, "result.glb"), Buffer.from("glTF-room"));
        }
      },
    });

    expect(result).toBe(path.join(workspace, "result.glb"));
    expect(commands).toEqual([
      {
        command: "/safe/apple-photogrammetry",
        args: [imagesPath, path.join(workspace, "apple-output"), "full"],
      },
      {
        command: "/safe/gltfpack",
        args: [
          "-i",
          path.join(workspace, "apple-output", "model", "room.obj"),
          "-o",
          path.join(workspace, "result.glb"),
          "-vpf",
          "-vtf",
          "-vnf",
        ],
      },
    ]);
    expect(progress.some(({ phase }) => phase === "MESHING")).toBe(true);
    expect(progress.at(-1)).toEqual({ phase: "PACKAGING", percent: 100 });
  });

  it("rejects a native process that exits without a completion event", async () => {
    const workspace = await mkdtemp(path.join(os.tmpdir(), "stroman-apple-incomplete-"));
    await expect(
      runApplePipeline(workspace, {
        imagesPath: path.join(workspace, "images"),
        executable: "/safe/apple-photogrammetry",
        runCommand: async () => {},
      }),
    ).rejects.toThrow("without a completion event");
  });

  it("fails closed when native reconstruction reports a room that cannot be stitched", async () => {
    await expect(
      runApplePipeline("/safe/workspace", {
        imagesPath: "/safe/images",
        executable: "/safe/apple-photogrammetry",
        runCommand: async (_command, _args, options) => {
          await options.onStdout(
            JSON.stringify({
              event: "error",
              message: "Apple could not connect this capture into one dependable room.",
            }),
          );
        },
      }),
    ).rejects.toThrow("could not connect this capture into one dependable room");
  });

  it("rejects unsupported detail values before starting a native process", async () => {
    await expect(
      runApplePipeline("/safe/workspace", {
        imagesPath: "/safe/images",
        executable: "/safe/apple-photogrammetry",
        detail: "draft",
      }),
    ).rejects.toThrow("must be reduced, medium, or full");
  });
});
