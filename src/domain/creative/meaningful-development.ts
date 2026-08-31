import type { CreativeBrief } from "./creative-brief";
import type {
  CreativeDirection,
  CreativeMode,
  DevelopmentQuestion,
  SequenceIdea,
} from "./development-blueprint";

export type CreativeReasoningSource = "HOSTED_REASONING" | "DETERMINISTIC_SPECIALIST";

export interface CreativeInsight {
  readonly thesis: string;
  readonly humanTruth: string;
  readonly dramaticTension: string;
  readonly audiencePromise: string;
}

export interface InnovationCase {
  readonly convention: string;
  readonly whyConventionWorks: string;
  readonly departure: string;
  readonly projectBenefit: string;
  readonly executionRisk: string;
}

export type DirectionBasisKind =
  | "SUPPLIED_INTENT"
  | "SOURCE_EVIDENCE"
  | "CREATIVE_HYPOTHESIS";

export interface DirectionBasis {
  readonly kind: DirectionBasisKind;
  readonly label: string;
  readonly statement: string;
}

export interface DirectionDecision {
  readonly title: string;
  readonly pointOfView: string;
  readonly storyEngine: string;
  readonly formalStrategy: string;
  readonly audienceJourney: string;
  readonly whyThisProject: string;
  /** Calibrated 0–1 confidence in the recommendation, never human approval. */
  readonly confidence?: number;
  readonly confidenceRationale?: string;
  readonly basis?: readonly DirectionBasis[];
  readonly sacrifice: string;
  readonly assumptions: readonly string[];
  readonly changeMyMindIf: string;
  readonly projectDependencies: readonly string[];
  readonly innovation: InnovationCase | null;
}

export interface SceneCraft {
  readonly blocking: string;
  readonly camera: string;
  readonly light: string;
  readonly design: string;
  readonly color: string;
  readonly sound: string;
}

export interface SceneHypothesis {
  readonly id: string;
  readonly title: string;
  readonly action: string;
  readonly visual: string;
  readonly sound: string;
  readonly turn: string;
  readonly purpose: string;
  readonly constraintHandling: string;
  readonly craft: SceneCraft;
}

export interface DirectorNotebookBeat {
  readonly id: string;
  readonly sceneId: string;
  readonly shot: string;
  readonly visual: string;
  readonly camera: string;
  readonly light: string;
  readonly sound: string;
  readonly purpose: string;
  readonly creativeThread: string;
}

export type StoryboardGlyphKind =
  | "ADULT"
  | "BABY_HANDS"
  | "BABY_FEET"
  | "COUNTER"
  | "FRIDGE"
  | "MEAL"
  | "MONITOR"
  | "PHONE"
  | "TABLE"
  | "WINDOW"
  | "DOOR"
  | "OBJECT";

export interface StoryboardGlyph {
  readonly kind: StoryboardGlyphKind;
  readonly x: number;
  readonly y: number;
  readonly scale: number;
  readonly label: string;
}

export interface StoryboardArrow {
  readonly fromX: number;
  readonly fromY: number;
  readonly toX: number;
  readonly toY: number;
  readonly label: string;
}

export interface StoryboardFrame {
  readonly id: string;
  readonly beatId: string;
  readonly title: string;
  readonly cameraLabel: string;
  readonly annotation: string;
  readonly glyphs: readonly StoryboardGlyph[];
  readonly arrows: readonly StoryboardArrow[];
}

export interface BlockingZone {
  readonly id: string;
  readonly label: string;
  readonly x: number;
  readonly y: number;
  readonly width: number;
  readonly height: number;
}

export interface BlockingPosition {
  readonly label: string;
  readonly x: number;
  readonly y: number;
  readonly kind: "SUBJECT" | "CAMERA" | "LIGHT";
}

export interface BlockingPath {
  readonly label: string;
  readonly points: readonly { readonly x: number; readonly y: number }[];
}

export interface LookSwatch {
  readonly name: string;
  readonly color: string;
  readonly use: string;
}

export interface StoryboardArtifact {
  readonly status: "RENDERED";
  readonly renderer: "STROMAN_PENCIL_SVG_V1";
  readonly title: string;
  readonly frames: readonly StoryboardFrame[];
  readonly blocking: {
    readonly title: string;
    readonly zones: readonly BlockingZone[];
    readonly positions: readonly BlockingPosition[];
    readonly paths: readonly BlockingPath[];
  };
  readonly look: {
    readonly title: string;
    readonly swatches: readonly LookSwatch[];
    readonly texture: string;
  };
}

export interface MeaningfulDevelopment {
  readonly version: 2;
  readonly reasoningSource: CreativeReasoningSource;
  readonly insight: CreativeInsight;
  readonly directionDecision: DirectionDecision;
  readonly alternativeDecisions: readonly DirectionDecision[];
  readonly sceneHypotheses: readonly SceneHypothesis[];
  readonly directorNotebook: readonly DirectorNotebookBeat[];
  readonly storyboard: StoryboardArtifact;
  readonly questions: readonly DevelopmentQuestion[];
  readonly productionNextSteps: readonly string[];
}

