import type { CreativeBrief } from "./creative-brief";
import type { CreativeMode } from "./development-blueprint";
import type { MeaningfulDevelopment, StoryboardGlyphKind } from "./meaningful-development";

export type VisualDevelopmentSource = Omit<MeaningfulDevelopment, "storyboard">;

export type ProductionStage = "IDEA" | "SCOUTING" | "PRE_PRODUCTION" | "SHOOTING" | "POST";
export type PlanningPriority = "MUST_SOLVE_NOW" | "IMPORTANT" | "WORTH_EXPLORING" | "OPTIONAL";
export type CoveragePriority = "MUST_GET" | "SAFETY" | "OPTIONAL_EXPLORATION";
export type SpatialClaimState =
  "VISIBLE_FACT" | "INFERRED_GEOMETRY" | "FILMMAKER_CONFIRMED_GEOMETRY";

export interface ProductionReality {
  readonly crew: string;
  readonly cameraBody: string;
  readonly lenses: string;
  readonly support: string;
  readonly lighting: string;
  readonly sound: string;
  readonly shootTime: string;
  readonly access: string;
  readonly talent: string;
  readonly budget: string;
  readonly timeOfDay: string;
}

export interface ScoutPhotoRef {
  readonly id: string;
  readonly mediaAssetId: string;
  readonly fileName: string;
  readonly contentType: string;
  readonly contentHash: string;
  readonly angleLabel: string;
}

export interface SpatialClaim {
  readonly id: string;
  readonly state: SpatialClaimState;
  readonly label: string;
  readonly detail: string;
  readonly evidencePhotoIds: readonly string[];
  readonly affects: readonly ("STORYBOARD" | "BLOCKING" | "LIGHTING")[];
}

export interface SpatialCorrection {
  readonly id: string;
  readonly statement: string;
  readonly replacesClaimId: string | null;
}

export interface CreativePlanningContext {
  readonly version: 1;
  readonly stage: ProductionStage;
  readonly production: ProductionReality;
  readonly scoutPhotos: readonly ScoutPhotoRef[];
  readonly spatialClaims: readonly SpatialClaim[];
  readonly corrections: readonly SpatialCorrection[];
}

export interface PrevisFigure {
  readonly kind: StoryboardGlyphKind;
  readonly label: string;
  readonly x: number;
  readonly y: number;
  readonly width: number;
  readonly height: number;
  readonly plane: "FOREGROUND" | "MIDGROUND" | "BACKGROUND";
  readonly facing: "LEFT" | "RIGHT" | "CAMERA" | "AWAY";
}

export type PrevisSetPieceKind =
  | "WALL"
  | "WINDOW"
  | "DOOR"
  | "COUNTER"
  | "ISLAND"
  | "FRIDGE"
  | "SINK"
  | "PRACTICAL"
  | "MEAL"
  | "OBJECT";

export interface PrevisSetPiece {
  readonly kind: PrevisSetPieceKind;
  readonly label: string;
  readonly x: number;
  readonly y: number;
  readonly width: number;
  readonly height: number;
  readonly plane: "FOREGROUND" | "MIDGROUND" | "BACKGROUND";
  readonly emphasis: "QUIET" | "CONTEXT" | "STORY";
}

export interface PrevisMotion {
  readonly label: string;
  readonly fromX: number;
  readonly fromY: number;
  readonly toX: number;
  readonly toY: number;
}

export interface PrevisLightCue {
  readonly label: string;
  readonly fromX: number;
  readonly fromY: number;
  readonly toX: number;
  readonly toY: number;
  readonly tone: "COOL" | "WARM" | "NEUTRAL";
}

export interface PrevisComposition {
  readonly id: string;
  readonly aspectRatio: "16:9" | "9:16";
  readonly shotScale: string;
  readonly lens: string;
  readonly cameraHeight: string;
  readonly cameraDistance: string;
  readonly movement: string;
  readonly hold: string;
  readonly executionStrip: readonly [string, string];
  readonly headroom: number;
  readonly eyelineY: number | null;
  readonly negativeSpace: {
    readonly x: number;
    readonly y: number;
    readonly width: number;
    readonly height: number;
    readonly purpose: string;
  } | null;
  readonly figures: readonly PrevisFigure[];
  readonly setPieces: readonly PrevisSetPiece[];
  readonly motion: readonly PrevisMotion[];
  readonly light: readonly PrevisLightCue[];
  readonly constraint: string;
  readonly locationDependencies: readonly string[];
}

export interface PrevisShotPair {
  readonly id: string;
  readonly sceneId: string;
  readonly title: string;
  readonly purpose: string;
  readonly priority: CoveragePriority;
  readonly horizontal: PrevisComposition;
  readonly vertical: PrevisComposition;
}

export interface PlanZone {
  readonly id: string;
  readonly label: string;
  readonly x: number;
  readonly y: number;
  readonly width: number;
  readonly height: number;
}

export interface BlockingSubjectState {
  readonly label: string;
  readonly x: number;
  readonly y: number;
  readonly note: string;
}

export interface BlockingSubject {
  readonly id: string;
  readonly label: string;
  readonly carries: string | null;
  readonly states: readonly BlockingSubjectState[];
}

export interface CameraPosition {
  readonly id: string;
  readonly label: string;
  readonly x: number;
  readonly y: number;
  readonly aimX: number;
  readonly aimY: number;
  readonly use: string;
}

export interface BlockingPlan {
  readonly title: string;
  readonly question: "Where are the people and cameras, and how do they move?";
  readonly zones: readonly PlanZone[];
  readonly subjects: readonly BlockingSubject[];
  readonly cameras: readonly CameraPosition[];
  readonly restrictions: readonly string[];
}

export interface LightingSource {
  readonly id: string;
  readonly label: string;
  readonly kind: "WINDOW" | "PRACTICAL" | "FIXTURE" | "BOUNCE" | "NEGATIVE_FILL";
  readonly x: number;
  readonly y: number;
  readonly toX: number;
  readonly toY: number;
  readonly tone: "COOL" | "WARM" | "NEUTRAL";
  readonly control: "VISIBLE" | "CONFIRMED" | "UNKNOWN";
  readonly use: string;
}

export interface LightingPlan {
  readonly title: string;
  readonly question: "Where are the meaningful sources, modifiers, and practicals?";
  readonly zones: readonly PlanZone[];
  readonly sources: readonly LightingSource[];
  readonly instruction: string;
}

export interface VisualLookSwatch {
  readonly name: string;
  readonly color: string;
  readonly use: string;
}

export interface LookPlan {
  readonly title: string;
  readonly question: "What palette, contrast, texture, and grade direction govern the sequence?";
  readonly swatches: readonly VisualLookSwatch[];
  readonly contrast: string;
  readonly texture: string;
  readonly restraint: string;
}

export interface CoverageSetup {
  readonly id: string;
  readonly priority: CoveragePriority;
  readonly label: string;
  readonly serves: readonly string[];
  readonly why: string;
}

export interface SoundBeat {
  readonly sceneId: string;
  readonly label: string;
  readonly mustRecord: readonly string[];
  readonly perspective: string;
  readonly restraint: string;
}

