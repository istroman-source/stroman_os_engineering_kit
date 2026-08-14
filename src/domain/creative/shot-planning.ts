export interface SpatialPoint {
  readonly x: number;
  readonly y: number;
  readonly z: number;
}

export type ShotAspectRatio = "16:9" | "9:16";

export interface SpatialCameraState {
  readonly position: SpatialPoint;
  readonly target: SpatialPoint;
  readonly focalLengthMm: number;
  readonly aspectRatio: ShotAspectRatio;
  readonly support: "LOCKED" | "HANDHELD" | "GIMBAL" | "DOLLY";
}

export interface SpatialSubjectState {
  readonly id: string;
  readonly label: string;
  readonly position: SpatialPoint;
  readonly facingDegrees: number;
  readonly pose: "SEATED" | "STANDING";
  readonly endPosition: SpatialPoint;
}

export interface SpatialMovementState {
  readonly kind: "LOCKED" | "PUSH" | "PULL" | "TRACK" | "ARC" | "HANDHELD";
  readonly start: SpatialPoint;
  readonly end: SpatialPoint;
}

export interface SpatialSetPieceState {
  readonly id: string;
  readonly label: string;
  readonly kind: "DESK" | "TABLE" | "COUNTER" | "DOOR" | "WINDOW" | "OBJECT" | "PRACTICAL";
  readonly position: SpatialPoint;
  readonly width: number;
  readonly height: number;
  readonly depth: number;
  readonly color: string;
}

export interface SpatialShotState {
  readonly id: string;
  readonly version: number;
  readonly title: string;
  readonly camera: SpatialCameraState;
  readonly subject: SpatialSubjectState;
  readonly movement: SpatialMovementState;
  readonly setPieces: readonly SpatialSetPieceState[];
  readonly action: string;
  readonly blocking: string;
  readonly lightColor: string;
  readonly light: string;
  readonly sound: string;
  readonly rationale: string;
  readonly geometryConfidence: "OBSERVED" | "ESTIMATED" | "FILMMAKER_CONFIRMED";
}

export interface ShotPlanningState {
  readonly version: 1;
  readonly activeShot: SpatialShotState;
  readonly savedShots: readonly SpatialShotState[];
}

const point = (x: number, y: number, z: number): SpatialPoint => ({ x, y, z });

const deskSetPieces = (): readonly SpatialSetPieceState[] => [
  {
    id: "desk",
    label: "Desk",
    kind: "DESK",
    position: point(0, 0.72, 0),
    width: 2.8,
    height: 0.72,
    depth: 1.15,
    color: "#85817a",
  },
  {
    id: "monitor",
    label: "Monitor",
    kind: "OBJECT",
    position: point(0.35, 1.15, -0.28),
    width: 0.75,
    height: 0.62,
    depth: 0.12,
    color: "#343b3d",
  },
  {
    id: "phone",
    label: "Desk phone",
    kind: "OBJECT",
    position: point(-0.62, 0.82, -0.04),
    width: 0.42,
    height: 0.1,
    depth: 0.24,
    color: "#444444",
  },
  {
    id: "sticky-note",
    label: "Yellow reminder",
    kind: "OBJECT",
    position: point(-0.05, 0.83, 0.05),
    width: 0.2,
    height: 0.02,
    depth: 0.2,
    color: "#f0c929",
  },
  {
    id: "drawer-keyboard-mug",
    label: "Drawer · keyboard · mug",
    kind: "OBJECT",
    position: point(0.72, 0.79, 0.12),
    width: 0.6,
    height: 0.18,
    depth: 0.28,
    color: "#6b6e69",
  },
];

/** Permanent acceptance fixture: Instruction at the Desk. */
export function instructionAtDeskShotPlanning(): ShotPlanningState {
  const camera = point(-1.8, 1.05, 3.8);
  return {
    version: 1,
    activeShot: {
      id: "shot_desk_04",
      version: 1,
      title: "Instruction at the Desk",
      camera: {
        position: camera,
        target: point(0.15, 1.0, 0.1),
        focalLengthMm: 35,
        aspectRatio: "16:9",
        support: "LOCKED",
      },
      subject: {
        id: "intern",
        label: "Intern",
        position: point(0, 0, 0.15),
        facingDegrees: 170,
        pose: "SEATED",
        endPosition: point(0.25, 0, -0.45),
      },
      movement: { kind: "LOCKED", start: camera, end: camera },
      setPieces: deskSetPieces(),
      action:
        "Listen on the desk phone, write one yellow reminder, then check drawer, keyboard, and mug before coming up empty.",
      blocking: "Seated listen → quick stand → three efficient checks → stillness.",
      lightColor: "#c9d7bd",
      light: "Existing overhead fluorescents; flat, slightly green, and honest to the office.",
      sound: "Dry room tone. Phone, pencil, drawer, keyboard, and mug carry the beat.",
      rationale:
        "The medium-wide keeps every failed hiding place in one geography, so the turn arrives through performance and timing rather than coverage.",
      geometryConfidence: "ESTIMATED",
    },
    savedShots: [],
  };
}

const finitePoint = (value: unknown): value is SpatialPoint => {
  if (!value || typeof value !== "object") return false;
  const item = value as Partial<SpatialPoint>;
  return [item.x, item.y, item.z].every(
    (entry) => typeof entry === "number" && Number.isFinite(entry),
  );
};

export function isShotPlanningState(value: unknown): value is ShotPlanningState {
  if (!value || typeof value !== "object") return false;
  const state = value as Partial<ShotPlanningState>;
  const validShot = (shot: unknown) => {
    if (!shot || typeof shot !== "object") return false;
    const item = shot as Partial<SpatialShotState>;
    return (
      typeof item.id === "string" &&
      typeof item.version === "number" &&
      typeof item.title === "string" &&
      Boolean(
        item.camera && finitePoint(item.camera.position) && finitePoint(item.camera.target),
      ) &&
      typeof item.camera?.focalLengthMm === "number" &&
      (item.camera?.aspectRatio === "16:9" || item.camera?.aspectRatio === "9:16") &&
      Boolean(
        item.subject && finitePoint(item.subject.position) && finitePoint(item.subject.endPosition),
      ) &&
      Boolean(
        item.movement && finitePoint(item.movement.start) && finitePoint(item.movement.end),
      ) &&
      Array.isArray(item.setPieces) &&
      item.setPieces.every(
        (setPiece) =>
          Boolean(setPiece) &&
          typeof setPiece.id === "string" &&
          typeof setPiece.label === "string" &&
          finitePoint(setPiece.position) &&
          typeof setPiece.width === "number" &&
          typeof setPiece.height === "number" &&
          typeof setPiece.depth === "number" &&
          typeof setPiece.color === "string",
      ) &&
      typeof item.action === "string" &&
      typeof item.blocking === "string" &&
      typeof item.light === "string" &&
      typeof item.sound === "string" &&
      typeof item.rationale === "string"
    );
  };
  return (
    state.version === 1 &&
    validShot(state.activeShot) &&
    Array.isArray(state.savedShots) &&
    state.savedShots.every(validShot)
  );
}
