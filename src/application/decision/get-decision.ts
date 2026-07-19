import { map, type Result } from "@/lib/result";
import type { DecisionId } from "@/domain/decision";
import type { OwnerId } from "@/domain/project";
import { type DecisionAccessDeps, loadOwnedDecision } from "./decision-access";
import { type DecisionView, toDecisionView } from "./decision-view";
import type { NotAuthorizedError, NotFoundError, RepositoryError } from "../shared/errors";

export type GetDecisionDeps = DecisionAccessDeps;

export interface GetDecisionInput {
  readonly actorId: OwnerId;
  readonly decisionId: DecisionId;
}

export type GetDecisionResult = Result<
  DecisionView,
  NotFoundError | NotAuthorizedError | RepositoryError
>;

export async function getDecision(
  deps: GetDecisionDeps,
  input: GetDecisionInput,
): Promise<GetDecisionResult> {
  const loaded = await loadOwnedDecision(deps, input.actorId, input.decisionId, "decision.get");
  return map(loaded, toDecisionView);
}