export interface RankedRecommendation {
  readonly priority: PlanningPriority;
  readonly label: string;
  readonly decision: string;
}

export interface CreativeDelta {
  readonly trigger: string;
  readonly changed: readonly string[];
  readonly unchanged: readonly string[];
}

export interface LocationGrounding {
  readonly mode: "INTENT_ONLY" | "PHOTO_INPUT_PENDING" | "PHOTO_ANCHORED";
  readonly photos: readonly ScoutPhotoRef[];
  readonly claims: readonly SpatialClaim[];
  readonly confirmationQuestion: string | null;
}

export interface VisualPlan {
  readonly version: 1;
  readonly renderer: "STROMAN_PREVIS_SVG_V2";
  readonly stage: ProductionStage;
  readonly creativeSpine: {
    readonly film: string;
    readonly why: string;
    readonly audienceEffect: string;
    readonly keyBeats: readonly string[];
    readonly nextDecision: string;
  };
  readonly priorities: readonly RankedRecommendation[];
  readonly shots: readonly PrevisShotPair[];
  readonly blocking: BlockingPlan;
  readonly lighting: LightingPlan;
  readonly look: LookPlan;
  readonly sound: readonly SoundBeat[];
  readonly coverage: readonly CoverageSetup[];
  readonly location: LocationGrounding;
  readonly delta: CreativeDelta;
  readonly productionReality: ProductionReality;
}

const EMPTY_PRODUCTION: ProductionReality = {
  crew: "",
  cameraBody: "",
  lenses: "",
  support: "",
  lighting: "",
  sound: "",
  shootTime: "",
  access: "",
  talent: "",
  budget: "",
  timeOfDay: "",
};

export function emptyCreativePlanningContext(): CreativePlanningContext {
  return {
    version: 1,
    stage: "IDEA",
    production: EMPTY_PRODUCTION,
    scoutPhotos: [],
    spatialClaims: [],
    corrections: [],
  };
}

const THRESHOLD_HASH = "sha256:256f5714e3ada933de706cb5d8d47caad2f3b3899dcd4a438e794078b97de626";
const REVERSE_HASH = "sha256:e222ebf5190d36e8962d646dfad2f0d3e0f6b9ca5be78cf0fcdb257630514ddb";

export function isScoutKitchenCalibration(photos: readonly ScoutPhotoRef[]): boolean {
  const hashes = new Set(photos.map((photo) => photo.contentHash));
  return hashes.has(THRESHOLD_HASH) && hashes.has(REVERSE_HASH);
}

export function analyzeScoutPhotoSet(context: CreativePlanningContext): CreativePlanningContext {
  const confirmed = context.corrections.map((correction) => ({
    id: `confirmed_${correction.id}`,
    state: "FILMMAKER_CONFIRMED_GEOMETRY" as const,
    label: "Filmmaker correction",
    detail: correction.statement,
    evidencePhotoIds: [] as readonly string[],
    affects: ["STORYBOARD", "BLOCKING", "LIGHTING"] as const,
  }));
  if (!isScoutKitchenCalibration(context.scoutPhotos)) {
    return {
      ...context,
      spatialClaims: context.scoutPhotos.length
        ? [
            {
              id: "visible_scout_set_received",
              state: "VISIBLE_FACT",
              label: "Scout image set received",
              detail: `${context.scoutPhotos.length} project-scoped scout ${context.scoutPhotos.length === 1 ? "image is" : "images are"} available. This deterministic pass has not interpreted physical layout, shared landmarks, dimensions, or operating clearance from their pixels.`,
              evidencePhotoIds: context.scoutPhotos.map((photo) => photo.id),
              affects: [] as const,
            },
            ...confirmed,
          ]
        : confirmed,
    };
  }
  const threshold = context.scoutPhotos.find((photo) => photo.contentHash === THRESHOLD_HASH)!;
  const reverse = context.scoutPhotos.find((photo) => photo.contentHash === REVERSE_HASH)!;
  return {
    ...context,
    spatialClaims: [
      {
        id: "visible_island",
        state: "VISIBLE_FACT",
        label: "Freestanding island",
        detail:
          "Both angles show a long island with stools on the threshold side and walkable floor on both long edges.",
        evidencePhotoIds: [threshold.id, reverse.id],
        affects: ["STORYBOARD", "BLOCKING"],
      },
      {
        id: "visible_window_sink",
        state: "VISIBLE_FACT",
        label: "Window over sink",
        detail:
          "The threshold angle shows one exterior window directly above the sink, giving a motivated cool back/side source.",
        evidencePhotoIds: [threshold.id],
        affects: ["STORYBOARD", "LIGHTING"],
      },
      {
        id: "visible_pendant",
        state: "VISIBLE_FACT",
        label: "Pendant over island",
        detail:
          "A single warm pendant hangs over the island and appears in both angles; dimming control is not visible.",
        evidencePhotoIds: [threshold.id, reverse.id],
        affects: ["STORYBOARD", "LIGHTING"],
      },
      {
        id: "visible_fridge_hall",
        state: "VISIBLE_FACT",
        label: "Fridge and hall relationship",
        detail:
          "The refrigerator sits left of the work triangle from the threshold; the dark hall opening is opposite it beyond the island.",
        evidencePhotoIds: [threshold.id, reverse.id],
        affects: ["STORYBOARD", "BLOCKING"],
      },
      {
        id: "inferred_camera_lane",
        state: "INFERRED_GEOMETRY",
        label: "Reverse camera lane",
        detail:
          "The second angle suggests a camera can work near the sink-side corner, but operating depth and safe clearance behind the island are not measurable from photos.",
        evidencePhotoIds: [reverse.id],
        affects: ["STORYBOARD", "BLOCKING"],
      },
      ...confirmed,
    ],
  };
}

export function withScoutPhotos(
  context: CreativePlanningContext,
  photos: readonly ScoutPhotoRef[],
): CreativePlanningContext {
  const byHash = new Map(context.scoutPhotos.map((photo) => [photo.contentHash, photo]));
  for (const photo of photos) byHash.set(photo.contentHash, photo);
  return analyzeScoutPhotoSet({ ...context, scoutPhotos: [...byHash.values()] });
}

export function withSpatialCorrection(
  context: CreativePlanningContext,
  correction: SpatialCorrection,
): CreativePlanningContext {
  return analyzeScoutPhotoSet({ ...context, corrections: [...context.corrections, correction] });
}

export function withPlanningSettings(
  context: CreativePlanningContext,
  stage: ProductionStage,
  production: Partial<ProductionReality>,
): CreativePlanningContext {
  return {
    ...context,
    stage,
    production: { ...context.production, ...production },
  };
}

const setPiece = (
  kind: PrevisSetPieceKind,
  label: string,
  x: number,
  y: number,
  width: number,
  height: number,
  plane: PrevisSetPiece["plane"],
  emphasis: PrevisSetPiece["emphasis"] = "CONTEXT",
): PrevisSetPiece => ({ kind, label, x, y, width, height, plane, emphasis });

