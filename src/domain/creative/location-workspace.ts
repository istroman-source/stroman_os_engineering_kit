import type { SpatialPoint } from "./shot-planning";

/** Auditable renderer build stored with every canonical storyboard raster. */
export const LOCATION_RENDERER_VERSION = "three@0.185.1";

export type SpatialConfidence = "OBSERVED" | "ESTIMATED" | "UNKNOWN" | "FILMMAKER_CONFIRMED";

export interface SpatialBounds {
  readonly min: SpatialPoint;
  readonly max: SpatialPoint;
}

/** Column-major source-to-canonical transform consumed directly by Three.js. */
export type SpatialTransform = readonly [
  number,
  number,
  number,
  number,
  number,
  number,
  number,
  number,
  number,
  number,
  number,
  number,
  number,
  number,
  number,
  number,
];

export interface SpatialEnvironment {
  readonly id: string;
  readonly version: number;
  readonly name: string;
  readonly sourceKind: "PHONE_SCAN" | "PHOTOGRAMMETRY" | "ROOMPLAN" | "OTHER";
  /** Stroman-owned reconstruction provenance; never a provider job id. */
  readonly reconstructionId?: string | null;
  readonly sourcePhotos?: readonly {
    readonly mediaAssetId: string;
    readonly fileName: string;
    readonly contentType: "image/jpeg" | "image/png";
    readonly contentHash: string;
  }[];
  readonly geometryAsset: {
    readonly mediaAssetId: string;
    readonly fileName: string;
    readonly mediaType: "model/gltf-binary";
    readonly byteSize: number;
    readonly contentHash: string;
  };
  /** Canonical Stroman coordinates are right-handed meters, +Y up, camera forward -Z. */
  readonly sourceToCanonical: SpatialTransform;
  readonly bounds: SpatialBounds;
  readonly coverage: {
    readonly bounds: SpatialBounds;
    readonly confidence: SpatialConfidence;
  };
  readonly scaleMetersPerUnit: number;
  readonly scaleConfidence: SpatialConfidence;
  readonly createdAt: string;
}

export interface SpatialQuaternion {
  readonly x: number;
  readonly y: number;
  readonly z: number;
  readonly w: number;
}

export interface CameraFormat {
  readonly sensorWidthMm: number;
  readonly sensorHeightMm: number;
  readonly gateOrientation: "LANDSCAPE" | "PORTRAIT";
  readonly fit: "CONTAIN";
}

export interface LocationCameraState {
  readonly position: SpatialPoint;
  readonly target: SpatialPoint;
  readonly orientation: SpatialQuaternion;
  readonly format: CameraFormat;
  readonly focalLengthMm: number;
  readonly aspectRatio: "16:9" | "9:16";
  readonly nearMeters: number;
  readonly farMeters: number;
  readonly confidence: SpatialConfidence;
}

export interface StoryboardFrameRef {
  readonly mediaAssetId: string;
  readonly contentHash: string;
  readonly width: number;
  readonly height: number;
  readonly colorSpace: "srgb";
  readonly renderer: "THREE_WEBGL";
  readonly rendererVersion: string;
  readonly capturedAt: string;
}

export interface SavedLocationShot {
  readonly id: string;
  readonly version: number;
  readonly title: string;
  readonly environmentId: string;
  readonly environmentVersion: number;
  readonly camera: LocationCameraState;
  readonly storyboardFrame: StoryboardFrameRef;
  readonly technicalSummary: string;
  readonly shootingInstructions: string;
  readonly includesUnknownSpace: boolean;
}

export interface LocationWorkspaceState {
  readonly version: 1;
  readonly environment: SpatialEnvironment;
  readonly environments: readonly SpatialEnvironment[];
  readonly activeAspect: "16:9" | "9:16";
  readonly compositions: {
    readonly horizontal: LocationCameraState;
    readonly vertical: LocationCameraState;
  };
  readonly savedShots: readonly SavedLocationShot[];
}

