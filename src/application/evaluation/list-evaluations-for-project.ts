import { err, map, type Result } from "@/lib/result";
import type { EvaluationRepository } from "@/domain/evaluation";
import type { OwnerId, ProjectId, ProjectRepository } from "@/domain/project";
import { attempt } from "../shared/attempt";
import { ensureOwner } from "../shared/authorization";
import { NotAuthorizedError, NotFoundError, type RepositoryError } from "../shared/errors";
import { type EvaluationView, toEvaluationView } from "./evaluation-view";

export interface ListEvaluationsForProjectDeps {
  readonly projects: ProjectRepository;
  readonly evaluations: EvaluationRepository;
}

export interface ListEvaluationsForProjectInput {
  readonly actorId: OwnerId;
  readonly projectId: ProjectId;
}

export type ListEvaluationsForProjectResult = Result<
  readonly EvaluationView[],
  NotFoundError | NotAuthorizedError | RepositoryError
>;

export async function listEvaluationsForProject(
  deps: ListEvaluationsForProjectDeps,
  input: ListEvaluationsForProjectInput,
): Promise<ListEvaluationsForProjectResult> {
  const projectLoad = await attempt("project.findById", () =>
    deps.projects.findById(input.projectId),
  );
  if (!projectLoad.ok) return projectLoad;
  const project = projectLoad.value;
  if (!project) return err(new NotFoundError("Project", input.projectId));
  const authorized = ensureOwner(input.actorId, project.ownerId, "evaluation.list");
  if (!authorized.ok) return authorized;

  const listed = await attempt("evaluation.listByProject", () =>
    deps.evaluations.listByProject(input.projectId),
  );
  return map(listed, (evaluations) => evaluations.map(toEvaluationView));
}
