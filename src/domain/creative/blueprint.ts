import type { CreativeBrief } from "./creative-brief";
import type { CreativeMode, DevelopmentBlueprint } from "./development-blueprint";
import type { MeaningfulDevelopment, StoryboardArtifact } from "./meaningful-development";
import {
  emptyCreativePlanningContext,
  generateVisualPlan,
  isVisualPlan,
  type CreativePlanningContext,
  type VisualPlan,
} from "./visual-planning";

/** A single hook concept the creator can open the piece with. */
export interface HookConcept {
  readonly title: string;
  readonly description: string;
}

/**
 * The Creative Blueprint: Stroman OS's structured reading of a project's context,
 * produced before editing begins. Pure data so it can be regenerated
 * deterministically from a brief and serialized without transformation.
 */
export interface BlueprintDevelopment extends Omit<MeaningfulDevelopment, "storyboard"> {
  readonly basis: "PROJECT_INTENT_ONLY";
  readonly mode: CreativeMode;
  readonly visualPlan: VisualPlan;
  /** Retained server-side plan source so stage/scout changes preserve hosted scene logic. */
  readonly storyboardSource?: StoryboardArtifact;
}

export interface Blueprint {
  readonly development: BlueprintDevelopment;
  readonly projectSummary: string;
  readonly storyObjective: string;
  readonly audienceAnalysis: string;
  readonly emotionalArc: readonly string[];
  readonly recommendedStructure: string;
  readonly hookConcepts: readonly HookConcept[];
  readonly editingBlueprint: readonly string[];
  /** null when interviews are not applicable to this format. */
  readonly interviewStrategy: readonly string[] | null;
  readonly brollPriorities: readonly string[];
  readonly risks: readonly string[];
}

function matches(text: string, pattern: RegExp): boolean {
  return pattern.test(text);
}

function isShortForm(projectType: string): boolean {
  return matches(projectType, /reel|short|social|tiktok|promo|teaser|ad|spot|trailer/i);
}

function interviewApplies(brief: CreativeBrief): boolean {
  return matches(
    `${brief.projectType} ${brief.creativeGoal} ${brief.context}`,
    /interview|documentary|testimonial|brand story|profile|founder|customer story|q&a|talking head/i,
  );
}

function phrase(value: string): string {
  return value
    .trim()
    .replace(/\s+/g, " ")
    .replace(/[.!?]+$/, "");
}

function sentence(value: string): string {
  const normalized = value.trim().replace(/\s+/g, " ");
  const terminal = normalized.endsWith("?") ? "?" : normalized.endsWith("!") ? "!" : ".";
  return `${normalized.replace(/[.!?]+$/, "")}${terminal}`;
}

/**
 * Turn a creative brief into a Creative Blueprint. This is the deterministic,
 * rule-based reasoning engine — the seam a provider-backed engine can later sit
 * behind. Given the same brief it always produces the same blueprint.
 */
