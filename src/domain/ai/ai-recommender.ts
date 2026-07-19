import type { Result } from "@/lib/result";
import type { AiError } from "./ai-errors";
import type { AiRecommendation } from "./ai-recommendation";

/**
 * Provider-neutral request for an AI recommendation. Deliberately generic: no
 * model, temperature, or provider knobs — those belong to adapters outside the
 * domain.
 */
export interface AiRecommendationRequest {
  readonly instruction: string;
  readonly context: string;
}

/**
 * The seam between the domain/application and any AI provider. Adapters
 * (OpenAI, Anthropic, Gemini, OpenRouter, local models, …) implement this
 * interface OUTSIDE the domain; provider SDK types never cross it.
 */
export interface AiRecommender {
  recommend(request: AiRecommendationRequest): Promise<Result<AiRecommendation, AiError>>;
}
