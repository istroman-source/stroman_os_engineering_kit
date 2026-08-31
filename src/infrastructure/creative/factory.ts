import { CreativeReasoningError, type CreativeReasoningProvider } from "@/domain/creative";
import { DeterministicCreativeReasoningProvider } from "./deterministic-creative-reasoning-provider";
import { OpenAiCreativeReasoningProvider } from "./openai-creative-reasoning-provider";

export function createCreativeReasoningProvider(
  env: Readonly<Record<string, string | undefined>> = process.env,
): CreativeReasoningProvider {
  const selection = (env.STROMAN_CREATIVE_REASONING_PROVIDER ?? "auto").toLowerCase();
  if (!new Set(["auto", "openai", "deterministic"]).has(selection)) {
    throw new CreativeReasoningError(
      "STROMAN_CREATIVE_REASONING_PROVIDER must be auto, openai, or deterministic.",
    );
  }
  if (selection === "deterministic") return new DeterministicCreativeReasoningProvider();
  if (env.OPENAI_API_KEY?.trim()) {
    return new OpenAiCreativeReasoningProvider({
      apiKey: env.OPENAI_API_KEY,
      model: env.STROMAN_CREATIVE_MODEL,
    });
  }
  if (selection === "openai" || env.NODE_ENV === "production" || !env.NODE_ENV) {
    throw new CreativeReasoningError(
      "Hosted creative reasoning is required but OPENAI_API_KEY is not configured. " +
        "Set STROMAN_CREATIVE_REASONING_PROVIDER=deterministic explicitly for offline or test use.",
    );
  }

  // Automatic fallback is deliberately limited to a known local/test runtime.
  // A missing or production runtime identity must fail closed so a deployed app
  // can never present deterministic fixture output as hosted creative judgment.
  return new DeterministicCreativeReasoningProvider();
}
