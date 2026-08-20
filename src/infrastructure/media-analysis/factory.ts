import { VisualMediaAnalysisError, type VisualMediaAnalyzer } from "@/domain/media-analysis";
import { DeterministicVisualMediaAnalyzer } from "./deterministic-visual-media-analyzer";
import { OpenAiVisualMediaAnalyzer } from "./openai-visual-media-analyzer";

export function createVisualMediaAnalyzer(
  env: Readonly<Record<string, string | undefined>> = process.env,
): VisualMediaAnalyzer {
  const selection = (env.STROMAN_CREATIVE_REASONING_PROVIDER ?? "auto").toLowerCase();
  if (!new Set(["auto", "openai", "deterministic"]).has(selection)) {
    throw new VisualMediaAnalysisError(
      "STROMAN_CREATIVE_REASONING_PROVIDER must be auto, openai, or deterministic.",
    );
  }
  if (selection === "deterministic") return new DeterministicVisualMediaAnalyzer();
  if (env.OPENAI_API_KEY?.trim()) {
    return new OpenAiVisualMediaAnalyzer({
      apiKey: env.OPENAI_API_KEY,
      model: env.STROMAN_CREATIVE_MODEL,
    });
  }
  if (selection === "openai") {
    throw new VisualMediaAnalysisError(
      "Hosted visual analysis is selected but OPENAI_API_KEY is not configured.",
    );
  }
  return new DeterministicVisualMediaAnalyzer();
}