const finitePoint = (value: unknown): value is SpatialPoint => {
  if (!value || typeof value !== "object") return false;
  const point = value as Partial<SpatialPoint>;
  return [point.x, point.y, point.z].every(
    (entry) => typeof entry === "number" && Number.isFinite(entry),
  );
};

const validBounds = (value: unknown): value is SpatialBounds => {
  if (!value || typeof value !== "object") return false;
  const bounds = value as Partial<SpatialBounds>;
  return (
    finitePoint(bounds.min) &&
    finitePoint(bounds.max) &&
    bounds.min.x < bounds.max.x &&
    bounds.min.y < bounds.max.y &&
    bounds.min.z < bounds.max.z
  );
};

const confidence = (value: unknown): value is SpatialConfidence =>
  value === "OBSERVED" ||
  value === "ESTIMATED" ||
  value === "UNKNOWN" ||
  value === "FILMMAKER_CONFIRMED";

const subtract = (left: SpatialPoint, right: SpatialPoint): SpatialPoint => ({
  x: left.x - right.x,
  y: left.y - right.y,
  z: left.z - right.z,
});

const cross = (left: SpatialPoint, right: SpatialPoint): SpatialPoint => ({
  x: left.y * right.z - left.z * right.y,
  y: left.z * right.x - left.x * right.z,
  z: left.x * right.y - left.y * right.x,
});

const normalized = (point: SpatialPoint): SpatialPoint | null => {
  const length = Math.hypot(point.x, point.y, point.z);
  return length > 1e-8 ? { x: point.x / length, y: point.y / length, z: point.z / length } : null;
};

/** Matches a perspective camera whose local forward axis is -Z and whose nominal up is +Y. */
export function lookAtQuaternion(
  position: SpatialPoint,
  target: SpatialPoint,
): SpatialQuaternion | null {
  const forward = normalized(subtract(target, position));
  if (!forward) return null;
  let right = normalized(cross(forward, { x: 0, y: 1, z: 0 }));
  if (!right) right = normalized(cross(forward, { x: 0, y: 0, z: 1 }));
  if (!right) return null;
  const up = cross(right, forward);
  const m00 = right.x;
  const m01 = up.x;
  const m02 = -forward.x;
  const m10 = right.y;
  const m11 = up.y;
  const m12 = -forward.y;
  const m20 = right.z;
  const m21 = up.z;
  const m22 = -forward.z;
  const trace = m00 + m11 + m22;
  let quaternion: SpatialQuaternion;
  if (trace > 0) {
    const s = Math.sqrt(trace + 1) * 2;
    quaternion = { x: (m21 - m12) / s, y: (m02 - m20) / s, z: (m10 - m01) / s, w: s / 4 };
  } else if (m00 > m11 && m00 > m22) {
    const s = Math.sqrt(1 + m00 - m11 - m22) * 2;
    quaternion = { x: s / 4, y: (m01 + m10) / s, z: (m02 + m20) / s, w: (m21 - m12) / s };
  } else if (m11 > m22) {
    const s = Math.sqrt(1 + m11 - m00 - m22) * 2;
    quaternion = { x: (m01 + m10) / s, y: s / 4, z: (m12 + m21) / s, w: (m02 - m20) / s };
  } else {
    const s = Math.sqrt(1 + m22 - m00 - m11) * 2;
    quaternion = { x: (m02 + m20) / s, y: (m12 + m21) / s, z: s / 4, w: (m10 - m01) / s };
  }
  const length = Math.hypot(quaternion.x, quaternion.y, quaternion.z, quaternion.w);
  return {
    x: quaternion.x / length,
    y: quaternion.y / length,
    z: quaternion.z / length,
    w: quaternion.w / length,
  };
}

export function cameraOrientationMatches(camera: LocationCameraState): boolean {
  const expected = lookAtQuaternion(camera.position, camera.target);
  if (!expected) return false;
  const { orientation } = camera;
  const length = Math.hypot(orientation.x, orientation.y, orientation.z, orientation.w);
  if (Math.abs(length - 1) > 0.001) return false;
  const dot = Math.abs(
    expected.x * orientation.x +
      expected.y * orientation.y +
      expected.z * orientation.z +
      expected.w * orientation.w,
  );
  return dot > 0.9999;
}