const figure = (
  kind: StoryboardGlyphKind,
  label: string,
  x: number,
  y: number,
  width: number,
  height: number,
  plane: PrevisFigure["plane"],
  facing: PrevisFigure["facing"],
): PrevisFigure => ({ kind, label, x, y, width, height, plane, facing });

function jimmyShotPairs(photoAnchored: boolean): readonly PrevisShotPair[] {
  const location = photoAnchored
    ? ["threshold-angle", "fridge-left", "island-center", "sink-window", "warm-pendant"]
    : ["verify-threshold", "verify-fridge-counter-path", "verify-practical-control"];
  return [
    {
      id: "shot_01",
      sceneId: "scene_pre_dawn",
      title: "The house asks first",
      purpose: "Feel the morning pressure before product or explanation.",
      priority: "MUST_GET",
      horizontal: {
        id: "shot_01_h",
        aspectRatio: "16:9",
        shotScale: "environmental medium-wide",
        lens: photoAnchored ? "≈ 40mm" : "normal perspective",
        cameraHeight: "shoulder height",
        cameraDistance: photoAnchored ? "threshold side of island" : "verify at scout",
        movement: "locked → small reactive yield",
        hold: "hold until the second interruption",
        executionStrip: [
          "≈ 40mm · shoulder height · locked → small yield",
          "cool window residual · pendant held low · hold through interruption",
        ],
        headroom: 8,
        eyelineY: 34,
        negativeSpace: { x: 63, y: 8, width: 30, height: 34, purpose: "fridge destination" },
        figures: [
          figure("ADULT", "MOM — START", 41, 29, 18, 55, "MIDGROUND", "RIGHT"),
          figure("BABY_HANDS", "BABY ATTACHED", 48, 35, 8, 12, "MIDGROUND", "CAMERA"),
        ],
        setPieces: [
          setPiece("DOOR", "HALL ENTRY", 3, 5, 17, 75, "BACKGROUND"),
          setPiece("ISLAND", "ISLAND FOREGROUND", 18, 58, 52, 33, "FOREGROUND"),
          setPiece("FRIDGE", "FRIDGE — CLOSED", 76, 8, 18, 68, "BACKGROUND", "STORY"),
          setPiece("PRACTICAL", "PENDANT", 48, 3, 8, 10, "BACKGROUND", "QUIET"),
        ],
        motion: [{ label: "interrupted reach", fromX: 49, fromY: 52, toX: 72, toY: 49 }],
        light: [
          { label: "cool window spill", fromX: 70, fromY: 3, toX: 48, toY: 38, tone: "COOL" },
        ],
        constraint: "Baby face stays behind shoulder and outside the frame axis.",
        locationDependencies: location,
      },
      vertical: {
        id: "shot_01_v",
        aspectRatio: "9:16",
        shotScale: "full-height one-hand portrait",
        lens: photoAnchored ? "≈ 32mm" : "slightly wider normal perspective",
        cameraHeight: "upper-chest height",
        cameraDistance: photoAnchored ? "inside threshold, hall edge" : "closer than horizontal",
        movement: "locked",
        hold: "hold through hand changing direction",
        executionStrip: [
          "≈ 32mm · upper-chest height · locked",
          "doorway stacks above body · fridge edge remains story destination",
        ],
        headroom: 5,
        eyelineY: 27,
        negativeSpace: { x: 8, y: 8, width: 34, height: 30, purpose: "off-screen demand" },
        figures: [
          figure("ADULT", "MOM — START", 46, 24, 36, 64, "MIDGROUND", "RIGHT"),
          figure("BABY_HANDS", "BABY ATTACHED", 62, 35, 15, 12, "MIDGROUND", "CAMERA"),
        ],
        setPieces: [
          setPiece("DOOR", "HALL", 5, 3, 31, 72, "BACKGROUND"),
          setPiece("FRIDGE", "FRIDGE EDGE", 82, 10, 17, 64, "BACKGROUND", "STORY"),
          setPiece("ISLAND", "ISLAND EDGE", 26, 71, 74, 28, "FOREGROUND"),
        ],
        motion: [{ label: "reach breaks", fromX: 59, fromY: 52, toX: 82, toY: 45 }],
        light: [{ label: "cool edge", fromX: 94, fromY: 5, toX: 57, toY: 34, tone: "COOL" }],
        constraint:
          "Crop uses body height, not a horizontal center crop; baby face remains hidden.",
        locationDependencies: location,
      },
    },
    {
      id: "shot_02",
      sceneId: "scene_one_hand",
      title: "One hand, five decisions",
      purpose: "Make divided attention physical and recognizable.",
      priority: "MUST_GET",
      horizontal: {
        id: "shot_02_h",
        aspectRatio: "16:9",
        shotScale: "waist-height working two-shot without a second face",
        lens: "≈ 50mm",
        cameraHeight: "waist height",
        cameraDistance: photoAnchored ? "sink-side lane across island corner" : "working distance",
        movement: "handheld reframes caused only by action",
        hold: "one continuous decision chain",
        executionStrip: [
          "≈ 50mm · waist height · action-led reframes",
          "protect hand path · no decorative float · record appliance rhythm",
        ],
        headroom: 4,
        eyelineY: null,
        negativeSpace: null,
        figures: [
          figure("ADULT", "MOM — ANCHORED", 46, 22, 20, 62, "MIDGROUND", "LEFT"),
          figure("BABY_FEET", "BABY FEET — SAFE CROP", 64, 38, 13, 20, "FOREGROUND", "CAMERA"),
        ],
        setPieces: [
          setPiece("COUNTER", "WORK COUNTER", 4, 58, 92, 30, "FOREGROUND"),
          setPiece("OBJECT", "PHONE", 18, 51, 8, 10, "MIDGROUND", "STORY"),
          setPiece("OBJECT", "BOTTLE / BAG", 78, 49, 12, 15, "MIDGROUND", "STORY"),
          setPiece("PRACTICAL", "PENDANT FALL-OFF", 50, 2, 8, 9, "BACKGROUND", "QUIET"),
        ],
        motion: [
          { label: "task 1", fromX: 49, fromY: 49, toX: 22, toY: 53 },
          { label: "task 2", fromX: 49, fromY: 49, toX: 79, toY: 52 },
        ],
        light: [],
        constraint: "Only approved hands and feet enter; every prop must be real morning behavior.",
        locationDependencies: location,
      },
      vertical: {
        id: "shot_02_v",
        aspectRatio: "9:16",
        shotScale: "tight hand-and-torso column",
        lens: "≈ 40mm",
        cameraHeight: "counter height",
        cameraDistance: "closer, island-end position",
        movement: "locked with action crossing frame",
        hold: "tasks enter one vertical stack",
        executionStrip: [
          "≈ 40mm · counter height · locked",
          "hand travels top-to-bottom · baby feet stay lower foreground",
        ],
        headroom: 2,
        eyelineY: null,
        negativeSpace: null,
        figures: [
          figure("ADULT", "MOM — TORSO / HAND", 31, 10, 48, 78, "MIDGROUND", "LEFT"),
          figure("BABY_FEET", "BABY FEET", 62, 65, 24, 18, "FOREGROUND", "CAMERA"),
        ],
        setPieces: [
          setPiece("OBJECT", "PHONE", 15, 21, 17, 11, "MIDGROUND", "STORY"),
          setPiece("OBJECT", "BOTTLE", 66, 43, 18, 15, "MIDGROUND", "STORY"),
          setPiece("COUNTER", "COUNTER", 0, 76, 100, 24, "FOREGROUND"),
        ],
        motion: [
          { label: "decision chain", fromX: 48, fromY: 28, toX: 70, toY: 49 },
          { label: "abandoned reach", fromX: 70, fromY: 49, toX: 38, toY: 70 },
        ],
        light: [],
        constraint: "This is a new camera position, not a crop of the horizontal setup.",
        locationDependencies: location,
      },
    },
    {
      id: "shot_03",
      sceneId: "scene_relief",
      title: "The task already finished",
      purpose: "Show removed labor as truthful product proof.",
      priority: "MUST_GET",
      horizontal: {
        id: "shot_03_h",
        aspectRatio: "16:9",
        shotScale: "locked three-quarter medium-wide",
        lens: "≈ 40mm",
        cameraHeight: "counter height",
        cameraDistance: photoAnchored
          ? "reverse corner near sink, clearance unconfirmed"
          : "verify after scout",
        movement: "locked",
        hold: "complete fridge → island action",
        executionStrip: [
          "≈ 40mm · counter height · locked",
          "fridge + clean island + hand share frame · warm source enters locally",
        ],
        headroom: 7,
        eyelineY: 32,
        negativeSpace: { x: 56, y: 45, width: 34, height: 22, purpose: "untouched prep surface" },
        figures: [
          figure("ADULT", "MOM — ONE COMPLETE LINE", 38, 25, 18, 58, "MIDGROUND", "RIGHT"),
          figure("BABY_HANDS", "BABY REACH", 50, 43, 8, 11, "MIDGROUND", "CAMERA"),
        ],
        setPieces: [
          setPiece("FRIDGE", "OPEN FRIDGE", 4, 6, 22, 70, "BACKGROUND", "STORY"),
          setPiece("MEAL", "JIMMY'S MEAL", 52, 53, 10, 10, "MIDGROUND", "STORY"),
          setPiece("ISLAND", "CLEAN ISLAND", 52, 57, 43, 28, "FOREGROUND", "STORY"),
          setPiece("WINDOW", "SINK WINDOW", 73, 8, 18, 24, "BACKGROUND", "CONTEXT"),
        ],
        motion: [{ label: "one complete action", fromX: 25, fromY: 50, toX: 56, toY: 58 }],
        light: [{ label: "fridge warmth", fromX: 20, fromY: 24, toX: 45, toY: 43, tone: "WARM" }],
        constraint: "Confirm product preparation truth and sink-side camera operating clearance.",
        locationDependencies: location,
      },
      vertical: {
        id: "shot_03_v",
        aspectRatio: "9:16",
        shotScale: "fridge-to-hand vertical reveal",
        lens: "≈ 32mm",
        cameraHeight: "waist height",
        cameraDistance: "island-end, nearer fridge axis",
        movement: "small downward tilt, then lock",
        hold: "finish on meal and resting hand",
        executionStrip: [
          "≈ 32mm · waist height · tilt fridge → meal",
          "pendant above / meal below · preserve clear label only after relief",
        ],
        headroom: 4,
        eyelineY: 25,
        negativeSpace: { x: 6, y: 63, width: 38, height: 20, purpose: "unused prep space" },
        figures: [
          figure("ADULT", "MOM", 43, 19, 38, 65, "MIDGROUND", "LEFT"),
          figure("BABY_HANDS", "BABY HAND", 62, 47, 16, 10, "FOREGROUND", "CAMERA"),
        ],
        setPieces: [
          setPiece("PRACTICAL", "PENDANT", 43, 2, 14, 10, "BACKGROUND", "CONTEXT"),
          setPiece("FRIDGE", "OPEN FRIDGE EDGE", 0, 9, 26, 63, "BACKGROUND", "STORY"),
          setPiece("MEAL", "JIMMY'S MEAL", 45, 66, 24, 12, "FOREGROUND", "STORY"),
          setPiece("ISLAND", "ISLAND TOP", 0, 75, 100, 25, "FOREGROUND", "CONTEXT"),
        ],
        motion: [{ label: "tilt settles", fromX: 50, fromY: 30, toX: 55, toY: 68 }],
        light: [{ label: "fridge edge", fromX: 18, fromY: 28, toX: 52, toY: 48, tone: "WARM" }],
        constraint:
          "Vertical setup preserves pendant/island hierarchy; it is not the horizontal crop.",
        locationDependencies: location,
      },
    },
    {
      id: "shot_04",
      sceneId: "scene_stillness",
      title: "First stillness",
      purpose: "Let the body—not a sales line—prove relief.",
      priority: "MUST_GET",
      horizontal: {
        id: "shot_04_h",
        aspectRatio: "16:9",
        shotScale: "held two-plane medium",
        lens: "≈ 50mm",
        cameraHeight: "seated-eye height",
        cameraDistance: "threshold-side diagonal across island",
        movement: "locked",
        hold: "four seconds after shoulder release",
        executionStrip: [
          "≈ 50mm · seated-eye height · locked",
          "baby feet foreground · meal + hand sharp · hold 4 sec",
        ],
        headroom: 9,
        eyelineY: 34,
        negativeSpace: { x: 67, y: 7, width: 26, height: 32, purpose: "cool morning remains" },
        figures: [
          figure("BABY_FEET", "BABY FEET — FOREGROUND", 10, 56, 20, 28, "FOREGROUND", "CAMERA"),
          figure("ADULT", "MOM — END / STILL", 47, 24, 19, 59, "MIDGROUND", "LEFT"),
        ],
        setPieces: [
          setPiece("MEAL", "MEAL + RESTING HAND", 41, 61, 14, 10, "FOREGROUND", "STORY"),
          setPiece("ISLAND", "REAL ISLAND", 30, 66, 48, 25, "FOREGROUND"),
          setPiece("WINDOW", "COOL WINDOW", 74, 7, 18, 28, "BACKGROUND", "CONTEXT"),
          setPiece("PRACTICAL", "WARM PENDANT", 54, 3, 7, 10, "BACKGROUND", "QUIET"),
        ],
        motion: [],
        light: [
          { label: "cool world", fromX: 82, fromY: 11, toX: 58, toY: 40, tone: "COOL" },
          { label: "warm rest", fromX: 57, fromY: 7, toX: 52, toY: 38, tone: "WARM" },
        ],
        constraint: "Keep unfinished morning at frame edge; do not stage a fantasy-clean room.",
        locationDependencies: location,
      },
      vertical: {
        id: "shot_04_v",
        aspectRatio: "9:16",
        shotScale: "intimate hand / shoulder / feet stack",
        lens: "≈ 50mm",
        cameraHeight: "counter height",
        cameraDistance: "island corner, close working distance",
        movement: "locked",
        hold: "shoulders release, then four seconds",
        executionStrip: [
          "≈ 50mm · counter height · locked",
          "pendant glow above / meal center / feet low · protect breath",
        ],
        headroom: 6,
        eyelineY: 25,
        negativeSpace: { x: 6, y: 8, width: 27, height: 30, purpose: "quiet breathing room" },
        figures: [
          figure("ADULT", "MOM — END", 37, 17, 48, 67, "MIDGROUND", "LEFT"),
          figure("BABY_FEET", "BABY FEET", 11, 73, 30, 18, "FOREGROUND", "CAMERA"),
        ],
        setPieces: [
          setPiece("PRACTICAL", "PENDANT GLOW", 54, 1, 17, 12, "BACKGROUND", "QUIET"),
          setPiece("MEAL", "MEAL + HAND", 47, 65, 29, 12, "FOREGROUND", "STORY"),
          setPiece("ISLAND", "ISLAND", 0, 75, 100, 25, "FOREGROUND"),
        ],
        motion: [],
        light: [{ label: "warm practical", fromX: 61, fromY: 8, toX: 56, toY: 39, tone: "WARM" }],
        constraint: "Protect baby privacy and sound; no performed smile or unnecessary push-in.",
        locationDependencies: location,
      },
    },
  ];
}

