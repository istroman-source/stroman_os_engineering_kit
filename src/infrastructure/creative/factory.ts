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
  if (selection === "openai") {
    throw new CreativeReasoningError(
      "Hosted creative reasoning is selected but OPENAI_API_KEY is not configured.",
    );
  }
  return new DeterministicCreativeReasoningProvider();
}