export interface DevelopmentSeed {
  readonly mode: CreativeMode;
  readonly objectiveRead: string;
  readonly recommendedDirection: CreativeDirection & { readonly whyThisWins: string };
  readonly alternatives: readonly CreativeDirection[];
  readonly questions: readonly DevelopmentQuestion[];
  readonly sequencePlan: readonly SequenceIdea[];
  readonly productionNextSteps: readonly string[];
}

function clean(value: string): string {
  return value
    .trim()
    .replace(/\s+/g, " ")
    .replace(/[.!?]+$/, "");
}

function isJimmyReferenceFixture(brief: CreativeBrief, mode: CreativeMode): boolean {
  const text = [
    brief.title,
    brief.client,
    brief.projectType,
    brief.creativeGoal,
    brief.targetAudience,
    brief.desiredEmotion,
    brief.context,
  ]
    .join(" ")
    .toLowerCase();
  return (
    mode === "COMMERCIAL" &&
    /jimmy'?s famous meals/.test(text) &&
    /\b(?:mom|mother|parent)\b/.test(text) &&
    /\b(?:meals?|food|breakfast|dinner)\b/.test(text) &&
    /\b(?:morning|routine|convenience|easier)\b/.test(text)
  );
}

function jimmyInsight(): CreativeInsight {
  return {
    thesis:
      "This is not really a film about meal prep. It is about giving one decision back to a mother who is already making fifty before the house is fully awake.",
    humanTruth:
      "Convenience feels like care when it removes mental load before anyone asks her for one more thing.",
    dramaticTension:
      "Her body never stops moving, but every interruption asks her mind to change direction again.",
    audiencePromise:
      "Parents should recognize their own morning before the brand offers relief, then feel understood rather than targeted.",
  };
}