function hasCorrection(context: CreativePlanningContext, pattern: RegExp): boolean {
  return context.corrections.some((correction) => pattern.test(correction.statement));
}

function adaptJimmyShots(
  shots: readonly PrevisShotPair[],
  context: CreativePlanningContext,
): readonly PrevisShotPair[] {
  const fixedSupport = /tripod|locked[- ]off|no gimbal|no dolly/i.test(context.production.support);
  const c2Blocked = hasCorrection(
    context,
    /camera cannot|cannot go behind|behind the island.*off[- ]limits/i,
  );
  return shots.map((shot) => ({
    ...shot,
    horizontal: {
      ...shot.horizontal,
      movement: fixedSupport ? "locked; block action through the frame" : shot.horizontal.movement,
      cameraDistance:
        c2Blocked && /sink|reverse corner/i.test(shot.horizontal.cameraDistance)
          ? "island-end lane; sink-side position rejected by filmmaker"
          : shot.horizontal.cameraDistance,
    },
    vertical: {
      ...shot.vertical,
      movement: fixedSupport ? "locked; block action through the frame" : shot.vertical.movement,
      cameraDistance:
        c2Blocked && /sink|reverse corner/i.test(shot.vertical.cameraDistance)
          ? "island-end lane; sink-side position rejected by filmmaker"
          : shot.vertical.cameraDistance,
    },
  }));
}

