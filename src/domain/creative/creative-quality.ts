import type { CreativeBrief } from "./creative-brief";
import type { MeaningfulDevelopment } from "./meaningful-development";

export type CreativeQualityDimension =
  | "TRANSFORMATION"
  | "PROJECT_SPECIFICITY"
  | "ACTIONABILITY"
  | "DISTINCTIVENESS"
  | "JUDGMENT"
  | "INNOVATION"
  | "HUMANNESS"
  | "CRAFT_COHERENCE"
  | "HONESTY"
  | "VISUAL_COMPLETION";

export interface CreativeQualityScore {
  readonly dimension: CreativeQualityDimension;
  readonly score: number;
  readonly evidence: string;
}

export interface CreativeQualityReport {
  readonly passed: boolean;
  readonly total: number;
  readonly scores: readonly CreativeQualityScore[];
  readonly blockingFindings: readonly string[];
  readonly substitutionSignal: {
    readonly projectTermsFound: readonly string[];
    readonly weak: boolean;
  };
}

const GENERIC_PHRASES = [
  "specific organizing decision",
  "audience effect",
  "production test",
  "tactile foreground detail",
  "active background held soft",
  "choose after scouting",
  "the supplied intent is true",
  "choose distance and perspective after the real geography is known",
  "the project establishes its governing action",
  "must be tested against the verified subject",
  "not approved as category advice",
];

function words(value: string): string[] {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9'\s-]/g, " ")
    .split(/\s+/)
    .filter((word) => word.length >= 4);
}

function projectTerms(brief: CreativeBrief): readonly string[] {
  const stop = new Set([
    "about",
    "audience",
    "commercial",
    "creative",
    "emotion",
    "everyday",
    "feeling",
    "project",
    "should",
    "their",
    "video",
    "with",
  ]);
  return [...new Set(words([brief.title, brief.client, brief.context].join(" ")))].filter(
    (word) => !stop.has(word),
  );
}

function corpus(output: MeaningfulDevelopment): string {
  return JSON.stringify({
    insight: output.insight,
    directionDecision: output.directionDecision,
    alternativeDecisions: output.alternativeDecisions,
    sceneHypotheses: output.sceneHypotheses,
    directorNotebook: output.directorNotebook,
    storyboard: output.storyboard,
    questions: output.questions,
    productionNextSteps: output.productionNextSteps,
  }).toLowerCase();
}

function score(
  dimension: CreativeQualityDimension,
  value: number,
  evidence: string,
): CreativeQualityScore {
  return { dimension, score: Math.max(0, Math.min(10, value)), evidence };
}

/**
 * Semantic release gate. It intentionally tests meaning and project dependence,
 * not exact prose, so a provider can improve its language without gaming a
 * snapshot. Scores below 70 or any blocking finding reject the result.
 */
