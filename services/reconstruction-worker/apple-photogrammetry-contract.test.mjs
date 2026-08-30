import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

const sourcePath = path.join(
  path.dirname(fileURLToPath(import.meta.url)),
  "apple-photogrammetry.swift",
);

describe("Apple room-capture preflight contract", () => {
  it("keeps original evidence while excluding only dominant close-up portraits", async () => {
    const source = await readFile(sourcePath, "utf8");

    expect(source).toContain("VNDetectFaceRectanglesRequest");
    expect(source).toContain("face.boundingBox.width * face.boundingBox.height >= 0.08");
    expect(source).toContain("originalImages: URL");
    expect(source).toContain("copyItem(at: image");
    expect(source).toContain("reconstructionImages.count >= 20");
    expect(source).toContain("PhotogrammetrySession(input: reconstructionInput.url");
  });
});