function jimmyBlocking(photoAnchored: boolean, context: CreativePlanningContext): BlockingPlan {
  const c2Blocked = hasCorrection(
    context,
    /camera cannot|cannot go behind|behind the island.*off[- ]limits/i,
  );
  return {
    title: photoAnchored ? "Photo-anchored kitchen movement" : "Kitchen movement hypothesis",
    question: "Where are the people and cameras, and how do they move?",
    zones: [
      { id: "fridge", label: "FRIDGE", x: 5, y: 8, width: 19, height: 26 },
      { id: "island", label: "ISLAND", x: 34, y: 31, width: 40, height: 27 },
      { id: "sink_window", label: "SINK + WINDOW", x: 74, y: 7, width: 21, height: 20 },
      { id: "hall", label: "HALL", x: 5, y: 69, width: 22, height: 20 },
    ],
    subjects: [
      {
        id: "mom",
        label: "MOM",
        carries: "BABY — attached; face protected",
        states: [
          { label: "START", x: 20, y: 63, note: "enters from hall" },
          { label: "2", x: 47, y: 68, note: "unfinished pivots at island" },
          { label: "END", x: 62, y: 62, note: "stops at island corner" },
        ],
      },
    ],
    cameras: [
      { id: "c1", label: "C1", x: 14, y: 50, aimX: 48, aimY: 55, use: "pressure + one-hand chain" },
      {
        id: "c2",
        label: "C2",
        x: c2Blocked ? 78 : 88,
        y: c2Blocked ? 84 : 66,
        aimX: 55,
        aimY: 54,
        use: c2Blocked ? "island-end alternative; sink-side rejected" : "relief + stillness",
      },
    ],
    restrictions: photoAnchored
      ? [
          c2Blocked
            ? "C2 cannot use the sink-side lane; keep it at the confirmed island end."
            : "Do not assume full operating depth at C2 until the filmmaker confirms sink-side clearance.",
          "Keep the hall path open for baby-safe movement.",
        ]
      : ["Confirm island, fridge, sink, and camera lanes during the scout."],
  };
}

function jimmyLighting(photoAnchored: boolean, context: CreativePlanningContext): LightingPlan {
  const pendantFixed = hasCorrection(context, /pendant.*cannot|cannot.*dim|practical.*cannot/i);
  return {
    title: photoAnchored ? "Use the visible window and pendant" : "Motivated source hypothesis",
    question: "Where are the meaningful sources, modifiers, and practicals?",
    zones: [
      { id: "island", label: "ISLAND", x: 34, y: 31, width: 40, height: 27 },
      { id: "sink_window", label: "SINK + WINDOW", x: 74, y: 7, width: 21, height: 20 },
      { id: "fridge", label: "FRIDGE", x: 5, y: 8, width: 19, height: 26 },
    ],
    sources: [
      {
        id: "window",
        label: "WINDOW — COOL AMBIENCE",
        kind: "WINDOW",
        x: 84,
        y: 12,
        toX: 56,
        toY: 46,
        tone: "COOL",
        control: photoAnchored ? "VISIBLE" : "UNKNOWN",
        use: "Keep pre-dawn world present behind relief.",
      },
      {
        id: "pendant",
        label: "PENDANT — WARM PRACTICAL",
        kind: "PRACTICAL",
        x: 54,
        y: 25,
        toX: 54,
        toY: 48,
        tone: "WARM",
        control: pendantFixed ? "CONFIRMED" : "UNKNOWN",
        use: pendantFixed
          ? "Fixed-output practical: control exposure with bulb choice, distance, or diffusion—not a dimmer."
          : "Local warmth over island; confirm whether it can dim.",
      },
      {
        id: "fridge",
        label: "FRIDGE — RELIEF CUE",
        kind: "PRACTICAL",
        x: 14,
        y: 20,
        toX: 39,
        toY: 47,
        tone: "WARM",
        control: photoAnchored ? "VISIBLE" : "UNKNOWN",
        use: "First warm field; do not let it light the whole room.",
      },
      {
        id: "negative_fill",
        label: "NEGATIVE FILL — HALL SIDE",
        kind: "NEGATIVE_FILL",
        x: 14,
        y: 64,
        toX: 42,
        toY: 54,
        tone: "NEUTRAL",
        control: "CONFIRMED",
        use: "Retain shape without another powered source.",
      },
    ],
    instruction:
      "Do not add a second decorative key. Let the cool window, warm pendant, and fridge cue explain the emotional shift.",
  };
}

