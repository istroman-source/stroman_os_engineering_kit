"use client";

import { apiGetWithEtag, apiPostWithEtag, type WithEtag } from "@/ui/auth/api-client";

/** Client-side mirrors of the existing serialized decision contract (Prompt 006A). */
export interface DecisionOption {
  readonly id: string;
  readonly label: string;
  readonly rationale: string | null;
}

export interface AdvisoryEvidence {
  readonly sourceLabel: string;
  readonly observation: string;
  readonly relevance: string;
}

export interface Advisory {
  readonly recommendedOptionId: string | null;
  readonly rationale: string;
  readonly confidence: number;
  readonly evidence: readonly AdvisoryEvidence[];
}

export type DecisionStatus = "PROPOSED" | "DECIDED";

export interface Decision {
  readonly id: string;
  readonly projectId: string;
  readonly question: string;
  readonly options: readonly DecisionOption[];
  readonly advisory: Advisory | null;
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
  readonly options: ReadonlyArray<{ id: string; label: string }>;
}

export interface AdvisoryInput {
  readonly recommendedOptionId: string | null;
  readonly rationale: string;
  readonly confidence: number;
  readonly evidence?: readonly AdvisoryEvidence[];
}

export interface HumanDecisionInput {
  readonly selectedOptionId: string;
  readonly rationale: string;
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