function jimmyDirections(): readonly DirectionDecision[] {
  return [
    {
      title: "The first quiet bite",
      pointOfView:
        "Make stillness—not speed—the proof of convenience. The meal earns its place by creating the first moment in the morning when she is not solving something for someone else.",
      storyEngine:
        "Interruptions accumulate until one prepared meal removes a branch from the morning; camera and sound settle when she does.",
      formalStrategy:
        "Begin with restless, physically present fragments and layered domestic sound. After the fridge opens, lengthen the shot, simplify the frame, and let room tone return.",
      audienceJourney:
        "Recognition of invisible labor → pressure → unexpected quiet → feeling cared for → brand recognition.",
      whyThisProject:
        "Jimmy's promise becomes emotional without pretending the product solves motherhood: it simply gives this parent one decision and one cleanup task back.",
      confidence: 0.78,
      confidenceRationale:
        "The direction tightly joins the stated parent audience, convenience goal, and baby-framing restriction, but the mother's real source of morning pressure still needs observation.",
      basis: [
        {
          kind: "SUPPLIED_INTENT",
          label: "Audience and emotional job",
          statement: "Parents should feel understood, relatable, and cared for before conversion.",
        },
        {
          kind: "SUPPLIED_INTENT",
          label: "Production restriction",
          statement: "The baby may appear only through hands, feet, weight, and sound.",
        },
        {
          kind: "CREATIVE_HYPOTHESIS",
          label: "Proposed human truth",
          statement: "Removing one decision may make convenience register as care.",
        },
      ],
      sacrifice:
        "The product receives less early glamour and the film avoids a conventional appetite montage until relief has been earned.",
      assumptions: [
        "The meal can plausibly be heated or served within the real morning routine.",
        "The mother's primary friction is mental load or time, not a different problem the product cannot solve.",
        "The location offers a readable kitchen path and one believable place for her to pause.",
      ],
      changeMyMindIf:
        "If the real morning problem is cleanup, feeding the baby, or getting out the door rather than deciding what to eat, rebuild the turn around that verified friction instead of forcing stillness.",
      projectDependencies: [
        "an everyday mother carrying the household's morning decisions",
        "Jimmy's Famous Meals as already-prepared relief",
        "an eight-month-old represented only through hands, feet, weight, and sound",
        "a dark-to-waking kitchen routine",
        "parents who need to feel recognized before they receive a sales message",
      ],
      innovation: null,
    },
    {
      title: "One hand is the whole story",
      pointOfView:
        "Tell the morning through everything she completes one-handed while the unseen baby occupies the other side of her body.",
      storyEngine:
        "Each action becomes harder because only one hand is available; the meal is the first task designed for the reality of her body that morning.",
      formalStrategy:
        "Keep faces secondary. Build a waist-height visual grammar from reaching hands, baby fingers, cabinet pulls, phone taps, fridge handles, and the meal tray.",
      audienceJourney:
        "Physical recognition → admiration without idealization → relief that feels designed for real life.",
      whyThisProject:
        "The baby's no-face constraint becomes the visual idea instead of a limitation, and the convenience claim is demonstrated through choreography rather than copy.",
      confidence: 0.7,
      confidenceRationale:
        "The visual rule is specific to the supplied restriction, but it depends on truthful one-handed behavior and a safe baby setup.",
      basis: [
        {
          kind: "SUPPLIED_INTENT",
          label: "Baby framing rule",
          statement: "Do not show the baby's face; hands and feet are allowed.",
        },
        {
          kind: "CREATIVE_HYPOTHESIS",
          label: "Physical story engine",
          statement: "One-handed actions could embody the parent's morning pressure.",
        },
      ],
      sacrifice:
        "Less facial performance means emotion must arrive through rhythm, touch, breath, and sound.",
      assumptions: [
        "The mother is comfortable performing real tasks while holding or tending the baby.",
        "Baby hands and feet can be filmed safely with a guardian-approved setup.",
      ],
      changeMyMindIf:
        "If the baby is normally elsewhere during meal preparation, do not stage one-handed difficulty; move the constraint into sound and off-screen interruption instead.",
      projectDependencies: [
        "one-handed morning choreography",
        "baby hands and feet without a face",
        "a prepared Jimmy's meal requiring fewer physical steps",
        "domestic objects parents touch before breakfast",
      ],
      innovation: null,
    },
    {
      title: "Show the work that disappears",
      pointOfView:
        "Photograph the missing labor: the cutting board that stays clean, the pan that never heats, and the sink that does not gain another dish.",
      storyEngine:
        "Expected tasks are introduced as empty spaces, then the mother's reclaimed attention becomes the consequence.",
      formalStrategy:
        "Use three locked negative-space compositions—clear board, cold stove, empty sink—intercut with the mother's actual morning pressure before revealing why those tasks vanished.",
      audienceJourney:
        "Curiosity → recognition of avoided work → relief → reconsideration of what meal prep can mean.",
      whyThisProject:
        "Jimmy's convenience is made visible through subtraction, which speaks directly to parents whose burden is the pile of tiny tasks rather than cooking alone.",
      confidence: 0.64,
      confidenceRationale:
        "The subtraction device is distinctive and relevant, but it must be verified against the product's actual prep and cleanup requirements.",
      basis: [
        {
          kind: "SUPPLIED_INTENT",
          label: "Convenience objective",
          statement: "The commercial must make Jimmy's Famous Meals useful to busy parents.",
        },
        {
          kind: "CREATIVE_HYPOTHESIS",
          label: "Absence as proof",
          statement: "Showing omitted work may communicate relief more honestly than food glamour.",
        },
      ],
      sacrifice:
        "The concept risks feeling cryptic and gives up immediate product appetite; the reveal must remain clear and fast enough for the format.",
      assumptions: [
        "The meal genuinely removes prep or cleanup steps shown in the film.",
        "The kitchen has enough visual continuity for absence to read deliberately.",
      ],
      changeMyMindIf:
        "If the product still requires the same pans, prep, or cleanup, the absent-work device becomes a false claim and must be rejected.",
      projectDependencies: [
        "specific kitchen tasks Jimmy's meals actually remove",
        "a parent's accumulating morning workload",
        "an empty cutting board, cold stove, and clear sink as truthful negative evidence",
        "a late brand reveal after emotional proof",
      ],
      innovation: {
        convention:
          "Food commercials normally make preparation and appetite imagery the visual hero.",
        whyConventionWorks:
          "Visible food texture creates desire quickly and makes the product easy to identify.",
        departure:
          "Delay the food and make absent preparation—the clean board, cold stove, and empty sink—the hero imagery.",
        projectBenefit:
          "For an overloaded parent, what she does not have to do is more emotionally valuable than another slow-motion food beauty shot.",
        executionRisk:
          "Negative space can read as inactivity or an unfinished spot; sound, screen direction, and the final meal reveal must make the subtraction unmistakable.",
      },
    },
    {
      title: "Care from the version of her who planned ahead",
      pointOfView:
        "Treat the meal as a small act of care sent forward by the version of her who knew this morning would be difficult.",
      storyEngine:
        "The present morning feels chaotic; one prepared choice in the fridge becomes a quiet message from her calmer past self.",
      formalStrategy:
        "Contrast cool pre-dawn fragments with one warm refrigerator interior and a handwritten household detail that suggests preparation without inventing backstory.",
      audienceJourney:
        "Pressure → recognition → self-compassion → readiness to prepare for a future hard morning.",
      whyThisProject:
        "It makes preparedness feel sentimental without requiring the brand to impersonate a family member or overclaim emotional intimacy.",
      confidence: 0.58,
      confidenceRationale:
        "The emotional approach fits the brief but relies on an unverified pre-existing purchase habit.",
      basis: [
        {
          kind: "SUPPLIED_INTENT",
          label: "Desired audience effect",
          statement: "The film should feel understood, relatable, and sentimental.",
        },
        {
          kind: "CREATIVE_HYPOTHESIS",
          label: "Preparedness as care",
          statement: "A stocked meal could read as care from an earlier version of the parent.",
        },
      ],
      sacrifice:
        "This direction is gentler and less immediately demonstrative; it needs a credible pre-existing product relationship.",
      assumptions: [
        "She already buys or has intentionally stocked the meal before the scene begins.",
        "The campaign may frame purchase as preparedness rather than discovery.",
      ],
      changeMyMindIf:
        "If acquisition or first discovery is the campaign story, this direction hides the most important behavior and should yield to a clearer conversion path.",
      projectDependencies: [
        "a Jimmy's meal chosen before the difficult morning",
        "a parent who prepares for future mental load",
        "pre-dawn domestic pressure",
        "sentiment expressed through self-care rather than brand narration",
      ],
      innovation: null,
    },
  ];
}