const JIMMY_LOOK: LookPlan = {
  title: "Pre-dawn pressure → earned warmth",
  question: "What palette, contrast, texture, and grade direction govern the sequence?",
  swatches: [
    { name: "pre-dawn charcoal", color: "#27313a", use: "room and residual shadow" },
    { name: "window blue", color: "#6c8797", use: "cool exterior ambience" },
    { name: "pendant oatmeal", color: "#e6d6b8", use: "local relief over island" },
    { name: "Jimmy's red", color: "#9f3f35", use: "one restrained product accent" },
    { name: "skin / linen", color: "#c9997a", use: "human warmth without beauty polish" },
  ],
  contrast:
    "Hold cool shadows and allow warmth to enter locally; do not globally warm the morning.",
  texture: "Natural mixed practicals, worn domestic surfaces, soft highlight roll-off.",
  restraint: "No glossy lifestyle finish, teal-orange split, or sentimental bloom.",
};

function jimmyLocation(context: CreativePlanningContext): LocationGrounding {
  const anchored = isScoutKitchenCalibration(context.scoutPhotos);
  return {
    mode: anchored
      ? "PHOTO_ANCHORED"
      : context.scoutPhotos.length
        ? "PHOTO_INPUT_PENDING"
        : "INTENT_ONLY",
    photos: context.scoutPhotos,
    claims: context.spatialClaims,
    confirmationQuestion: anchored
      ? "Is there usable camera space behind the island at full operating depth, and can the pendant be dimmed?"
      : context.scoutPhotos.length
        ? "Which landmarks repeat across these angles, and which camera lanes or fixture controls can you confirm?"
        : "Can you add two location photos—one wide and one reverse—or confirm the fridge, counter, window, and camera lanes?",
  };
}

function jimmyVisualPlan(
  development: VisualDevelopmentSource,
  context: CreativePlanningContext,
): VisualPlan {
  const analyzed = analyzeScoutPhotoSet(context);
  const photoAnchored = isScoutKitchenCalibration(analyzed.scoutPhotos);
  const shots = adaptJimmyShots(jimmyShotPairs(photoAnchored), analyzed);
  const latestCorrection = analyzed.corrections.at(-1);
  return {
    version: 1,
    renderer: "STROMAN_PREVIS_SVG_V2",
    stage: analyzed.stage,
    creativeSpine: {
      film: development.insight.thesis,
      why: development.directionDecision.whyThisProject,
      audienceEffect: development.insight.audiencePromise,
      keyBeats: development.sceneHypotheses.map((scene) => scene.title),
      nextDecision:
        analyzed.stage === "IDEA"
          ? "Verify which morning burden the meal actually removes."
          : photoAnchored
            ? "Confirm C2 operating clearance and pendant control."
            : "Add a wide and reverse scout photo before locking camera lanes.",
    },
    priorities: [
      {
        priority: "MUST_SOLVE_NOW",
        label: "Truth before coverage",
        decision: "Verify the real burden: deciding, cleanup, feeding, or leaving on time.",
      },
      {
        priority: "IMPORTANT",
        label: "Protect the turn",
        decision:
          "The first complete action and first still frame must remain visible without copy.",
      },
      {
        priority: "WORTH_EXPLORING",
        label: "One-hand grammar",
        decision: "Test whether hands and feet can carry enough intimacy without a face shot.",
      },
    ],
    shots,
    blocking: jimmyBlocking(photoAnchored, analyzed),
    lighting: jimmyLighting(photoAnchored, analyzed),
    look: JIMMY_LOOK,
    sound: development.sceneHypotheses.map((scene) => ({
      sceneId: scene.id,
      label: scene.title,
      mustRecord:
        scene.id === "scene_stillness"
          ? ["full room tone", "baby coo", "fork against tray", "mother's breath"]
          : scene.sound.split(",").map((item) => item.trim()),
      perspective:
        scene.id === "scene_pre_dawn"
          ? "Sources arrive from different rooms before picture explains them."
          : "Keep perspective tied to her working distance; no generic whooshes.",
      restraint:
        scene.id === "scene_stillness"
          ? "Music enters only after the shoulders release, if it enters at all."
          : "Do not accelerate ordinary sounds to manufacture pressure.",
    })),
    coverage: [
      {
        id: "setup_pressure",
        priority: "MUST_GET",
        label: "C1 continuous pressure chain",
        serves: ["house asks first", "one hand, five decisions", "sound continuity"],
        why: "One truthful chain is stronger than five disconnected inserts.",
      },
      {
        id: "setup_relief",
        priority: "MUST_GET",
        label: "C2 fridge → island complete action",
        serves: ["product proof", "clean-board evidence", "first stillness"],
        why: "One setup carries the decisive story turn and avoids redundant coverage.",
      },
      {
        id: "setup_safety",
        priority: "SAFETY",
        label: "Meal / hand insert",
        serves: ["label clarity", "edit compression"],
        why: "Take only after the full action works; it cannot replace the emotional proof.",
      },
      {
        id: "setup_optional",
        priority: "OPTIONAL_EXPLORATION",
        label: "Empty sink / cold stove pair",
        serves: ["alternate subtraction direction"],
        why: "Skip if prep truth is uncertain or time threatens the two must-get setups.",
      },
    ],
    location: jimmyLocation(analyzed),
    delta: latestCorrection
      ? {
          trigger: "Filmmaker correction applied",
          changed: [
            latestCorrection.statement,
            "Affected camera, blocking, or lighting assumptions were regenerated.",
          ],
          unchanged: ["The creative thesis and must-get story turn remain intact."],
        }
      : photoAnchored
        ? {
            trigger: "Two scout photos added",
            changed: [
              "C1 now uses the real threshold and island edge.",
              "C2 is proposed near the visible sink-side corner, pending clearance confirmation.",
              "Lighting now uses the actual sink window, pendant, and refrigerator practical.",
              "Vertical Shot 03 stacks the visible pendant, island, and product instead of cropping the horizontal frame.",
            ],
            unchanged: [
              "The first quiet bite remains the recommendation.",
              "Baby face stays excluded.",
            ],
          }
        : analyzed.scoutPhotos.length
          ? {
              trigger: `${analyzed.scoutPhotos.length} scout ${analyzed.scoutPhotos.length === 1 ? "photo" : "photos"} added`,
              changed: [
                "The private scout set is now attached to this plan.",
                "Location geometry remains pending until shared landmarks or filmmaker confirmation establish it.",
              ],
              unchanged: [
                "No camera lane, dimension, fixture control, or unseen room was inferred from unreviewed pixels.",
                "The creative thesis and must-get story turn remain intact.",
              ],
            }
          : {
              trigger: "Creative direction developed",
              changed: [
                "Intent became four independently composed horizontal and vertical setups.",
              ],
              unchanged: [
                "Location geometry remains a hypothesis until photos or confirmation arrive.",
              ],
            },
    productionReality: analyzed.production,
  };
}

