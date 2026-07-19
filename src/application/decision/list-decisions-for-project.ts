import { err, map, type Result } from "@/lib/result";
import type { DecisionRepository } from "@/domain/decision";
import type { OwnerId, ProjectId, ProjectRepository } from "@/domain/project";
import { attempt } from "../shared/attempt";
import { ensureOwner } from "../shared/authorization";
import { NotAuthorizedError, NotFoundError, type RepositoryError } from "../shared/errors";
import { type DecisionView, toDecisionView } from "./decision-view";

export interface ListDecisionsForProjectDeps {
  readonly projects: ProjectRepository;
  readonly decisions: DecisionRepository;
}

export interface ListDecisionsForProjectInput {
  readonly actorId: OwnerId;
  readonly projectId: ProjectId;
}

export type ListDecisionsForProjectResult = Result<
  readonly DecisionView[],
  NotFoundError | NotAuthorizedError | RepositoryError
>;

export async function listDecisionsForProject(
  deps: ListDecisionsForProjectDeps,
  input: ListDecisionsForProjectInput,
): Promise<ListDecisionsForProjectResult> {
  const projectLoad = await attempt("project.findById", () =>
    deps.projects.findById(input.projectId),
  );
  if (!projectLoad.ok) return projectLoad;
  const project = projectLoad.value;
  if (!project) return err(new NotFoundError("Project", input.projectId));
  const authorized = ensureOwner(input.actorId, project.ownerId, "decision.list");
  if (!authorized.ok) return authorized;

  const listed = await attempt("decision.listByProject", () =>
    deps.decisions.listByProject(input.projectId),
  );
  return map(listed, (decisions) => decisions.map(toDecisionView));
}
