import { ok, type Result } from "@/lib/result";
import { decide, type DecisionId, type DecisionRepository } from "@/domain/decision";
import type { OwnerId, ProjectRepository } from "@/domain/project";
import type { DomainError } from "@/domain/shared";
import { attempt } from "../shared/attempt";
import { type DecisionAccessDeps, loadOwnedDecision } from "./decision-access";
import { type DecisionView, toDecisionView } from "./decision-view";
import type { Clock } from "../shared/clock";
import type { NotAuthorizedError, NotFoundError, RepositoryError } from "../shared/errors";

export interface RecordHumanDecisionDeps extends DecisionAccessDeps {
  readonly decisions: DecisionRepository;
  readonly projects: ProjectRepository;
  readonly clock: Clock;
}

export interface RecordHumanDecisionInput {
  readonly actorId: OwnerId;
  readonly decisionId: DecisionId;
  readonly selectedOptionId: string;
  readonly rationale: string;
}

export type RecordHumanDecisionResult = Result<
  DecisionView,
  DomainError | NotFoundError | NotAuthorizedError | RepositoryError
>;

/**
 * Record the human's final decision. The acting owner is the decider — AI can
 * never occupy this role. Domain rules enforce a valid option and a rationale,
 * and reject deciding twice.
 */
export async function recordHumanDecision(
  deps: RecordHumanDecisionDeps,
  input: RecordHumanDecisionInput,
): Promise<RecordHumanDecisionResult> {
  const access = await loadOwnedDecision(deps, input.actorId, input.decisionId, "decision.decide");
  if (!access.ok) return access;

  const decided = decide(access.value, {
    selectedOptionId: input.selectedOptionId,
    decidedBy: input.actorId,
    rationale: input.rationale,
    now: deps.clock.now(),
  });
  if (!decided.ok) return decided;

  const saved = await attempt("decision.save", () => deps.decisions.save(decided.value));
  if (!saved.ok) return saved;
  return ok(toDecisionView(decided.value));
}
