import { err, ok, type Result } from "@/lib/result";
import { type Confidence, type DomainError, makeConfidence, validateBoundedText } from "../shared";
import { InvalidAiRecommendationError } from "./ai-errors";

/**
 * Provider-neutral shape of an AI analysis. It deliberately separates what was
 * observed, what was inferred (with confidence), and what remains unknown — the
 * product's core AI-honesty principle. No provider or model detail appears here.
 */

export interface Observation {
  readonly statement: string;
  readonly evidence: string;
}

export interface Inference {
  readonly statement: string;
  readonly confidence: Confidence;
}

export interface AiOption {
  readonly name: string;
  readonly reasoning: string;
  readonly benefits: readonly string[];
  readonly tradeoffs: readonly string[];
  readonly risks: readonly string[];
}

export interface Recommendation {
  readonly selectedOption: string;
  readonly reasoning: string;
  readonly nextActions: readonly string[];
  readonly confidence: Confidence;
}

export interface AiRecommendation {
  readonly observations: readonly Observation[];
  readonly inferences: readonly Inference[];
  readonly unknowns: readonly string[];
  readonly options: readonly AiOption[];
  readonly recommendation: Recommendation;
}

export interface InferenceInput {
  readonly statement: string;
  readonly confidence: number;
}

export interface RecommendationInput {
  readonly selectedOption: string;
  readonly reasoning: string;
  readonly nextActions: readonly string[];
  readonly confidence: number;
}

export interface AiRecommendationInput {
  readonly observations: readonly Observation[];
  readonly inferences: readonly InferenceInput[];
  readonly unknowns: readonly string[];
  readonly options: readonly AiOption[];
  readonly recommendation: RecommendationInput;
}

/**
 * Validate raw AI output into a domain `AiRecommendation`. Enforces: at least one
 * option with unique names; every confidence in [0, 1]; the recommendation
 * selects one of the offered options; observation and inference statements are
 * non-empty. This is the guard that keeps malformed AI output out of the domain.
 */
export function makeAiRecommendation(
  input: AiRecommendationInput,
): Result<AiRecommendation, DomainError> {
  if (input.options.length === 0) {
    return err(new InvalidAiRecommendationError("At least one option is required"));
  }

  const names = new Set<string>();
  const options: AiOption[] = [];
  for (const option of input.options) {
    const name = validateBoundedText(option.name, { label: "Option name", max: 200 });
    if (!name.ok) return name;
    if (names.has(name.value)) {
      return err(new InvalidAiRecommendationError(`Duplicate option: ${name.value}`));
    }
    names.add(name.value);
    const reasoning = validateBoundedText(option.reasoning, {
      label: "Option reasoning",
      max: 2000,
    });
    if (!reasoning.ok) return reasoning;
    options.push({
      name: name.value,
      reasoning: reasoning.value,
      benefits: option.benefits,
      tradeoffs: option.tradeoffs,
      risks: option.risks,
    });
  }

  for (const observation of input.observations) {
    const statement = validateBoundedText(observation.statement, {
      label: "Observation",
      max: 1000,
    });
    if (!statement.ok) return statement;
    const evidence = validateBoundedText(observation.evidence, {
      label: "Observation evidence",
      max: 1000,
    });
    if (!evidence.ok) return evidence;
  }

  const inferences: Inference[] = [];
  for (const inference of input.inferences) {
    const statement = validateBoundedText(inference.statement, { label: "Inference", max: 1000 });
    if (!statement.ok) return statement;
    const confidence = makeConfidence(inference.confidence);
    if (!confidence.ok) return confidence;
    inferences.push({ statement: statement.value, confidence: confidence.value });
  }

  const selectedOption = input.recommendation.selectedOption.trim();
  if (!names.has(selectedOption)) {
    return err(
      new InvalidAiRecommendationError("Recommendation must select one of the provided options"),
    );
  }
  const recReasoning = validateBoundedText(input.recommendation.reasoning, {
    label: "Recommendation reasoning",
    max: 2000,
  });
  if (!recReasoning.ok) return recReasoning;
  const recConfidence = makeConfidence(input.recommendation.confidence);
  if (!recConfidence.ok) return recConfidence;

  return ok({
    observations: input.observations,
    inferences,
    unknowns: input.unknowns,
    options,
    recommendation: {
      selectedOption,
      reasoning: recReasoning.value,
      nextActions: input.recommendation.nextActions,
      confidence: recConfidence.value,
    },
  });
}