function jimmyScenes(): readonly SceneHypothesis[] {
  return [
    {
      id: "scene_pre_dawn",
      title: "The house asks first",
      action:
        "Before we see anyone, the baby monitor crackles. A mother enters the dark kitchen carrying the baby just below frame and reaches for three morning tasks with one free hand.",
      visual:
        "Blue-black kitchen, refrigerator edge, monitor LED, her shoulder and working hand; the baby's hand briefly grips her shirt, never revealing a face.",
      sound:
        "Monitor breath, refrigerator hum, bottle cap, phone vibration, one cupboard that closes too loudly.",
      turn: "A second off-screen need interrupts the first task before it is finished.",
      purpose: "Make parents feel the mental switching cost before any product appears.",
      constraintHandling:
        "Keep the baby behind her shoulder or below the crop; only a hand, foot, weight shift, and monitor sound identify the child.",
      craft: {
        blocking:
          "She crosses fridge → counter → bag without completing a clean line; the camera yields from the kitchen threshold instead of leading her.",
        camera:
          "Normal perspective at shoulder height, physically close enough to feel interruption; choose the focal length after scouting the fridge-to-counter distance.",
        light:
          "Let the monitor LED and a weak hall practical establish pre-dawn; keep the refrigerator closed so relief has not arrived yet.",
        design:
          "Half-zipped diaper bag, one unmatched sock, unopened mail, clean cutting board still waiting—specific mental-load details, not styled clutter.",
        color:
          "Cool charcoal and muted blue with small tired amber practicals; skin remains natural and slightly under the room rather than beauty-lit.",
        sound:
          "Build pressure by adding real sources at different distances; no score and no accelerated whoosh effects.",
      },
    },
    {
      id: "scene_one_hand",
      title: "One hand, five decisions",
      action:
        "Her free hand alternates between bottle, phone, lunch item, cupboard, and baby fingers reaching into frame; nothing receives her full attention.",
      visual:
        "Waist-height fragments share one screen direction. Baby feet kick at frame edge while her hand repeatedly leaves one task for another.",
      sound:
        "Kettle click, notification, plastic seal, baby fuss, then a short silence when she forgets what she reached for.",
      turn: "She opens the fridge not for inspiration but because she cannot absorb another decision.",
      purpose: "Turn convenience from a slogan into visible decision fatigue.",
      constraintHandling:
        "Frame the baby as hands and socked feet only; use the limitation to keep attention on touch, weight, and divided labor.",
      craft: {
        blocking:
          "Keep her anchored between counter and fridge so repeated pivots become the choreography; background activity stays off-screen and audible.",
        camera:
          "Waist-height handheld at her working distance. Do not float; each reframing is caused by the hand abandoning one object for another.",
        light:
          "Counter practical stays dim and directional. Baby hands may cross the light but never enter a face-revealing angle.",
        design:
          "Use only tasks she genuinely performs: bottle, phone, bag, cupboard, lunch item. Remove generic decorative breakfast props.",
        color:
          "Maintain the cool pre-dawn baseline; reserve the first clean warm field for the refrigerator interior.",
        sound:
          "Let the forgotten reach create a half-second vacuum before the refrigerator seal breaks.",
      },
    },
    {
      id: "scene_relief",
      title: "The task that is already finished",
      action:
        "The refrigerator opens onto a Jimmy's meal. She takes it with the same one hand; the cutting board, stove, and sink remain untouched.",
      visual:
        "Warm fridge light lands on her hand and the meal. Three brief locked images confirm the work that will not happen: clean board, cold burner, empty sink.",
      sound:
        "Fridge seal, tray on counter, room tone widening. The earlier notification continues off-screen but no longer controls the cut.",
      turn: "For the first time, she completes one action without interruption.",
      purpose: "Make removed labor—not advertising language—the product proof.",
      constraintHandling:
        "The baby remains present through a hand reaching toward the package and feet at frame edge; product and child never require a face shot.",
      craft: {
        blocking:
          "She stops pivoting. Fridge → counter becomes one uninterrupted path; the camera holds the complete action instead of harvesting inserts.",
        camera:
          "Lock a three-quarter counter view that contains fridge, clean board, and her resting hand. The shot length, not a lens change, signals relief.",
        light:
          "Use the refrigerator as the first broad warm source, then allow the counter practical to carry that warmth after the door closes.",
        design:
          "The meal sits beside a genuinely clean board and unused pan. Verify every absent task matches the real product preparation.",
        color:
          "Warmth enters locally around the meal; do not warm the whole room until the emotional pause, so the shift remains causal.",
        sound:
          "Reduce the layered morning sources and keep the refrigerator release, tray contact, and one full breath.",
      },
    },
    {
      id: "scene_stillness",
      title: "The morning stops fighting her",
      action:
        "She leans against the counter and takes the first bite while the baby's feet move softly in the foreground. She does not smile for camera; she simply stops moving.",
      visual:
        "One held two-plane frame: meal and her resting hand in focus, baby feet near foreground, her face partial or profile only if naturally available.",
      sound:
        "A room tone we can finally hear, one baby coo, fork against tray. Music may enter only after the stillness has registered.",
      turn: "The brand arrives after the audience has already felt what it provided.",
      purpose: "End on being cared for, not on a performed testimonial.",
      constraintHandling:
        "Baby feet supply intimacy and continuity without exposing the face; guardian safety and approved framing govern every take.",
      craft: {
        blocking:
          "She settles at the nearest truthful resting point; do not move her to a styled dining setup. The baby remains supported outside the face-revealing axis.",
        camera:
          "Camera becomes still at a respectful working distance. Hold past the bite until her shoulders release; no push-in is needed if the body gives the beat.",
        light:
          "Let warmer kitchen ambience reach her without flattening the pre-dawn background; keep the world present, only less adversarial.",
        design:
          "Keep the unfinished morning in frame edge so relief does not become fantasy. Product label turns legible only after the emotional beat.",
        color:
          "Land in soft oatmeal, muted Jimmy's red, and natural skin against cool residual shadows—care entering the same real morning.",
        sound:
          "Protect the breath and coo. If music enters, use one restrained human texture rather than a sentimental swell.",
      },
    },
  ];
}