const validEnvironment = (value: unknown): value is SpatialEnvironment => {
  if (!value || typeof value !== "object") return false;
  const environment = value as Partial<SpatialEnvironment>;
  const matrix = environment.sourceToCanonical;
  const geometry = environment.geometryAsset;
  const coverage = environment.coverage;
  const bounds = environment.bounds;
  return (
    typeof environment.id === "string" &&
    Number.isInteger(environment.version) &&
    Number(environment.version) > 0 &&
    typeof environment.name === "string" &&
    ["PHONE_SCAN", "PHOTOGRAMMETRY", "ROOMPLAN", "OTHER"].includes(
      String(environment.sourceKind),
    ) &&
    (environment.reconstructionId === null ||
      environment.reconstructionId === undefined ||
      typeof environment.reconstructionId === "string") &&
    (environment.sourcePhotos === undefined ||
      (Array.isArray(environment.sourcePhotos) &&
        environment.sourcePhotos.length <= 300 &&
        environment.sourcePhotos.every(
          (photo) =>
            Boolean(photo) &&
            typeof photo.mediaAssetId === "string" &&
            typeof photo.fileName === "string" &&
            (photo.contentType === "image/jpeg" || photo.contentType === "image/png") &&
            typeof photo.contentHash === "string",
        ))) &&
    Boolean(
      geometry &&
      typeof geometry.mediaAssetId === "string" &&
      typeof geometry.fileName === "string" &&
      geometry.mediaType === "model/gltf-binary" &&
      Number.isInteger(geometry.byteSize) &&
      geometry.byteSize > 0 &&
      typeof geometry.contentHash === "string",
    ) &&
    Array.isArray(matrix) &&
    matrix.length === 16 &&
    matrix.every((entry) => typeof entry === "number" && Number.isFinite(entry)) &&
    validBounds(bounds) &&
    Boolean(coverage && validBounds(coverage.bounds) && confidence(coverage.confidence)) &&
    typeof environment.scaleMetersPerUnit === "number" &&
    environment.scaleMetersPerUnit > 0 &&
    confidence(environment.scaleConfidence) &&
    typeof environment.createdAt === "string"
  );
};

const validCamera = (value: unknown): value is LocationCameraState => {
  if (!value || typeof value !== "object") return false;
  const camera = value as Partial<LocationCameraState>;
  const orientation = camera.orientation;
  const format = camera.format;
  return (
    finitePoint(camera.position) &&
    finitePoint(camera.target) &&
    Boolean(
      orientation &&
      [orientation.x, orientation.y, orientation.z, orientation.w].every(
        (entry) => typeof entry === "number" && Number.isFinite(entry),
      ),
    ) &&
    Boolean(
      format &&
      typeof format.sensorWidthMm === "number" &&
      format.sensorWidthMm > 0 &&
      typeof format.sensorHeightMm === "number" &&
      format.sensorHeightMm > 0 &&
      (format.gateOrientation === "LANDSCAPE" || format.gateOrientation === "PORTRAIT") &&
      format.fit === "CONTAIN",
    ) &&
    typeof camera.focalLengthMm === "number" &&
    camera.focalLengthMm > 0 &&
    (camera.aspectRatio === "16:9" || camera.aspectRatio === "9:16") &&
    typeof camera.nearMeters === "number" &&
    typeof camera.farMeters === "number" &&
    camera.nearMeters > 0 &&
    camera.farMeters > camera.nearMeters &&
    confidence(camera.confidence) &&
    cameraOrientationMatches(camera as LocationCameraState)
  );
};

