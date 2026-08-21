import type { LocationCameraState } from "./location-workspace";
import type { SpatialPoint } from "./shot-planning";

export interface CameraProjectionData {
  readonly gateWidthMm: number;
  readonly gateHeightMm: number;
  readonly horizontalFovDegrees: number;
  readonly verticalFovDegrees: number;
  readonly targetDistanceMeters: number;
}

export function cameraProjectionData(camera: LocationCameraState): CameraProjectionData {
  const portrait = camera.format.gateOrientation === "PORTRAIT";
  const sensorWidth = portrait ? camera.format.sensorHeightMm : camera.format.sensorWidthMm;
  const sensorHeight = portrait ? camera.format.sensorWidthMm : camera.format.sensorHeightMm;
  const aspect = camera.aspectRatio === "16:9" ? 16 / 9 : 9 / 16;
  const gate =
    sensorWidth / sensorHeight > aspect
      ? { width: sensorHeight * aspect, height: sensorHeight }
      : { width: sensorWidth, height: sensorWidth / aspect };
  return {
    gateWidthMm: gate.width,
    gateHeightMm: gate.height,
    horizontalFovDegrees: (2 * Math.atan(gate.width / (2 * camera.focalLengthMm)) * 180) / Math.PI,
    verticalFovDegrees: (2 * Math.atan(gate.height / (2 * camera.focalLengthMm)) * 180) / Math.PI,
    targetDistanceMeters: Math.hypot(
      camera.target.x - camera.position.x,
      camera.target.y - camera.position.y,
      camera.target.z - camera.position.z,
    ),
  };
}

const normalize = (point: SpatialPoint): SpatialPoint => {
  const length = Math.hypot(point.x, point.y, point.z) || 1;
  return { x: point.x / length, y: point.y / length, z: point.z / length };
};

const cross = (left: SpatialPoint, right: SpatialPoint): SpatialPoint => ({
  x: left.y * right.z - left.z * right.y,
  y: left.z * right.x - left.x * right.z,
  z: left.x * right.y - left.y * right.x,
});

const dot = (left: SpatialPoint, right: SpatialPoint): number =>
  left.x * right.x + left.y * right.y + left.z * right.z;

/** Renderer-independent perspective projection used by behavior tests and technical derivation. */
export function projectWorldPoint(camera: LocationCameraState, world: SpatialPoint) {
  const projection = cameraProjectionData(camera);
  const forward = normalize({
    x: camera.target.x - camera.position.x,
    y: camera.target.y - camera.position.y,
    z: camera.target.z - camera.position.z,
  });
  let right = normalize(cross(forward, { x: 0, y: 1, z: 0 }));
  if (Math.hypot(right.x, right.y, right.z) < 0.001) right = { x: 1, y: 0, z: 0 };
  const up = normalize(cross(right, forward));
  const relative = {
    x: world.x - camera.position.x,
    y: world.y - camera.position.y,
    z: world.z - camera.position.z,
  };
  const depth = dot(relative, forward);
  const horizontalTangent = Math.tan((projection.horizontalFovDegrees * Math.PI) / 360);
  const verticalTangent = Math.tan((projection.verticalFovDegrees * Math.PI) / 360);
  return {
    x: dot(relative, right) / (depth * horizontalTangent),
    y: dot(relative, up) / (depth * verticalTangent),
    depth,
    visible: depth >= camera.nearMeters && depth <= camera.farMeters,
  };
}
