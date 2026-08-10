import type { CreativeBrief } from "./creative-brief";
import type {
  CreativeInsight,
  DirectionDecision,
  MeaningfulDevelopment,
} from "./meaningful-development";
import { DomainError } from "../shared";

export class CreativeReasoningError extends DomainError {
  constructor(message: string, options: { readonly cause?: unknown } = {}) {
    super("UNAVAILABLE", message, options);
  }
}

export class CreativeQualityError extends DomainError {
  constructor(
    message: string,
    readonly findings: readonly string[],
  ) {
    super("VALIDATION", message);
  }
}

/**
 * Provider-neutral stages for deep creative development. The application owns
 * the sequence; adapters may call a hosted reasoning model or a deterministic
 * specialist without leaking provider details into the product contract.
 */
export interface ProjectUnderstanding {
  readonly projectSpecificReading: string;
  readonly insight: CreativeInsight;
  readonly verifiedIntent: readonly string[];
  readonly assumptions: readonly string[];
  readonly constraints: readonly string[];
}

export interface CreativeCandidateSet {
  readonly candidates: readonly DirectionDecision[];
}

export interface CandidateCritique {
  readonly candidateTitle: string;
  readonly strongestReason: string;
  readonly failureMode: string;
  readonly sacrifice: string;
  readonly changeMyMindIf: string;
}

export interface CreativeReasoningProvider {
  readonly id: string;
  readonly mode: "HOSTED" | "DETERMINISTIC";
  understand(brief: CreativeBrief): Promise<ProjectUnderstanding>;
  generateCandidates(
    brief: CreativeBrief,
    understanding: ProjectUnderstanding,
  ): Promise<CreativeCandidateSet>;
  critiqueCandidates(
    brief: CreativeBrief,
    understanding: ProjectUnderstanding,
    candidates: CreativeCandidateSet,
  ): Promise<readonly CandidateCritique[]>;
  synthesize(
    brief: CreativeBrief,
    understanding: ProjectUnderstanding,
    candidates: CreativeCandidateSet,
    critiques: readonly CandidateCritique[],
  ): Promise<MeaningfulDevelopment>;
}