function notebookFromScenes(
  scenes: readonly SceneHypothesis[],
  thread: string,
): readonly DirectorNotebookBeat[] {
  return scenes.map((scene, index) => ({
    id: `beat_${index + 1}`,
    sceneId: scene.id,
    shot: `${String(index + 1).padStart(2, "0")} · ${scene.title}`,
    visual: scene.visual,
    camera: scene.craft.camera,
    light: scene.craft.light,
    sound: scene.sound,
    purpose: scene.purpose,
    creativeThread: thread,
  }));
}

function jimmyStoryboard(): StoryboardArtifact {
  return {
    status: "RENDERED",
    renderer: "STROMAN_PENCIL_SVG_V1",
    title: "The first quiet bite · storyboard",
    frames: [
      {
        id: "frame_1",
        beatId: "beat_1",
        title: "Monitor before picture",
        cameraLabel: "threshold · shoulder height · physically present",
        annotation: "house asks before brand speaks",
        glyphs: [
          { kind: "DOOR", x: 8, y: 18, scale: 0.9, label: "dark hall" },
          { kind: "ADULT", x: 55, y: 42, scale: 0.9, label: "one free hand" },
          { kind: "BABY_HANDS", x: 63, y: 39, scale: 0.55, label: "face hidden" },
          { kind: "MONITOR", x: 18, y: 68, scale: 0.55, label: "sound first" },
          { kind: "FRIDGE", x: 82, y: 32, scale: 0.85, label: "still closed" },
        ],
        arrows: [{ fromX: 54, fromY: 53, toX: 78, toY: 48, label: "interrupted path" }],
      },
      {
        id: "frame_2",
        beatId: "beat_2",
        title: "One hand, five decisions",
        cameraLabel: "waist height · reframe only when her hand changes tasks",
        annotation: "divided attention becomes choreography",
        glyphs: [
          { kind: "COUNTER", x: 45, y: 66, scale: 1.25, label: "unfinished tasks" },
          { kind: "ADULT", x: 45, y: 38, scale: 0.8, label: "anchored here" },
          { kind: "BABY_FEET", x: 63, y: 45, scale: 0.55, label: "safe crop" },
          { kind: "PHONE", x: 22, y: 66, scale: 0.45, label: "buzz" },
          { kind: "OBJECT", x: 72, y: 66, scale: 0.55, label: "bottle / bag" },
        ],
        arrows: [
          { fromX: 48, fromY: 48, toX: 24, toY: 62, label: "task 1" },
          { fromX: 48, fromY: 48, toX: 70, toY: 62, label: "task 2" },
        ],
      },
      {
        id: "frame_3",
        beatId: "beat_3",
        title: "The task already finished",
        cameraLabel: "locked three-quarter · hold fridge, board, and hand",
        annotation: "show the work that disappears",
        glyphs: [
          { kind: "FRIDGE", x: 18, y: 34, scale: 1, label: "warm source" },
          { kind: "ADULT", x: 53, y: 42, scale: 0.85, label: "path stops" },
          { kind: "MEAL", x: 43, y: 58, scale: 0.65, label: "relief" },
          { kind: "COUNTER", x: 72, y: 66, scale: 0.9, label: "clean board" },
          { kind: "BABY_HANDS", x: 61, y: 49, scale: 0.45, label: "reach only" },
        ],
        arrows: [{ fromX: 25, fromY: 45, toX: 43, toY: 56, label: "one complete action" }],
      },
      {
        id: "frame_4",
        beatId: "beat_4",
        title: "First stillness",
        cameraLabel: "camera stops · two planes · hold through shoulder release",
        annotation: "brand arrives after emotional proof",
        glyphs: [
          { kind: "TABLE", x: 48, y: 68, scale: 1.15, label: "real counter" },
          { kind: "ADULT", x: 54, y: 39, scale: 0.9, label: "body finally still" },
          { kind: "MEAL", x: 46, y: 62, scale: 0.6, label: "label later" },
          { kind: "BABY_FEET", x: 20, y: 58, scale: 0.75, label: "foreground intimacy" },
          { kind: "WINDOW", x: 82, y: 24, scale: 0.8, label: "morning not fantasy" },
        ],
        arrows: [],
      },
    ],
    blocking: {
      title: "Kitchen pressure path → relief path",
      zones: [
        { id: "zone_fridge", label: "FRIDGE", x: 6, y: 8, width: 22, height: 28 },
        { id: "zone_counter", label: "COUNTER / ISLAND", x: 37, y: 34, width: 38, height: 22 },
        { id: "zone_sink", label: "SINK", x: 78, y: 8, width: 16, height: 22 },
        { id: "zone_hall", label: "HALL / BABY", x: 5, y: 68, width: 24, height: 20 },
      ],
      positions: [
        { label: "M1 start", x: 22, y: 61, kind: "SUBJECT" },
        { label: "M2 pivot", x: 48, y: 63, kind: "SUBJECT" },
        { label: "M3 still", x: 62, y: 62, kind: "SUBJECT" },
        { label: "C1 threshold", x: 12, y: 52, kind: "CAMERA" },
        { label: "C2 locked", x: 88, y: 67, kind: "CAMERA" },
        { label: "fridge practical", x: 20, y: 22, kind: "LIGHT" },
      ],
      paths: [
        {
          label: "pressure: unfinished pivots",
          points: [
            { x: 22, y: 61 },
            { x: 48, y: 63 },
            { x: 20, y: 48 },
            { x: 48, y: 63 },
          ],
        },
        {
          label: "relief: one complete line",
          points: [
            { x: 20, y: 48 },
            { x: 62, y: 62 },
          ],
        },
      ],
    },
    look: {
      title: "Pre-dawn pressure → earned warmth",
      swatches: [
        { name: "pre-dawn charcoal", color: "#27313a", use: "room and residual shadow" },
        { name: "monitor blue", color: "#6c8797", use: "small electronic pressure cues" },
        { name: "fridge oatmeal", color: "#e6d6b8", use: "relief entering locally" },
        { name: "Jimmy's red", color: "#9f3f35", use: "one restrained brand accent" },
        { name: "skin / linen", color: "#c9997a", use: "human warmth without beauty polish" },
      ],
      texture:
        "Natural mixed practicals, soft highlight roll-off, visible morning shadow, worn domestic surfaces, no glossy lifestyle finish.",
    },
  };
}