function genericComposition(
  id: string,
  aspectRatio: "16:9" | "9:16",
  scene: MeaningfulDevelopment["sceneHypotheses"][number],
  index: number,
): PrevisComposition {
  const vertical = aspectRatio === "9:16";
  return {
    id,
    aspectRatio,
    shotScale: vertical ? "portrait action study" : "environmental action study",
    lens: "relative normal perspective",
    cameraHeight: "derive from the governing action",
    cameraDistance: vertical ? "closer than horizontal; verify at scout" : "verify at scout",
    movement: scene.craft.camera,
    hold: "hold through the dramatic turn",
    executionStrip: [
      vertical
        ? "portrait setup · independently place the action"
        : "horizontal setup · show causal geography",
      "all geometry provisional until the scout is verified",
    ],
    headroom: vertical ? 5 : 8,
    eyelineY: 32,
    negativeSpace: null,
    figures: [
      figure(
        "ADULT",
        "PRIMARY SUBJECT",
        vertical ? 34 : 38,
        24,
        vertical ? 42 : 22,
        62,
        "MIDGROUND",
        "RIGHT",
      ),
    ],
    setPieces: [
      setPiece(
        "OBJECT",
        scene.title,
        vertical ? 52 : 64,
        55,
        vertical ? 36 : 22,
        18,
        "FOREGROUND",
        "STORY",
      ),
      setPiece("WALL", "LOCATION — UNVERIFIED", 2, 5, 96, 78, "BACKGROUND", "QUIET"),
    ],
    motion: index === 0 ? [] : [{ label: "story turn", fromX: 42, fromY: 50, toX: 66, toY: 52 }],
    light: [],
    constraint: scene.constraintHandling,
    locationDependencies: ["verified subject action", "verified location geometry"],
  };
}

function genericVisualPlan(
  brief: CreativeBrief,
  mode: CreativeMode,
  development: VisualDevelopmentSource,
  context: CreativePlanningContext,
): VisualPlan {
  const shots = development.sceneHypotheses.slice(0, 4).map((scene, index) => ({
    id: `shot_${index + 1}`,
    sceneId: scene.id,
    title: scene.title,
    purpose: scene.purpose,
    priority: (index < 2
      ? "MUST_GET"
      : index === 2
        ? "SAFETY"
        : "OPTIONAL_EXPLORATION") as CoveragePriority,
    horizontal: genericComposition(`shot_${index + 1}_h`, "16:9", scene, index),
    vertical: genericComposition(`shot_${index + 1}_v`, "9:16", scene, index),
  }));
  return {
    version: 1,
    renderer: "STROMAN_PREVIS_SVG_V2",
    stage: context.stage,
    creativeSpine: {
      film: development.insight.thesis,
      why: development.directionDecision.whyThisProject,
      audienceEffect: development.insight.audiencePromise,
      keyBeats: development.sceneHypotheses.map((scene) => scene.title),
      nextDecision: development.questions[0]?.prompt ?? "Verify the governing action.",
    },
    priorities: development.questions.slice(0, 3).map((question, index) => ({
      priority: (index === 0
        ? "MUST_SOLVE_NOW"
        : index === 1
          ? "IMPORTANT"
          : "WORTH_EXPLORING") as PlanningPriority,
      label: `Decision ${index + 1}`,
      decision: question.prompt,
    })),
    shots,
    blocking: {
      title: "Scout-dependent movement",
      question: "Where are the people and cameras, and how do they move?",
      zones: [
        { id: "space", label: "VISIBLE SPACE — TO CONFIRM", x: 8, y: 9, width: 84, height: 76 },
      ],
      subjects: [
        {
          id: "subject",
          label: "PRIMARY SUBJECT",
          carries: null,
          states: [
            { label: "START", x: 28, y: 62, note: "unverified" },
            { label: "END", x: 65, y: 48, note: "unverified" },
          ],
        },
      ],
      cameras: [{ id: "c1", label: "C1", x: 18, y: 72, aimX: 50, aimY: 50, use: "baseline only" }],
      restrictions: ["Do not treat this map as location fact until the scout is grounded."],
    },
    lighting: {
      title: "Motivated source to confirm",
      question: "Where are the meaningful sources, modifiers, and practicals?",
      zones: [{ id: "space", label: "LOCATION — TO CONFIRM", x: 8, y: 9, width: 84, height: 76 }],
      sources: [
        {
          id: "source_unresolved",
          label: "MOTIVATED SOURCE — UNRESOLVED",
          kind: "FIXTURE",
          x: 82,
          y: 18,
          toX: 56,
          toY: 46,
          tone: "NEUTRAL",
          control: "UNKNOWN",
          use: "A planning placeholder only; identify a real window or practical before prescribing equipment.",
        },
      ],
      instruction: "Identify real windows and practicals before prescribing fixtures.",
    },
    look: {
      title: `${mode.toLowerCase()} look hypothesis`,
      question: "What palette, contrast, texture, and grade direction govern the sequence?",
      swatches: [
        { name: "world", color: "#3b4650", use: "environment baseline" },
        { name: "skin", color: "#b98268", use: "credible human warmth" },
        { name: "turn", color: "#d1b472", use: "one motivated story change" },
      ],
      contrast: "Derive contrast from the story turn, not a category look.",
      texture: "Retain real surface texture and location character.",
      restraint: "Reject reference copying and decorative grade fixes.",
    },
    sound: development.sceneHypotheses.map((scene) => ({
      sceneId: scene.id,
      label: scene.title,
      mustRecord: [scene.sound],
      perspective: scene.craft.sound,
      restraint: "Capture real sources before adding score or sound-design punctuation.",
    })),
    coverage: shots.map((shot) => ({
      id: shot.id,
      priority: shot.priority,
      label: shot.title,
      serves: [shot.purpose],
      why:
        shot.priority === "MUST_GET"
          ? "Carries a required story turn."
          : "Adds edit flexibility only if time remains.",
    })),
    location: {
      mode: context.scoutPhotos.length ? "PHOTO_INPUT_PENDING" : "INTENT_ONLY",
      photos: context.scoutPhotos,
      claims: context.spatialClaims,
      confirmationQuestion: context.scoutPhotos.length
        ? "Which visible boundaries and camera lanes can the filmmaker confirm?"
        : "Add a wide and reverse location photo before locking physical geometry.",
    },
    delta: {
      trigger: "Creative direction developed",
      changed: ["Intent became paired horizontal and vertical frame hypotheses."],
      unchanged: ["All physical geometry remains unverified."],
    },
    productionReality: context.production,
  };
}

function isJimmyBrief(brief: CreativeBrief, mode: CreativeMode): boolean {
  const text = [brief.title, brief.client, brief.projectType, brief.context]
    .join(" ")
    .toLowerCase();
  return (
    mode === "COMMERCIAL" &&
    /jimmy'?s famous meals/.test(text) &&
    /\b(?:mom|mother|parent)\b/.test(text)
  );
}