export function generateBlueprint(
  brief: CreativeBrief,
  source: DevelopmentBlueprint,
  planningContext: CreativePlanningContext = emptyCreativePlanningContext(),
): Blueprint {
  const development: BlueprintDevelopment = {
    basis: source.basis,
    mode: source.mode,
    version: source.version,
    reasoningSource: source.reasoningSource,
    insight: source.insight,
    directionDecision: source.directionDecision,
    alternativeDecisions: source.alternativeDecisions,
    sceneHypotheses: source.sceneHypotheses,
    directorNotebook: source.directorNotebook,
    storyboardSource: source.storyboard,
    visualPlan: generateVisualPlan(brief, source.mode, source, planningContext),
    questions: source.questions,
    productionNextSteps: source.productionNextSteps,
  };
  const shortForm = isShortForm(brief.projectType);
  const projectType = phrase(brief.projectType) || "format still to be chosen";
  const targetAudience = phrase(brief.targetAudience) || "audience still to be defined";
  const desiredEmotion = phrase(brief.desiredEmotion).toLowerCase() || "emotion still to be chosen";
  const client = phrase(brief.client);

  const projectSummary =
    `“${phrase(brief.title)}” is ${client ? `for ${client}` : "an independent project"}; ` +
    `${phrase(brief.projectType) ? `current format: ${projectType.toLowerCase()}` : projectType}. ` +
    `${brief.creativeGoal ? `Creative goal: ${sentence(brief.creativeGoal)} ` : "Creative goal is still open. "}` +
    `${brief.targetAudience ? `Intended audience: ${sentence(brief.targetAudience)} ` : "Audience is still open. "}` +
    `${brief.desiredEmotion ? `Intended feeling: ${sentence(desiredEmotion)}` : "Emotional destination is still open."}`;

  const storyObjective = brief.creativeGoal
    ? `Objective: ${sentence(brief.creativeGoal)} Use each creative choice to help the audience leave feeling ${desiredEmotion}.`
    : development.insight.humanTruth;

  const audienceAnalysis = brief.targetAudience
    ? `Primary audience: ${sentence(targetAudience)} Identify what they already believe, then choose an opening that tests or rewards that belief instead of repeating the brief.`
    : "Audience is an unresolved creative decision. Define who has the most at stake and what they already believe before locking tone, duration, or explanation.";

  const emotionalArc = development.sceneHypotheses.map(
    (scene) => `${scene.title} — ${scene.purpose}`,
  );

  const recommendedStructure = `Recommended story engine — ${development.directionDecision.storyEngine} ${development.directionDecision.formalStrategy}`;

  const hookConcepts: HookConcept[] = development.alternativeDecisions.map((direction) => ({
    title: direction.title,
    description: `${direction.pointOfView} ${direction.audienceJourney}`,
  }));

  const editingBlueprint = [
    development.directionDecision.formalStrategy,
    ...development.sceneHypotheses.map((scene) => `${scene.title}: ${scene.action} ${scene.turn}`),
    ...(shortForm
      ? [
          "For short-form delivery, compress context before removing the decisive action or its aftermath.",
        ]
      : []),
  ];

  const interviewStrategy = interviewApplies(brief)
    ? [
        "Pre-interview to find the real story before rolling; note the exact quotes you need.",
        `Ask questions that surface ${desiredEmotion} — feelings and turning points, not just facts.`,
        "Ask subjects to answer in full sentences that restate the question, so clips stand alone.",
        "Capture room tone and reaction shots for flexible editing.",
      ]
    : null;

  const brollPriorities = development.sceneHypotheses.map(
    (scene) => `${scene.title}: ${scene.visual}`,
  );

  const risks = [
    development.directionDecision.sacrifice,
    development.directionDecision.changeMyMindIf,
    `Do not lock production around an unverified audience (${targetAudience}) or emotional destination (${desiredEmotion}).`,
    "Do not confuse novelty with value; retain an unconventional direction only when meaning, execution, and audience effect improve.",
  ];

  return {
    development,
    projectSummary,
    storyObjective,
    audienceAnalysis,
    emotionalArc,
    recommendedStructure,
    hookConcepts,
    editingBlueprint,
    interviewStrategy,
    brollPriorities,
    risks,
  };
}

/** Rebuild only the visual/cognitive layer after stage, scout, or constraint changes. */
export function refreshBlueprintVisualPlan(
  brief: CreativeBrief,
  blueprint: Blueprint,
  planningContext: CreativePlanningContext,
): Blueprint {
  return {
    ...blueprint,
    development: {
      ...blueprint.development,
      visualPlan: generateVisualPlan(
        brief,
        blueprint.development.mode,
        blueprint.development.storyboardSource
          ? { ...blueprint.development, storyboard: blueprint.development.storyboardSource }
          : blueprint.development,
        planningContext,
      ),
    },
  };
}

/** Narrow persisted/provider JSON before it crosses into the product domain. */
export function isBlueprint(value: unknown): value is Blueprint {
  if (!value || typeof value !== "object") return false;
  const candidate = value as Partial<Blueprint>;
  return (
    candidate.development?.version === 2 &&
    Boolean(candidate.development.insight && candidate.development.directionDecision) &&
    Array.isArray(candidate.development.alternativeDecisions) &&
    Array.isArray(candidate.development.sceneHypotheses) &&
    Array.isArray(candidate.development.directorNotebook) &&
    Array.isArray(candidate.development.questions) &&
    Array.isArray(candidate.development.productionNextSteps) &&
    isVisualPlan(candidate.development.visualPlan) &&
    candidate.development?.basis === "PROJECT_INTENT_ONLY" &&
    typeof candidate.development.mode === "string" &&
    typeof candidate.projectSummary === "string" &&
    typeof candidate.storyObjective === "string" &&
    typeof candidate.audienceAnalysis === "string" &&
    Array.isArray(candidate.emotionalArc) &&
    typeof candidate.recommendedStructure === "string" &&
    Array.isArray(candidate.hookConcepts) &&
    Array.isArray(candidate.editingBlueprint) &&
    Array.isArray(candidate.brollPriorities) &&
    Array.isArray(candidate.risks)
  );
}
