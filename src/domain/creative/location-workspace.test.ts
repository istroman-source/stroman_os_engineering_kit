import { describe, expect, it } from "vitest";
import {
  cameraOrientationMatches,
  createLocationWorkspace,
  isLocationWorkspaceState,
  lookAtQuaternion,
} from "./location-workspace";

describe("real-location workspace", () => {
  it("creates separate camera compositions in canonical metric space", () => {
    const workspace = createLocationWorkspace({
      id: "env_office",
      version: 1,
      name: "Real office",
      sourceKind: "PHONE_SCAN",
      geometryAsset: {
        mediaAssetId: "mast_office",
        fileName: "office.glb",
        mediaType: "model/gltf-binary",
        byteSize: 1_000_000,
        contentHash: "sha256:office",
      },
      bounds: { min: { x: -3, y: 0, z: -4 }, max: { x: 3, y: 2.8, z: 4 } },
      scaleMetersPerUnit: 0.01,
      scaleConfidence: "OBSERVED",
      createdAt: "2026-08-20T00:00:00.000Z",
    });

    expect(isLocationWorkspaceState(workspace)).toBe(true);
    expect(workspace.environment.sourceToCanonical[0]).toBe(0.01);
    expect(workspace.environment.coverage.confidence).toBe("OBSERVED");
    expect(workspace.compositions.horizontal.aspectRatio).toBe("16:9");
    expect(workspace.compositions.vertical.aspectRatio).toBe("9:16");
    expect(workspace.compositions.horizontal).not.toBe(workspace.compositions.vertical);
    expect(cameraOrientationMatches(workspace.compositions.horizontal)).toBe(true);
    expect(workspace.compositions.horizontal.orientation).not.toEqual({ x: 0, y: 0, z: 0, w: 1 });
  });

  it("keeps missing scale and coverage explicitly estimated", () => {
    const workspace = createLocationWorkspace({
      id: "env_unknown",
      version: 1,
      name: "Unverified scan",
      sourceKind: "OTHER",
      geometryAsset: {
        mediaAssetId: "mast_unknown",
        fileName: "unknown.glb",
        mediaType: "model/gltf-binary",
        byteSize: 50,
        contentHash: "sha256:unknown",
      },
      bounds: { min: { x: 0, y: 0, z: 0 }, max: { x: 5, y: 3, z: 5 } },
      scaleMetersPerUnit: 1,
      scaleConfidence: "ESTIMATED",
      createdAt: "2026-08-20T00:00:00.000Z",
    });
    expect(workspace.environment.coverage.confidence).toBe("ESTIMATED");
    expect(workspace.compositions.horizontal.confidence).toBe("ESTIMATED");
  });

  it("rejects drift between the persisted quaternion and look-at target", () => {
    const expected = lookAtQuaternion({ x: 0, y: 1.6, z: 3 }, { x: 0, y: 1.2, z: 0 });
    expect(expected).not.toBeNull();
    const workspace = createLocationWorkspace({
      id: "env_camera",
      version: 1,
      name: "Camera test",
      sourceKind: "OTHER",
      geometryAsset: {
        mediaAssetId: "mast_camera",
        fileName: "camera.glb",
        mediaType: "model/gltf-binary",
        byteSize: 500,
        contentHash: "sha256:camera",
      },
      bounds: { min: { x: -2, y: 0, z: -2 }, max: { x: 2, y: 3, z: 2 } },
      scaleMetersPerUnit: 1,
      scaleConfidence: "OBSERVED",
      createdAt: "2026-08-20T00:00:00.000Z",
    });
    const drifted = {
      ...workspace,
      compositions: {
        ...workspace.compositions,
        horizontal: {
          ...workspace.compositions.horizontal,
          orientation: { x: 0, y: 0, z: 0, w: 1 },
        },
      },
    };
    expect(isLocationWorkspaceState(drifted)).toBe(false);
  });
});