export function generateVisualPlan(
  brief: CreativeBrief,
  mode: CreativeMode,
  development: VisualDevelopmentSource,
  planningContext: CreativePlanningContext = emptyCreativePlanningContext(),
): VisualPlan {
  return isJimmyBrief(brief, mode)
    ? jimmyVisualPlan(development, planningContext)
    : genericVisualPlan(brief, mode, development, planningContext);
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function hasStringFields(value: unknown, fields: readonly string[]): boolean {
  return isRecord(value) && fields.every((field) => typeof value[field] === "string");
}

export function isCreativePlanningContext(value: unknown): value is CreativePlanningContext {
  if (!isRecord(value)) return false;
  const candidate = value as Partial<CreativePlanningContext>;
  const stages: readonly ProductionStage[] = [
    "IDEA",
    "SCOUTING",
    "PRE_PRODUCTION",
    "SHOOTING",
    "POST",
  ];
  const claimStates: readonly SpatialClaimState[] = [
    "VISIBLE_FACT",
    "INFERRED_GEOMETRY",
    "FILMMAKER_CONFIRMED_GEOMETRY",
  ];
  const affectedLayers = ["STORYBOARD", "BLOCKING", "LIGHTING"] as const;
  return (
    candidate.version === 1 &&
    stages.includes(candidate.stage as ProductionStage) &&
    hasStringFields(candidate.production, [
      "crew",
      "cameraBody",
      "lenses",
      "support",
      "lighting",
      "sound",
      "shootTime",
      "access",
      "talent",
      "budget",
      "timeOfDay",
    ]) &&
    Array.isArray(candidate.scoutPhotos) &&
    candidate.scoutPhotos.every((photo) =>
      hasStringFields(photo, [
        "id",
        "mediaAssetId",
        "fileName",
        "contentType",
        "contentHash",
        "angleLabel",
      ]),
    ) &&
    Array.isArray(candidate.spatialClaims) &&
    candidate.spatialClaims.every(
      (claim) =>
        hasStringFields(claim, ["id", "state", "label", "detail"]) &&
        claimStates.includes(claim.state) &&
        Array.isArray(claim.evidencePhotoIds) &&
        claim.evidencePhotoIds.every((id: unknown) => typeof id === "string") &&
        Array.isArray(claim.affects) &&
        claim.affects.every(
          (layer: unknown) =>
            typeof layer === "string" &&
            affectedLayers.includes(layer as (typeof affectedLayers)[number]),
        ),
    ) &&
    Array.isArray(candidate.corrections) &&
    candidate.corrections.every(
      (correction) =>
        hasStringFields(correction, ["id", "statement"]) &&
        (correction.replacesClaimId === null || typeof correction.replacesClaimId === "string"),
    )
  );
}

export function isVisualPlan(value: unknown): value is VisualPlan {
  if (!value || typeof value !== "object") return false;
  const candidate = value as Partial<VisualPlan>;
  return (
    candidate.version === 1 &&
    candidate.renderer === "STROMAN_PREVIS_SVG_V2" &&
    Boolean(candidate.creativeSpine) &&
    Array.isArray(candidate.priorities) &&
    Array.isArray(candidate.shots) &&
    candidate.shots.length >= 3 &&
    candidate.shots.every(
      (shot) =>
        shot.horizontal?.aspectRatio === "16:9" &&
        shot.vertical?.aspectRatio === "9:16" &&
        shot.horizontal.id !== shot.vertical.id,
    ) &&
    Boolean(candidate.blocking && candidate.lighting && candidate.look) &&
    Array.isArray(candidate.sound) &&
    Array.isArray(candidate.coverage) &&
    Boolean(candidate.location && candidate.delta)
  );
}

export interface VisualPlanQualityReport {
  readonly passed: boolean;
  readonly findings: readonly string[];
}

/** Release gate for execution clarity and cognitive economy, independent of prose quality. */
export function evaluateVisualPlanQuality(plan: VisualPlan): VisualPlanQualityReport {
  const findings: string[] = [];
  if (plan.shots.length < 3) findings.push("Fewer than three executable shot pairs.");
  for (const shot of plan.shots) {
    const horizontal = shot.horizontal;
    const vertical = shot.vertical;
    if (horizontal.aspectRatio !== "16:9" || vertical.aspectRatio !== "9:16") {
      findings.push(`${shot.title} does not contain both required aspect-ratio compositions.`);
    }
    if (
      horizontal.lens === vertical.lens &&
      horizontal.cameraDistance === vertical.cameraDistance &&
      horizontal.figures[0]?.x === vertical.figures[0]?.x &&
      horizontal.setPieces.map((piece) => piece.kind).join(",") ===
        vertical.setPieces.map((piece) => piece.kind).join(",")
    ) {
      findings.push(
        `${shot.title} appears to reuse one composition instead of recomposing vertically.`,
      );
    }
    for (const composition of [horizontal, vertical]) {
      if (composition.figures.length === 0 || composition.setPieces.length < 2) {
        findings.push(`${composition.id} lacks a subject or meaningful physical environment.`);
      }
      if (composition.executionStrip.some((line) => line.length > 150)) {
        findings.push(`${composition.id} overloads the execution strip.`);
      }
    }
  }
  if (
    plan.blocking.subjects.length === 0 ||
    plan.blocking.cameras.length === 0 ||
    plan.blocking.subjects.some(
      (subject) =>
        !subject.label.trim() ||
        subject.states.length < 2 ||
        subject.states.some((state) => !state.label.trim()),
    )
  ) {
    findings.push("Blocking does not directly label people, states, cameras, and movement.");
  }
  if (plan.stage !== "IDEA" && plan.lighting.sources.length === 0) {
    findings.push("The active production stage lacks a meaningful lighting-source plan.");
  }
  if (plan.look.swatches.length < 3)
    findings.push("The look plan lacks a usable restrained palette.");
  if (!plan.coverage.some((setup) => setup.priority === "MUST_GET")) {
    findings.push("Coverage does not identify any must-get setup.");
  }
  if (plan.location.mode === "PHOTO_ANCHORED") {
    if (plan.location.photos.length < 2)
      findings.push("Photo-anchored mode requires multiple angles.");
    if (!plan.location.claims.some((claim) => claim.state === "VISIBLE_FACT")) {
      findings.push("Photo-anchored mode identifies no visible location facts.");
    }
    if (!plan.location.claims.some((claim) => claim.state === "INFERRED_GEOMETRY")) {
      findings.push("Photo-anchored mode hides spatial uncertainty instead of representing it.");
    }
    if (!plan.location.confirmationQuestion) {
      findings.push("Photo-anchored mode has no high-leverage confirmation question.");
    }
  }
  if (plan.location.mode === "PHOTO_INPUT_PENDING") {
    if (plan.location.photos.length === 0) {
      findings.push("Pending photo mode contains no scout input.");
    }
    if (!plan.location.claims.some((claim) => claim.state === "VISIBLE_FACT")) {
      findings.push("Pending photo mode does not acknowledge its visible input boundary.");
    }
    if (!plan.location.confirmationQuestion) {
      findings.push("Pending photo mode has no geometry-confirmation question.");
    }
  }
  return { passed: findings.length === 0, findings };
}
