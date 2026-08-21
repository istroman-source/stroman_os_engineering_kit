import { describe, expect, it } from "vitest";
import { createLocationWorkspace, type SpatialTransform } from "@/domain/creative";
import { boundsFromGltfDocument, inferRoomScale, InvalidGlbError } from "./glb-metadata";

function glbWithBounds(min: readonly number[], max: readonly number[]): Uint8Array {
  const json = JSON.stringify({
    asset: { version: "2.0" },
    scene: 0,
    scenes: [{ nodes: [0] }],
    nodes: [{ mesh: 0 }],
    meshes: [{ primitives: [{ attributes: { POSITION: 0 } }] }],
    accessors: [{ type: "VEC3", min, max }],
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
  return bytes;
}

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
    const bytes = glbWithBounds([-200, 0, -300], [200, 100, 300]);

    const inferred = inferRoomScale(bytes);
    expect(inferred.scaleMetersPerUnit).toBeCloseTo(0.026);
    expect(inferred.bounds.max.y - inferred.bounds.min.y).toBeCloseTo(2.6);
    expect(inferred.bounds.max.x - inferred.bounds.min.x).toBeCloseTo(10.4);
  });

  it("maps meter Y-up and centimeter Z-up adapters to identical canonical cameras", () => {
    const identity: SpatialTransform = [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1];
    const zUpToYUp: SpatialTransform = [1, 0, 0, 0, 0, 0, -1, 0, 0, 1, 0, 0, 0, 0, 0, 1];
    const adapters = [
      {
        key: "gltf-y-up-meters",
        bytes: glbWithBounds([-2, 0, -3], [2, 2.6, 3]),
        sourceToCanonicalBasis: identity,
        metersPerSourceUnit: 1,
      },
      {
        key: "z-up-centimeters",
        bytes: glbWithBounds([-200, -300, 0], [200, 300, 260]),
        sourceToCanonicalBasis: zUpToYUp,
        metersPerSourceUnit: 0.01,
      },
    ] as const;
    const results = adapters.map((adapter) =>
      inferRoomScale(adapter.bytes, {
        sourceToCanonicalBasis: adapter.sourceToCanonicalBasis,
        metersPerSourceUnit: adapter.metersPerSourceUnit,
      }),
    );

    expect(results[1]?.bounds).toEqual(results[0]?.bounds);
    const workspaces = results.map((result, index) =>
      createLocationWorkspace({
        id: `environment-${index}`,
        version: 1,
        name: "Canonical room",
        sourceKind: "PHOTOGRAMMETRY",
        geometryAsset: {
          mediaAssetId: `asset-${index}`,
          fileName: `${adapters[index]!.key}.glb`,
          mediaType: "model/gltf-binary",
          byteSize: adapters[index]!.bytes.byteLength,
          contentHash: `sha256:${index}`,
        },
        bounds: result!.bounds,
        sourceToCanonical: result!.sourceToCanonical,
        scaleMetersPerUnit: result!.scaleMetersPerUnit,
        scaleConfidence: "ESTIMATED",
        createdAt: "2026-08-20T00:00:00.000Z",
      }),
    );

    expect(workspaces[1]?.compositions).toEqual(workspaces[0]?.compositions);
    expect(workspaces[1]?.environment.bounds).toEqual(workspaces[0]?.environment.bounds);
    expect(workspaces[1]?.environment.sourceToCanonical).not.toEqual(
      workspaces[0]?.environment.sourceToCanonical,
    );
  });
});
