import type { Result } from "@/lib/result";
import type { AiError, AiRecommendation, AiRecommender } from "@/domain/ai";

export interface RequestRecommendationDeps {
  readonly recommender: AiRecommender;
}

export interface RequestRecommendationInput {
  readonly instruction: string;
  readonly context: string;
}

export type RequestRecommendationResult = Result<AiRecommendation, AiError>;

/**
 * Request a provider-neutral AI recommendation through the port. This performs
 * NO domain mutation: it returns advice only. Attaching that advice to a
 * decision, and deciding, are separate explicit operations — AI cannot decide.
 * A port failure surfaces as a typed `AiError` and changes no state.
 */
export async function requestRecommendation(
  deps: RequestRecommendationDeps,
  input: RequestRecommendationInput,
): Promise<RequestRecommendationResult> {
  return deps.recommender.recommend({
    instruction: input.instruction,
    context: input.context,
  });
}
