import { err, ok, type Result } from "@/lib/result";
import type { Decision, DecisionId, DecisionRepository } from "@/domain/decision";
import type { OwnerId, ProjectRepository } from "@/domain/project";
import { attempt } from "../shared/attempt";
import { ensureOwner } from "../shared/authorization";
import { NotAuthorizedError, NotFoundError, type RepositoryError } from "../shared/errors";

export interface DecisionAccessDeps {
  readonly decisions: DecisionRepository;
  readonly projects: ProjectRepository;
}

export type LoadOwnedDecisionResult = Result<
  Decision,
  NotFoundError | NotAuthorizedError | RepositoryError
>;

/**
 * Load a decision and authorize the actor via the decision's owning project.
 * Shared by the decision use cases so ownership is enforced consistently.
 */
export async function loadOwnedDecision(
  deps: DecisionAccessDeps,
  actorId: OwnerId,
  decisionId: DecisionId,
  action: string,
): Promise<LoadOwnedDecisionResult> {
  const loaded = await attempt("decision.findById", () => deps.decisions.findById(decisionId));
  if (!loaded.ok) return loaded;
  const decision = loaded.value;
  if (!decision) return err(new NotFoundError("Decision", decisionId));

  const projectLoad = await attempt("project.findById", () =>
    deps.projects.findById(decision.projectId),
  );
  if (!projectLoad.ok) return projectLoad;
  const project = projectLoad.value;
  if (!project) return err(new NotFoundError("Project", decision.projectId));

  const authorized = ensureOwner(actorId, project.ownerId, action);
  if (!authorized.ok) return authorized;
  return ok(decision);
}
