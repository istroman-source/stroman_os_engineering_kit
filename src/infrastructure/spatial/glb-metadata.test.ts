import { describe, expect, it } from "vitest";
import { boundsFromGltfDocument, InvalidGlbError } from "./glb-metadata";

describe("GLB spatial metadata", () => {
  it("unions mesh instances after node transforms and unit conversion", () => {
    const bounds = boundsFromGltfDocument(
      {
        scene: 0,
        scenes: [{ nodes: [0, 1] }],
        nodes: [
          { mesh: 0, translation: [100, 0, 0] },
          { mesh: 0, translation: [-100, 0, 0], scale: [2, 1, 1] },
        ],
        meshes: [{ primitives: [{ attributes: { POSITION: 0 } }] }],
        accessors: [{ type: "VEC3", min: [-50, 0, -100], max: [50, 250, 100] }],
      },
      0.01,
    );
    expect(bounds.min).toEqual({ x: -2, y: 0, z: -1 });
    expect(bounds.max).toEqual({ x: 1.5, y: 2.5, z: 1 });
  });

  it("rejects an object or flat surface instead of presenting it as navigable space", () => {
    expect(() =>
      boundsFromGltfDocument(
        {
          scene: 0,
          scenes: [{ nodes: [0] }],
          nodes: [{ mesh: 0 }],
          meshes: [{ primitives: [{ attributes: { POSITION: 0 } }] }],
          accessors: [{ type: "VEC3", min: [-0.4, 0, -0.1], max: [0.4, 0.6, 0.1] }],
        },
        1,
      ),
    ).toThrow(InvalidGlbError);
  });
});
