import { describe, expect, it } from "vitest";
import { boundsFromGltfDocument, inferRoomScale, InvalidGlbError } from "./glb-metadata";

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

  it("automatically normalizes an unscaled photogrammetry room without claiming observed scale", () => {
    const json = JSON.stringify({
      asset: { version: "2.0" },
      scene: 0,
      scenes: [{ nodes: [0] }],
      nodes: [{ mesh: 0 }],
      meshes: [{ primitives: [{ attributes: { POSITION: 0 } }] }],
      accessors: [{ type: "VEC3", min: [-200, 0, -300], max: [200, 100, 300] }],
    });
    const padded = `${json}${" ".repeat((4 - (json.length % 4)) % 4)}`;
    const bytes = new Uint8Array(20 + padded.length);
    const view = new DataView(bytes.buffer);
    view.setUint32(0, 0x46546c67, true);
    view.setUint32(4, 2, true);
    view.setUint32(8, bytes.byteLength, true);
    view.setUint32(12, padded.length, true);
    view.setUint32(16, 0x4e4f534a, true);
    bytes.set(new TextEncoder().encode(padded), 20);

    const inferred = inferRoomScale(bytes);
    expect(inferred.scaleMetersPerUnit).toBeCloseTo(0.026);
    expect(inferred.bounds.max.y - inferred.bounds.min.y).toBeCloseTo(2.6);
    expect(inferred.bounds.max.x - inferred.bounds.min.x).toBeCloseTo(10.4);
  });
});