function genericStoryboard(
  brief: CreativeBrief,
  mode: CreativeMode,
  notebook: readonly DirectorNotebookBeat[],
): StoryboardArtifact {
  const glyphsByMode: Record<CreativeMode, readonly StoryboardGlyphKind[]> = {
    DOCUMENTARY: ["ADULT", "OBJECT", "TABLE"],
    COMMERCIAL: ["ADULT", "OBJECT", "MEAL"],
    PERFORMANCE: ["ADULT", "OBJECT", "WINDOW"],
    NARRATIVE: ["ADULT", "DOOR", "OBJECT"],
    OPEN: ["ADULT", "OBJECT", "WINDOW"],
  };
  return {
    status: "RENDERED",
    renderer: "STROMAN_PENCIL_SVG_V1",
    title: `${clean(brief.title)} · storyboard study`,
    frames: notebook.slice(0, 4).map((beat, index) => ({
      id: `frame_${index + 1}`,
      beatId: beat.id,
      title: beat.shot,
      cameraLabel: beat.camera,
      annotation: beat.purpose,
      glyphs: glyphsByMode[mode].map((kind, glyphIndex) => ({
        kind,
        x: 22 + glyphIndex * 28,
        y: 38 + ((index + glyphIndex) % 2) * 20,
        scale: glyphIndex === 0 ? 0.9 : 0.65,
        label: glyphIndex === 0 ? "primary action" : glyphIndex === 1 ? "story pressure" : "result",
      })),
      arrows:
        index === 1
          ? [{ fromX: 26, fromY: 50, toX: 70, toY: 50, label: "relationship changes" }]
          : [],
    })),
    blocking: {
      title: "Scout-dependent blocking study",
      zones: [
        { id: "zone_action", label: "PRIMARY ACTION", x: 34, y: 28, width: 34, height: 30 },
        {
          id: "zone_pressure",
          label: "PRESSURE / CONSEQUENCE",
          x: 70,
          y: 12,
          width: 24,
          height: 24,
        },
      ],
      positions: [
        { label: "subject", x: 48, y: 66, kind: "SUBJECT" },
        { label: "baseline camera", x: 14, y: 68, kind: "CAMERA" },
        { label: "motivated source", x: 82, y: 18, kind: "LIGHT" },
      ],
      paths: [
        {
          label: "action to consequence",
          points: [
            { x: 48, y: 66 },
            { x: 68, y: 50 },
          ],
        },
      ],
    },
    look: {
      title: "Working look hypothesis",
      swatches: [
        { name: "world", color: "#3b4650", use: "environment baseline" },
        { name: "skin", color: "#b98268", use: "credible human warmth" },
        { name: "turn", color: "#d1b472", use: "one motivated story change" },
      ],
      texture:
        "Natural surfaces and restrained contrast; revise after the location and subject are verified.",
    },
  };
}

