"use client";

import { apiGetWithEtag, apiPostWithEtag, type WithEtag } from "@/ui/auth/api-client";

/** Client-side mirrors of the existing serialized decision contract (Prompt 006A). */
export interface DecisionOption {
  readonly id: string;
  readonly label: string;
  readonly rationale: string | null;
}

export interface AdvisoryEvidence {
  readonly evidenceReferenceId?: string | null;
  readonly sourceLabel: string;
  readonly observation: string;
  readonly relevance: string;
}

export interface Advisory {
  readonly recommendedOptionId: string | null;
  readonly rationale: string;
  readonly tradeoff?: string | null;
  readonly uncertainty?: string | null;
  readonly confidence: number;
  readonly evidence: readonly AdvisoryEvidence[];
}

export type DecisionStatus = "PROPOSED" | "DECIDED";

export interface DecisionContext {
  readonly originStage: "MANUAL" | "DEVELOP" | "BUILD" | "EDIT";
  readonly artifactKind: "MANUAL" | "CREATIVE_DIRECTION" | "SHOT_PLAN" | "EDIT_RECOMMENDATION";
  readonly artifactId: string | null;
  readonly artifactVersion: number | null;
  readonly needsReview: boolean;
  readonly reviewReason: string | null;
}

export interface Decision {
  readonly id: string;
  readonly projectId: string;
  readonly question: string;
  readonly options: readonly DecisionOption[];
  readonly advisory: Advisory | null;
  readonly context?: DecisionContext;
  readonly status: DecisionStatus;
  readonly selectedOptionId: string | null;
  readonly decidedBy: string | null;
  readonly decisionRationale: string | null;
  readonly createdAt: string;
  readonly decidedAt: string | null;
}

export interface DecisionListItem extends Decision {
  readonly concurrencyToken: string;
}

export interface NewDecisionInput {
  readonly projectId: string;
  readonly question: string;
  readonly options: ReadonlyArray<{ id: string; label: string; rationale?: string | null }>;
  readonly advisory?: AdvisoryInput;
  readonly context?: {
    readonly originStage: DecisionContext["originStage"];
    readonly artifactKind: DecisionContext["artifactKind"];
    readonly artifactId?: string | null;
    readonly artifactVersion?: number | null;
  };
}

export interface AdvisoryInput {
  readonly recommendedOptionId: string | null;
  readonly rationale: string;
  readonly tradeoff?: string | null;
  readonly uncertainty?: string | null;
  readonly confidence: number;
  readonly evidence?: readonly AdvisoryEvidence[];
}

export interface HumanDecisionInput {
  readonly selectedOptionId: string;
  readonly rationale: string;
}

export interface RecommendationDecisionInput {
  readonly projectId: string;
  readonly question: string;
  readonly context: NonNullable<NewDecisionInput["context"]>;
  readonly recommendation: {
    readonly label: string;
    readonly rationale: string;
    readonly tradeoff?: string | null;
    readonly uncertainty?: string | null;
    readonly confidence: number;
    readonly evidence?: readonly AdvisoryEvidence[];
  };
  readonly alternatives?: ReadonlyArray<{ label: string; rationale: string }>;
}

const enc = encodeURIComponent;

/** List the decisions for a project (each item carries its concurrency token). */
export async function listDecisions(projectId: string): Promise<DecisionListItem[]> {
  const { data } = await apiGetWithEtag<{ items: DecisionListItem[] }>(
    `/api/v1/projects/${enc(projectId)}/decisions`,
  );
  return data.items ?? [];
}

/** Fetch a single decision plus its current ETag (needed to mutate it). */
export function getDecision(decisionId: string): Promise<WithEtag<Decision>> {
  return apiGetWithEtag<Decision>(`/api/v1/decisions/${enc(decisionId)}`);
}

/** Propose a new decision under a project. */
export function proposeDecision(input: NewDecisionInput): Promise<WithEtag<Decision>> {
  return apiPostWithEtag<Decision>("/api/v1/decisions", input);
}

/**
 * One recommendation-to-decision contract for Develop, Build, and Edit.
 * The recommendation stays advisory and every generated choice preserves
 * explicit keep, revise, reject, and defer semantics for the filmmaker.
 */
export function proposeRecommendationDecision(
  input: RecommendationDecisionInput,
): Promise<WithEtag<Decision>> {
  return proposeDecision({
    projectId: input.projectId,
    question: input.question.slice(0, 500),
    context: input.context,
    options: [
      {
        id: "keep",
        label: input.recommendation.label.slice(0, 200),
        rationale: input.recommendation.rationale.slice(0, 2000),
      },
      ...(input.alternatives ?? []).slice(0, 4).map((alternative, index) => ({
        id: `alternative-${index + 1}`,
        label: alternative.label.slice(0, 200),
        rationale: alternative.rationale.slice(0, 2000),
      })),
      {
        id: "revise",
        label: "Revise this recommendation",
        rationale: "Keep the underlying opportunity but change the execution before deciding.",
      },
      {
        id: "reject",
        label: "Reject this recommendation",
        rationale: "Do not use the proposal in the current project plan.",
      },
      {
        id: "defer",
        label: "Defer until more is known",
        rationale:
          "Keep the question open until missing evidence or production context is resolved.",
      },
    ],
    advisory: {
      recommendedOptionId: "keep",
      rationale: input.recommendation.rationale.slice(0, 2000),
      tradeoff: input.recommendation.tradeoff?.slice(0, 2000) ?? null,
      uncertainty: input.recommendation.uncertainty?.slice(0, 2000) ?? null,
      confidence: input.recommendation.confidence,
      evidence: input.recommendation.evidence,
    },
  });
}

/** Attach the AI advisory to a PROPOSED decision (optimistic concurrency via If-Match). */
export function attachAdvisory(
  decisionId: string,
  ifMatch: string,
  advisory: AdvisoryInput,
): Promise<WithEtag<Decision>> {
  return apiPostWithEtag<Decision>(
    `/api/v1/decisions/${enc(decisionId)}/advisory`,
    advisory,
    ifMatch,
  );
}

/** Record the authoritative human decision (finalizes the decision). */
export function recordHumanDecision(
  decisionId: string,
  ifMatch: string,
  decision: HumanDecisionInput,
): Promise<WithEtag<Decision>> {
  return apiPostWithEtag<Decision>(
    `/api/v1/decisions/${enc(decisionId)}/decide`,
    decision,
    ifMatch,
  );
}
