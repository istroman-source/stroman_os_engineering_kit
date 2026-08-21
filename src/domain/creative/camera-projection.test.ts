import { describe, expect, it } from "vitest";
import { cameraProjectionData, projectWorldPoint } from "./camera-projection";
import type { LocationCameraState } from "./location-workspace";

const camera = (positionZ: number, aspectRatio: "16:9" | "9:16" = "16:9"): LocationCameraState => ({
  position: { x: 0, y: 1.5, z: positionZ },
  target: { x: 0, y: 1.5, z: 0 },
  orientation: { x: 0, y: 0, z: 0, w: 1 },
  format: {
    sensorWidthMm: 36,
    sensorHeightMm: 24,
    gateOrientation: aspectRatio === "16:9" ? "LANDSCAPE" : "PORTRAIT",
    fit: "CONTAIN",
  },
  focalLengthMm: 35,
  aspectRatio,
  nearMeters: 0.05,
  farMeters: 250,
  confidence: "ESTIMATED",
});

describe("filmmaking camera projection", () => {
  it("uses physical filmback and focal length for distinct 16:9 and 9:16 gates", () => {
    const horizontal = cameraProjectionData(camera(5, "16:9"));
    const vertical = cameraProjectionData(camera(5, "9:16"));
    expect(horizontal.gateWidthMm / horizontal.gateHeightMm).toBeCloseTo(16 / 9, 5);
    expect(vertical.gateWidthMm / vertical.gateHeightMm).toBeCloseTo(9 / 16, 5);
    expect(horizontal.horizontalFovDegrees).not.toBeCloseTo(vertical.horizontalFovDegrees, 1);
  });

  it("moving one meter toward a subject increases projected subject scale consistently", () => {
    const feet = { x: 0, y: 0, z: 0 };
    const head = { x: 0, y: 1.8, z: 0 };
    const farScale = Math.abs(
      projectWorldPoint(camera(5), head).y - projectWorldPoint(camera(5), feet).y,
    );
    const nearScale = Math.abs(
      projectWorldPoint(camera(4), head).y - projectWorldPoint(camera(4), feet).y,
    );
    expect(nearScale).toBeGreaterThan(farScale);
    expect(nearScale / farScale).toBeCloseTo(5 / 4, 4);
  });
});