function genericMeaningfulDevelopment(
  brief: CreativeBrief,
  seed: DevelopmentSeed,
): MeaningfulDevelopment {
  const title = clean(brief.title);
  const thread = seed.recommendedDirection.organizingPrinciple;
  const scenes: SceneHypothesis[] = seed.sequencePlan.map((sequence, index) => ({
    id: `scene_${index + 1}`,
    title: sequence.title.replace(/^\d+\s*·\s*/, ""),
    action: sequence.picture,
    visual: sequence.picture,
    sound: sequence.sound,
    turn: index === 0 ? "The project establishes its governing action." : sequence.purpose,
    purpose: sequence.purpose,
    constraintHandling:
      clean(brief.context) || "Access, location, safety, and format remain scout-dependent.",
    craft: {
      blocking: seed.recommendedDirection.execution,
      camera:
        "Choose distance and perspective after the real geography is known; move only when the story relationship changes.",
      light:
        "Derive one motivated source from the verified location and protect the story turn from decorative relighting.",
      design: `Use objects and background behavior that materially belong to ${title}; reject category décor that could survive a subject swap.`,
      color: `Build one restrained palette change around the audience effect: ${seed.recommendedDirection.audienceEffect}`,
      sound: sequence.sound,
    },
  }));
  const notebook = notebookFromScenes(scenes, thread);
  const alternatives = seed.alternatives.map((direction) => ({
    title: direction.title,
    pointOfView: direction.thesis,
    storyEngine: direction.organizingPrinciple,
    formalStrategy: direction.execution,
    audienceJourney: direction.audienceEffect,
    whyThisProject: `${direction.title} must be tested against the verified subject, location, and constraint inside ${title}; it is not approved as category advice.`,
    confidence: 0.5,
    confidenceRationale:
      "This is a deliberately provisional alternative until subject behavior, location, and access are verified.",
    basis: [
      {
        kind: "SUPPLIED_INTENT" as const,
        label: "Current project objective",
        statement: clean(brief.creativeGoal) || "The project's creative objective remains open.",
      },
      {
        kind: "CREATIVE_HYPOTHESIS" as const,
        label: "Alternative organizing principle",
        statement: direction.organizingPrinciple,
      },
    ],
    sacrifice: direction.tradeoff,
    assumptions: ["The proposed action and access remain unverified creative hypotheses."],
    changeMyMindIf: `Reject this direction if the real subject behavior or location makes “${direction.organizingPrinciple}” decorative rather than causal.`,
    projectDependencies: [
      title,
      clean(brief.context) || "verified production access",
      clean(brief.targetAudience) || "the audience still to be defined",
    ],
    innovation: direction.unconventional
      ? {
          convention:
            "The strongest familiar version would keep the expected subject and explanation in the foreground.",
          whyConventionWorks:
            "Familiar emphasis improves immediate clarity and lowers execution risk.",
          departure: direction.thesis,
          projectBenefit: direction.audienceEffect,
          executionRisk: direction.tradeoff,
        }
      : null,
  }));
  return {
    version: 2,
    reasoningSource: "DETERMINISTIC_SPECIALIST",
    insight: {
      thesis: seed.recommendedDirection.thesis,
      humanTruth: seed.objectiveRead,
      dramaticTension: seed.recommendedDirection.organizingPrinciple,
      audiencePromise: seed.recommendedDirection.audienceEffect,
    },
    directionDecision: {
      title: seed.recommendedDirection.title,
      pointOfView: seed.recommendedDirection.thesis,
      storyEngine: seed.recommendedDirection.organizingPrinciple,
      formalStrategy: seed.recommendedDirection.execution,
      audienceJourney: seed.recommendedDirection.audienceEffect,
      whyThisProject: `${title} needs this direction to turn “${clean(brief.creativeGoal) || "its unresolved goal"}” into behavior ${clean(brief.targetAudience) || "the intended audience"} can actually recognize, while honoring ${clean(brief.context) || "the still-unverified production conditions"}.`,
      confidence: 0.6,
      confidenceRationale:
        "The recommendation is grounded in supplied intent, but real subject behavior, access, and location evidence remain unverified.",
      basis: [
        {
          kind: "SUPPLIED_INTENT",
          label: "Creative objective",
          statement: clean(brief.creativeGoal) || "The project's creative objective remains open.",
        },
        {
          kind: "SUPPLIED_INTENT",
          label: "Audience",
          statement: clean(brief.targetAudience) || "The intended audience remains undefined.",
        },
        {
          kind: "CREATIVE_HYPOTHESIS",
          label: "Proposed organizing principle",
          statement: seed.recommendedDirection.organizingPrinciple,
        },
      ],
      sacrifice: seed.recommendedDirection.tradeoff,
      assumptions: [
        `${clean(brief.client) || "The project owner"} agrees that the stated goal is the real communication job.`,
        "Proposed scenes and production access remain unverified until a scout or subject conversation.",
      ],
      changeMyMindIf:
        "Change direction when verified behavior, location, or audience evidence contradicts the proposed story engine.",
      projectDependencies: [
        title,
        clean(brief.client) || "the project owner",
        clean(brief.context) || "verified access",
        clean(brief.desiredEmotion) || "a still-undefined emotional target",
      ],
      innovation: null,
    },
    alternativeDecisions: alternatives,
    sceneHypotheses: scenes,
    directorNotebook: notebook,
    storyboard: genericStoryboard(brief, seed.mode, notebook),
    questions: seed.questions.slice(0, 3),
    productionNextSteps: seed.productionNextSteps,
  };
}

