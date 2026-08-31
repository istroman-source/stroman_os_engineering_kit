import { OptimisticConcurrencyError } from "@/lib/errors";
import { err, ok, type Result } from "@/lib/result";
import {
  type Advisory,
  attachAdvisory as attachAdvisoryToDecision,
  type DecisionId,
  type DecisionRepository,
} from "@/domain/decision";
import type { OwnerId, ProjectRepository } from "@/domain/project";
import type { EvidenceReferenceRepository } from "@/domain/evidence";
import { type DomainError, makeConfidence } from "@/domain/shared";
import { attempt, attemptUpdate } from "../shared/attempt";
import { type DecisionAccessDeps, loadOwnedDecision } from "./decision-access";
import { type AdvisoryEvidenceInput, type DecisionView, toDecisionView } from "./decision-view";
import { type NotAuthorizedError, NotFoundError, type RepositoryError } from "../shared/errors";

export interface AttachAdvisoryDeps extends DecisionAccessDeps {
  readonly decisions: DecisionRepository;
  readonly projects: ProjectRepository;
  readonly evidenceReferences: EvidenceReferenceRepository;
}

export interface AttachAdvisoryInput {
  readonly actorId: OwnerId;
  readonly decisionId: DecisionId;
  readonly recommendedOptionId?: string | null;
  readonly rationale: string;
  readonly tradeoff?: string | null;
  readonly uncertainty?: string | null;
  readonly confidence: number;
  readonly evidence?: readonly AdvisoryEvidenceInput[];
  /** The lockVersion the caller last observed (optimistic concurrency). */
  readonly expectedVersion: number;
}

export type AttachAdvisoryResult = Result<
  DecisionView,
  DomainError | NotFoundError | NotAuthorizedError | OptimisticConcurrencyError | RepositoryError
>;

/**
 * Record AI advisory input on a proposed decision. This never decides the
 * decision — it only attaches advice for a human to weigh.
 */
export async function attachAdvisory(
  deps: AttachAdvisoryDeps,
  input: AttachAdvisoryInput,
): Promise<AttachAdvisoryResult> {
  const access = await loadOwnedDecision(deps, input.actorId, input.decisionId, "decision.advise");
  if (!access.ok) return access;
  if (access.value.lockVersion !== input.expectedVersion) {
    return err(new OptimisticConcurrencyError());
  }

  const confidence = makeConfidence(input.confidence);
  if (!confidence.ok) return confidence;

  for (const entry of input.evidence ?? []) {
    if (!entry.evidenceReferenceId) continue;
    const evidenceLoad = await attempt("evidenceReference.findById", () =>
      deps.evidenceReferences.findById(entry.evidenceReferenceId!),
    );
    if (!evidenceLoad.ok) return evidenceLoad;
    if (
      !evidenceLoad.value ||
      evidenceLoad.value.ownerId !== input.actorId ||
      evidenceLoad.value.projectId !== access.value.projectId
    ) {
      return err(new NotFoundError("EvidenceReference", entry.evidenceReferenceId));
    }
  }

  const advisory: Advisory = {
    recommendedOptionId: input.recommendedOptionId ?? null,
    rationale: input.rationale,
    tradeoff: input.tradeoff ?? null,
    uncertainty: input.uncertainty ?? null,
    confidence: confidence.value,
    evidence: (input.evidence ?? []).map((entry) => ({
      evidenceReferenceId: entry.evidenceReferenceId ?? null,
      sourceLabel: entry.sourceLabel,
      observation: entry.observation,
      relevance: entry.relevance,
    })),
  };

  const updated = attachAdvisoryToDecision(access.value, advisory);
  if (!updated.ok) return updated;

  const saved = await attemptUpdate("decision.update", () => deps.decisions.update(updated.value));
  if (!saved.ok) return saved;
  return ok(toDecisionView({ ...updated.value, lockVersion: updated.value.lockVersion + 1 }));
}
