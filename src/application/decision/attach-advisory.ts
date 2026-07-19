import { ok, type Result } from "@/lib/result";
import {
  type Advisory,
  attachAdvisory as attachAdvisoryToDecision,
  type DecisionId,
  type DecisionRepository,
} from "@/domain/decision";
import type { OwnerId, ProjectRepository } from "@/domain/project";
import { type DomainError, makeConfidence } from "@/domain/shared";
import { attempt } from "../shared/attempt";
import { type DecisionAccessDeps, loadOwnedDecision } from "./decision-access";
import { type DecisionView, toDecisionView } from "./decision-view";
import type { NotAuthorizedError, NotFoundError, RepositoryError } from "../shared/errors";

export interface AttachAdvisoryDeps extends DecisionAccessDeps {
  readonly decisions: DecisionRepository;
  readonly projects: ProjectRepository;
}

export interface AttachAdvisoryInput {
  readonly actorId: OwnerId;
  readonly decisionId: DecisionId;
  readonly recommendedOptionId?: string | null;
  readonly rationale: string;
  readonly confidence: number;
}

export type AttachAdvisoryResult = Result<
  DecisionView,
  DomainError | NotFoundError | NotAuthorizedError | RepositoryError
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

  const confidence = makeConfidence(input.confidence);
  if (!confidence.ok) return confidence;

  const advisory: Advisory = {
    recommendedOptionId: input.recommendedOptionId ?? null,
    rationale: input.rationale,
    confidence: confidence.value,
  };

  const updated = attachAdvisoryToDecision(access.value, advisory);
  if (!updated.ok) return updated;

  const saved = await attempt("decision.save", () => deps.decisions.save(updated.value));
  if (!saved.ok) return saved;
  return ok(toDecisionView(updated.value));
}
