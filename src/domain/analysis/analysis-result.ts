import { err, ok, type Result } from "@/lib/result";
import type { DecisionId } from "@/domain/decision";
import type { EvidenceReferenceId } from "@/domain/evidence";
import {
  type Confidence,
  type DomainError,
  InvalidValueError,
  makeConfidence,
  validateBoundedText,
} from "@/domain/shared";
import type { AnalysisOutputId, AnalysisRecommendationId, AnalysisRunId } from "./ids";

export type AnalysisOutputKind =
  "OBSERVATION" | "INFERENCE" | "THEME" | "NARRATIVE" | "EDIT_RECOMMENDATION" | "PROMPT";

export interface AnalysisOutput {
  readonly id: AnalysisOutputId;
  readonly analysisRunId: AnalysisRunId;
  readonly kind: AnalysisOutputKind;
  readonly content: string;
  readonly confidence: Confidence | null;
  readonly evidenceReferenceIds: readonly EvidenceReferenceId[];
  readonly createdAt: Date;
}

export interface CreateAnalysisOutputInput {
  readonly id: AnalysisOutputId;
  readonly analysisRunId: AnalysisRunId;
  readonly kind: AnalysisOutputKind;
  readonly content: string;
  readonly confidence?: number | null;
  readonly evidenceReferenceIds?: readonly EvidenceReferenceId[];
  readonly now: Date;
}

function uniqueEvidence(
  ids: readonly EvidenceReferenceId[],
): Result<readonly EvidenceReferenceId[], DomainError> {
  if (new Set(ids).size !== ids.length) {
    return err(new InvalidValueError("Evidence references must be unique"));
  }
  return ok([...ids]);
}

export function createAnalysisOutput(
  input: CreateAnalysisOutputInput,
): Result<AnalysisOutput, DomainError> {
  if (
    !(
      [
        "OBSERVATION",
        "INFERENCE",
        "THEME",
        "NARRATIVE",
        "EDIT_RECOMMENDATION",
        "PROMPT",
      ] as readonly string[]
    ).includes(input.kind)
  ) {
    return err(new InvalidValueError("Unknown analysis output kind"));
  }
  const content = validateBoundedText(input.content, { label: "Analysis output", max: 10_000 });
  if (!content.ok) return content;
  const evidence = uniqueEvidence(input.evidenceReferenceIds ?? []);
  if (!evidence.ok) return evidence;
  const confidence = input.confidence == null ? ok(null) : makeConfidence(input.confidence);
  if (!confidence.ok) return confidence;
  return ok({
    id: input.id,
    analysisRunId: input.analysisRunId,
    kind: input.kind,
    content: content.value,
    confidence: confidence.value,
    evidenceReferenceIds: evidence.value,
    createdAt: input.now,
  });
}

export interface AnalysisRecommendation {
  readonly id: AnalysisRecommendationId;
  readonly analysisRunId: AnalysisRunId;
  readonly title: string;
  readonly rationale: string;
  readonly confidence: Confidence;
  readonly evidenceReferenceIds: readonly EvidenceReferenceId[];
  readonly decisionId: DecisionId | null;
  readonly createdAt: Date;
}

export interface CreateAnalysisRecommendationInput {
  readonly id: AnalysisRecommendationId;
  readonly analysisRunId: AnalysisRunId;
  readonly title: string;
  readonly rationale: string;
  readonly confidence: number;
  readonly evidenceReferenceIds?: readonly EvidenceReferenceId[];
  readonly decisionId?: DecisionId | null;
  readonly now: Date;
}

export function createAnalysisRecommendation(
  input: CreateAnalysisRecommendationInput,
): Result<AnalysisRecommendation, DomainError> {
  const title = validateBoundedText(input.title, { label: "Recommendation title", max: 300 });
  if (!title.ok) return title;
  const rationale = validateBoundedText(input.rationale, {
    label: "Recommendation rationale",
    max: 5000,
  });
  if (!rationale.ok) return rationale;
  const confidence = makeConfidence(input.confidence);
  if (!confidence.ok) return confidence;
  const evidence = uniqueEvidence(input.evidenceReferenceIds ?? []);
  if (!evidence.ok) return evidence;
  return ok({
    id: input.id,
    analysisRunId: input.analysisRunId,
    title: title.value,
    rationale: rationale.value,
    confidence: confidence.value,
    evidenceReferenceIds: evidence.value,
    decisionId: input.decisionId ?? null,
    createdAt: input.now,
  });
}