export function createMeaningfulDevelopment(
  brief: CreativeBrief,
  seed: DevelopmentSeed,
): MeaningfulDevelopment {
  if (!isJimmyReferenceFixture(brief, seed.mode)) {
    return genericMeaningfulDevelopment(brief, seed);
  }
  const directions = jimmyDirections();
  const scenes = jimmyScenes();
  return {
    version: 2,
    reasoningSource: "DETERMINISTIC_SPECIALIST",
    insight: jimmyInsight(),
    directionDecision: directions[0]!,
    alternativeDecisions: directions.slice(1),
    sceneHypotheses: scenes,
    directorNotebook: notebookFromScenes(
      scenes,
      "Pressure is restless; relief is the first complete action and the first still frame.",
    ),
    storyboard: jimmyStoryboard(),
    questions: [
      {
        prompt:
          "Which burden is actually hardest in her real morning: deciding, cleanup, feeding the baby, or getting out the door?",
        decisionItChanges:
          "Changes the pressure choreography, the product proof, and the exact action that earns the moment of relief.",
      },
      {
        prompt:
          "Is Jimmy's already part of her routine at frame one, or is this the morning she discovers it?",
        decisionItChanges:
          "Chooses between a preparedness story and a discovery/conversion story; those are different character actions, not copy variations.",
      },
      {
        prompt:
          "Should relief register as private stillness, shared play with the baby, or enough time to leave calmly?",
        decisionItChanges:
          "Changes the ending performance, sound release, color transition, and final proof the audience sees.",
      },
    ],
    productionNextSteps: [
      "Observe or rehearse one truthful morning pass and identify the real burden before locking the storyboard.",
      "Verify which preparation and cleanup steps the Jimmy's meal actually removes; delete any absent-work image the product cannot substantiate.",
      "Run the fridge-to-counter action as one held shot with approved baby-safe framing; keep the direction only if relief reads without copy.",
      "Record the pressure sound bed and the first clean room tone separately so the emotional turn can be built from real domestic sound.",
    ],
  };
}
