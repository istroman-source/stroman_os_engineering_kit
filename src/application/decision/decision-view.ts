import type { Decision, DecisionId, DecisionStatus } from "@/domain/decision";
import type { OwnerId, ProjectId } from "@/domain/project";
import type { Confidence } from "@/domain/shared";

export interface DecisionOptionView {
  readonly id: string;
  readonly label: string;
  readonly rationale: string | null;
}

export interface AdvisoryView {
  readonly recommendedOptionId: string | null;
  readonly rationale: string;
  readonly confidence: Confidence;
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
  readonly status: DecisionStatus;
  readonly selectedOptionId: string | null;
  readonly decidedBy: OwnerId | null;
  readonly decisionRationale: string | null;
  readonly createdAt: Date;
  readonly decidedAt: Date | null;
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
          confidence: decision.advisory.confidence,
        }
      : null,
    status: decision.status,
    selectedOptionId: decision.selectedOptionId,
    decidedBy: decision.decidedBy,
    decisionRationale: decision.decisionRationale,
    createdAt: decision.createdAt,
    decidedAt: decision.decidedAt,
  };
}