export function isLocationWorkspaceState(value: unknown): value is LocationWorkspaceState {
  if (!value || typeof value !== "object") return false;
  const state = value as Partial<LocationWorkspaceState>;
  const environment = state.environment;
  if (!environment || typeof environment !== "object") return false;
  if (!validEnvironment(environment) || !state.compositions) return false;
  const environments = state.environments;
  if (!Array.isArray(environments) || !environments.every(validEnvironment)) return false;
  return (
    state.version === 1 &&
    environments.length > 0 &&
    environments.length <= 3 &&
    environments.some(
      (item) => item.id === environment.id && item.version === environment.version,
    ) &&
    (state.activeAspect === "16:9" || state.activeAspect === "9:16") &&
    validCamera(state.compositions.horizontal) &&
    state.compositions.horizontal.aspectRatio === "16:9" &&
    validCamera(state.compositions.vertical) &&
    state.compositions.vertical.aspectRatio === "9:16" &&
    Array.isArray(state.savedShots) &&
    state.savedShots.length <= 100 &&
    state.savedShots.every((shot) =>
      Boolean(
        shot &&
        typeof shot.id === "string" &&
        Number.isInteger(shot.version) &&
        typeof shot.title === "string" &&
        environments.some(
          (item) => item.id === shot.environmentId && item.version === shot.environmentVersion,
        ) &&
        validCamera(shot.camera) &&
        shot.storyboardFrame &&
        typeof shot.storyboardFrame.mediaAssetId === "string" &&
        typeof shot.storyboardFrame.contentHash === "string" &&
        typeof shot.technicalSummary === "string" &&
        typeof shot.shootingInstructions === "string" &&
        typeof shot.includesUnknownSpace === "boolean",
      ),
    )
  );
}

export function createLocationWorkspace(
  environment: Omit<SpatialEnvironment, "sourceToCanonical" | "coverage"> & {
    readonly sourceToCanonical?: SpatialTransform;
  },
  previous?: LocationWorkspaceState | null,
): LocationWorkspaceState {
  const xInset = Math.min(0.2, (environment.bounds.max.x - environment.bounds.min.x) * 0.05);
  const zInset = Math.min(0.2, (environment.bounds.max.z - environment.bounds.min.z) * 0.05);
  const normalized: SpatialEnvironment = {
    ...environment,
    sourceToCanonical: environment.sourceToCanonical ?? [
      environment.scaleMetersPerUnit,
      0,
      0,
      0,
      0,
      environment.scaleMetersPerUnit,
      0,
      0,
      0,
      0,
      environment.scaleMetersPerUnit,
      0,
      0,
      0,
      0,
      1,
    ],
    coverage: {
      bounds: {
        min: {
          x: environment.bounds.min.x + xInset,
          y: environment.bounds.min.y,
          z: environment.bounds.min.z + zInset,
        },
        max: {
          x: environment.bounds.max.x - xInset,
          y: environment.bounds.max.y,
          z: environment.bounds.max.z - zInset,
        },
      },
      confidence: environment.scaleConfidence === "OBSERVED" ? "OBSERVED" : "ESTIMATED",
    },
  };
  const centerX = (normalized.coverage.bounds.min.x + normalized.coverage.bounds.max.x) / 2;
  const centerZ = (normalized.coverage.bounds.min.z + normalized.coverage.bounds.max.z) / 2;
  const cameraY = Math.min(
    normalized.coverage.bounds.max.y - 0.1,
    normalized.coverage.bounds.min.y + 1.6,
  );
  const position = {
    x: centerX,
    y: cameraY,
    z: normalized.coverage.bounds.max.z - zInset,
  };
  const target = {
    x: centerX,
    y: Math.min(cameraY, normalized.coverage.bounds.min.y + 1.4),
    z: centerZ,
  };
  const camera = (aspectRatio: "16:9" | "9:16"): LocationCameraState => ({
    position,
    target,
    orientation: lookAtQuaternion(position, target) ?? { x: 0, y: 0, z: 0, w: 1 },
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
  const history = [...(previous?.environments ?? []), normalized].slice(-3);
  return {
    version: 1,
    environment: normalized,
    environments: history,
    activeAspect: "16:9",
    compositions: {
      horizontal: camera("16:9"),
      vertical: camera("9:16"),
    },
    savedShots: previous?.savedShots ?? [],
  };
}
