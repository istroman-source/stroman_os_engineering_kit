import { err, ok, type Result } from "@/lib/result";
import type { OwnerId } from "@/domain/project";
import {
  type DomainError,
  InvalidValueError,
  makeScore,
  type Score,
  validateBoundedText,
} from "@/domain/shared";
import type { StoryAngleId, StoryCritiqueId } from "./ids";
import { CriticAuthorityError } from "./story-reasoning-errors";

/** Who authored a critique. AI critiques advise; only humans hold final authority. */
export type CriticType = "AI" | "HUMAN";

/** A critique's advisory conclusion. Never transitions an angle on its own. */
export type StoryRecommendation = "SELECT" | "REVISE" | "ARCHIVE";

const RECOMMENDATIONS: readonly StoryRecommendation[] = ["SELECT", "REVISE", "ARCHIVE"];

/**
 * A scored assessment of a story angle across six creative dimensions, plus a
 * qualitative read and an advisory recommendation. Critiques are append-only and
 * advisory: recording one never changes the angle's status — a human does that
 * through the explicit angle operations.
 */
export interface StoryCritique {
  readonly id: StoryCritiqueId;
  readonly ownerId: OwnerId;
  readonly storyAngleId: StoryAngleId;
  readonly criticType: CriticType;
  /** The human critic, when `criticType` is HUMAN; always null for AI critiques. */
  readonly criticId: OwnerId | null;
  readonly evidenceStrength: Score;
  readonly emotionalPotential: Score;
  readonly visualPotential: Score;
  readonly brandAlignment: Score;
  readonly originality: Score;
  readonly interviewPotential: Score;
  readonly strengths: string;
  readonly weaknesses: string;
  readonly recommendation: StoryRecommendation;
  readonly rationale: string;
  readonly createdAt: Date;
}

export interface CreateStoryCritiqueInput {
  readonly id: StoryCritiqueId;
  readonly ownerId: OwnerId;
  readonly storyAngleId: StoryAngleId;
  readonly criticType: CriticType;
  readonly criticId?: OwnerId | null;
  readonly evidenceStrength: number;
  readonly emotionalPotential: number;
  readonly visualPotential: number;
  readonly brandAlignment: number;
  readonly originality: number;
  readonly interviewPotential: number;
  readonly strengths: string;
  readonly weaknesses: string;
  readonly recommendation: StoryRecommendation;
  readonly rationale: string;
  readonly now: Date;
}

/** The six scored dimensions, in a stable order for validation error reporting. */
const DIMENSIONS = [
  "evidenceStrength",
  "emotionalPotential",
  "visualPotential",
  "brandAlignment",
  "originality",
  "interviewPotential",
] as const;

export function createStoryCritique(
  input: CreateStoryCritiqueInput,
): Result<StoryCritique, DomainError> {
  const criticId = input.criticId ?? null;
  // Authorship and its author reference must agree.
  if (input.criticType === "HUMAN" && criticId === null) {
    return err(new CriticAuthorityError("A human critique must name its critic"));
  }
  if (input.criticType === "AI" && criticId !== null) {
    return err(new CriticAuthorityError("An AI critique must not name a critic"));
  }

  const scores: Record<(typeof DIMENSIONS)[number], Score> = {} as Record<
    (typeof DIMENSIONS)[number],
    Score
  >;
  for (const dimension of DIMENSIONS) {
    const score = makeScore(input[dimension]);
    if (!score.ok) {
      return err(new InvalidValueError(`${dimension}: ${score.error.message}`));
    }
    scores[dimension] = score.value;
  }

  const strengths = validateBoundedText(input.strengths, { label: "Strengths", max: 2000 });
  if (!strengths.ok) return strengths;
  const weaknesses = validateBoundedText(input.weaknesses, { label: "Weaknesses", max: 2000 });
  if (!weaknesses.ok) return weaknesses;
  const rationale = validateBoundedText(input.rationale, { label: "Rationale", max: 2000 });
  if (!rationale.ok) return rationale;

  if (!RECOMMENDATIONS.includes(input.recommendation)) {
    return err(new InvalidValueError(`Invalid recommendation: "${input.recommendation}"`));
  }

  return ok({
    id: input.id,
    ownerId: input.ownerId,
    storyAngleId: input.storyAngleId,
    criticType: input.criticType,
    criticId,
    evidenceStrength: scores.evidenceStrength,
    emotionalPotential: scores.emotionalPotential,
    visualPotential: scores.visualPotential,
    brandAlignment: scores.brandAlignment,
    originality: scores.originality,
    interviewPotential: scores.interviewPotential,
    strengths: strengths.value,
    weaknesses: weaknesses.value,
    recommendation: input.recommendation,
    rationale: rationale.value,
    createdAt: input.now,
  });
}
