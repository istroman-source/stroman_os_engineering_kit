import type { OwnerId, ProjectId } from "@/domain/project";
import {
  makeConfidence,
  type Confidence,
  type DomainError,
  InvalidValueError,
  validateBoundedText,
} from "@/domain/shared";
import { err, ok, type Result } from "@/lib/result";
import { CreativeAuthorityError } from "./errors";
import { validateGrounding, type GroundedClaim } from "./grounding";
import type { CreativeDirectionId, DirectionCritiqueId } from "./ids";
import type { CreativeOrigin } from "./direction";

export type DirectionVerdict = "VIABLE" | "CONDITIONAL" | "UNVIABLE";
export type DirectionRecommendation = "ADVANCE" | "REVISE" | "NEEDS_CONTEXT" | "REJECT";
const CRITIC_TYPES: readonly CreativeOrigin[] = ["AI", "HUMAN"];
const DIRECTION_VERDICTS: readonly DirectionVerdict[] = ["VIABLE", "CONDITIONAL", "UNVIABLE"];
const DIRECTION_RECOMMENDATIONS: readonly DirectionRecommendation[] = [
  "ADVANCE",
  "REVISE",
  "NEEDS_CONTEXT",
  "REJECT",
];
export interface DirectionCritique {
  readonly id: DirectionCritiqueId;
  readonly ownerId: OwnerId;
  readonly projectId: ProjectId;
  readonly directionId: CreativeDirectionId;
  readonly criticType: CreativeOrigin;
  readonly criticId: OwnerId | null;
  readonly strengths: string;
  readonly weaknesses: string;
  readonly confidence: Confidence;
  readonly verdict: DirectionVerdict;
  readonly recommendation: DirectionRecommendation;
  readonly rationale: string;
  readonly grounding: readonly GroundedClaim[];
  readonly createdAt: Date;
}
export function createDirectionCritique(
  input: Omit<DirectionCritique, "confidence"> & { confidence: number },
): Result<DirectionCritique, DomainError> {
  if (!CRITIC_TYPES.includes(input.criticType)) {
    return err(new InvalidValueError(`Invalid critic type: "${input.criticType}"`));
  }
  if (input.criticType === "AI" && input.criticId !== null)
    return err(new CreativeAuthorityError("An AI critique must not name a human critic"));
  if (input.criticType === "HUMAN" && input.criticId !== input.ownerId)
    return err(new CreativeAuthorityError("A human critique must be attributed to the owner"));
  if (!DIRECTION_VERDICTS.includes(input.verdict)) {
    return err(new InvalidValueError(`Invalid direction verdict: "${input.verdict}"`));
  }
  if (!DIRECTION_RECOMMENDATIONS.includes(input.recommendation)) {
    return err(
      new InvalidValueError(`Invalid direction recommendation: "${input.recommendation}"`),
    );
  }
  const strengths = validateBoundedText(input.strengths, {
    label: "Critique strengths",
    max: 3000,
  });
  if (!strengths.ok) return strengths;
  const weaknesses = validateBoundedText(input.weaknesses, {
    label: "Critique weaknesses",
    max: 3000,
  });
  if (!weaknesses.ok) return weaknesses;
  const rationale = validateBoundedText(input.rationale, {
    label: "Critique rationale",
    max: 4000,
  });
  if (!rationale.ok) return rationale;
  const confidence = makeConfidence(input.confidence);
  if (!confidence.ok) return confidence;
  const grounding = validateGrounding(input.grounding);
  if (!grounding.ok) return grounding;
  return ok({
    ...input,
    strengths: strengths.value,
    weaknesses: weaknesses.value,
    rationale: rationale.value,
    confidence: confidence.value,
    grounding: grounding.value,
  });
}