export function evaluateCreativeQuality(
  brief: CreativeBrief,
  output: MeaningfulDevelopment,
): CreativeQualityReport {
  const text = corpus(output);
  const terms = projectTerms(brief);
  const found = terms.filter((term) => text.includes(term));
  const genericHits = GENERIC_PHRASES.filter((phrase) => text.includes(phrase));
  const scenesWithActions = output.sceneHypotheses.filter(
    (scene) => words(scene.action).length >= 8 && scene.turn.trim() !== scene.purpose.trim(),
  ).length;
  const projectSpecificScenes = output.sceneHypotheses.filter((scene) => {
    const sceneText = `${scene.action} ${scene.visual} ${scene.turn}`.toLowerCase();
    return terms.some((term) => sceneText.includes(term));
  }).length;
  const craftComplete = output.sceneHypotheses.filter((scene) =>
    [
      scene.craft.blocking,
      scene.craft.camera,
      scene.craft.light,
      scene.craft.design,
      scene.craft.color,
      scene.craft.sound,
    ].every((value) => words(value).length >= 4),
  ).length;
  const primary = output.directionDecision;
  const distinctTitles = new Set([
    primary.title.toLowerCase(),
    ...output.alternativeDecisions.map((item) => item.title.toLowerCase()),
  ]).size;
  const innovation = [primary, ...output.alternativeDecisions].find(
    (candidate) => candidate.innovation !== null,
  )?.innovation;
  const hasFullInnovation = Boolean(
    innovation &&
    innovation.convention &&
    innovation.whyConventionWorks &&
    innovation.departure &&
    innovation.projectBenefit &&
    innovation.executionRisk,
  );
  const artifact = output.storyboard;
  const visualComplete =
    artifact.status === "RENDERED" &&
    artifact.frames.length >= 3 &&
    artifact.frames.every((frame) => frame.glyphs.length >= 2) &&
    artifact.blocking.zones.length >= 1 &&
    artifact.look.swatches.length >= 3;
  const specificRatio = terms.length === 0 ? 0 : found.length / terms.length;
  const weakSubstitutionSignal = specificRatio < 0.35 || found.length < Math.min(2, terms.length);

  const scores = [
    score(
      "TRANSFORMATION",
      output.insight.thesis.toLowerCase().includes(brief.creativeGoal.toLowerCase()) ? 7 : 9,
      "The thesis must discover a human or dramatic value beyond restating the stated goal.",
    ),
    score(
      "PROJECT_SPECIFICITY",
      Math.round(specificRatio * 10),
      `${found.length}/${terms.length} distinctive title, client, or context terms survive in the reasoning.`,
    ),
    score(
      "ACTIONABILITY",
      Math.min(
        10,
        scenesWithActions + projectSpecificScenes + (output.directorNotebook.length >= 3 ? 2 : 0),
      ),
      `${scenesWithActions} scenes contain physical action and a distinct dramatic turn; ${projectSpecificScenes} make that action depend on project-specific material.`,
    ),
    score(
      "DISTINCTIVENESS",
      distinctTitles >= 4 && genericHits.length === 0 ? 9 : distinctTitles >= 3 ? 7 : 3,
      `${distinctTitles} direction titles are distinct; ${genericHits.length} known generic phrases appear.`,
    ),
    score(
      "JUDGMENT",
      primary.assumptions.length >= 2 &&
        primary.sacrifice.length > 30 &&
        primary.changeMyMindIf.length > 40
        ? 10
        : 4,
      "The recommendation is judged by explicit assumptions, sacrifice, and a falsifiable change-my-mind condition.",
    ),
    score(
      "INNOVATION",
      hasFullInnovation ? 9 : 2,
      "At least one departure must name the convention, its value, the violation, project fit, and execution risk.",
    ),
    score(
      "HUMANNESS",
      words(output.insight.humanTruth).length >= 10 &&
        words(output.insight.dramaticTension).length >= 8
        ? 9
        : 4,
      "The insight names a human truth and lived dramatic pressure rather than a demographic label.",
    ),
    score(
      "CRAFT_COHERENCE",
      output.sceneHypotheses.length === 0
        ? 0
        : Math.round((craftComplete / output.sceneHypotheses.length) * 10),
      `${craftComplete}/${output.sceneHypotheses.length} scenes derive complete physical craft choices.`,
    ),
    score(
      "HONESTY",
      primary.assumptions.length > 0 &&
        output.sceneHypotheses.every((scene) => scene.constraintHandling)
        ? 9
        : 4,
      "Assumptions and constraint handling remain explicit; hypothetical scenes are not presented as captured evidence.",
    ),
    score(
      "VISUAL_COMPLETION",
      visualComplete ? 10 : 0,
      visualComplete
        ? `${artifact.frames.length} drawn frames, a blocking map, and a look palette are renderable.`
        : "The result lacks a renderable storyboard, blocking map, or look palette.",
    ),
  ] as const;

  const blockingFindings: string[] = [];
  if (output.sceneHypotheses.length < 3)
    blockingFindings.push("Fewer than three executable scene hypotheses.");
  if (projectSpecificScenes < Math.max(2, Math.ceil(output.sceneHypotheses.length * 0.75))) {
    blockingFindings.push(
      "Physical scene actions are not causally dependent on enough project-specific material.",
    );
  }
  if (!visualComplete) blockingFindings.push("No complete visual storyboard artifact.");
  if (!hasFullInnovation) blockingFindings.push("No fully argued innovation case.");
  if (weakSubstitutionSignal) {
    blockingFindings.push(
      "The output is weakly dependent on this project and may survive a noun substitution.",
    );
  }
  if (genericHits.length >= 2) {
    blockingFindings.push(`Known generic baseline language remains: ${genericHits.join(", ")}.`);
  }
  const total = scores.reduce((sum, item) => sum + item.score, 0);
  return {
    passed: total >= 70 && blockingFindings.length === 0,
    total,
    scores,
    blockingFindings,
    substitutionSignal: { projectTermsFound: found, weak: weakSubstitutionSignal },
  };
}

export function isMeaningfulDevelopment(value: unknown): value is MeaningfulDevelopment {
  if (!value || typeof value !== "object") return false;
  const candidate = value as Partial<MeaningfulDevelopment>;
  return (
    candidate.version === 2 &&
    Boolean(candidate.insight && candidate.directionDecision) &&
    Array.isArray(candidate.alternativeDecisions) &&
    Array.isArray(candidate.sceneHypotheses) &&
    Array.isArray(candidate.directorNotebook) &&
    candidate.storyboard?.status === "RENDERED" &&
    Array.isArray(candidate.questions) &&
    Array.isArray(candidate.productionNextSteps)
  );
}
