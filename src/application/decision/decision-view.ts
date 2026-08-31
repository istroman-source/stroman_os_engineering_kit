import type { Decision, DecisionContext, DecisionId, DecisionStatus } from "@/domain/decision";
import type { OwnerId, ProjectId } from "@/domain/project";
import type { Confidence } from "@/domain/shared";
import type { EvidenceReferenceId } from "@/domain/evidence";

export interface DecisionOptionView {
  readonly id: string;
  readonly label: string;
  readonly rationale: string | null;
}

export interface AdvisoryEvidenceView {
  readonly evidenceReferenceId: EvidenceReferenceId | null;
  readonly sourceLabel: string;
  readonly observation: string;
  readonly relevance: string;
}

/** Structured evidence input shared by the propose and attach-advisory use cases. */
export interface AdvisoryEvidenceInput {
  readonly evidenceReferenceId?: EvidenceReferenceId | null;
  readonly sourceLabel: string;
  readonly observation: string;
  readonly relevance: string;
}

export interface AdvisoryView {
  readonly recommendedOptionId: string | null;
  readonly rationale: string;
  readonly tradeoff: string | null;
  readonly uncertainty: string | null;
  readonly confidence: Confidence;
  readonly evidence: readonly AdvisoryEvidenceView[];
}

/**
 * Application-owned projection of a decision. Decouples delivery from the
 * `Decision` aggregate while preserving the human-authority fields (who decided,
 * what, why) that the UI must display.
 */
export interface DecisionView {
  readonly id: DecisionId;
  readonly projectId: ProjectId;
  readonly question: string;
  readonly options: readonly DecisionOptionView[];
  readonly advisory: AdvisoryView | null;
  readonly context: DecisionContext;
  readonly status: DecisionStatus;
  readonly selectedOptionId: string | null;
  readonly decidedBy: OwnerId | null;
  readonly decisionRationale: string | null;
  readonly createdAt: Date;
  readonly decidedAt: Date | null;
  /** Optimistic-concurrency token for delivery layers (e.g. HTTP ETag). */
  readonly lockVersion: number;
}

export function toDecisionView(decision: Decision): DecisionView {
  return {
    id: decision.id,
    projectId: decision.projectId,
    question: decision.question,
    options: decision.options.map((option) => ({
      id: option.id,
      label: option.label,
      rationale: option.rationale,
    })),
    advisory: decision.advisory
      ? {
          recommendedOptionId: decision.advisory.recommendedOptionId,
          rationale: decision.advisory.rationale,
          tradeoff: decision.advisory.tradeoff ?? null,
          uncertainty: decision.advisory.uncertainty ?? null,
          confidence: decision.advisory.confidence,
          evidence: decision.advisory.evidence.map((entry) => ({
            evidenceReferenceId: entry.evidenceReferenceId ?? null,
            sourceLabel: entry.sourceLabel,
            observation: entry.observation,
            relevance: entry.relevance,
          })),
        }
      : null,
    context: { ...decision.context },
    status: decision.status,
    selectedOptionId: decision.selectedOptionId,
    decidedBy: decision.decidedBy,
    decisionRationale: decision.decisionRationale,
    createdAt: decision.createdAt,
    decidedAt: decision.decidedAt,
    lockVersion: decision.lockVersion,
  };
}
