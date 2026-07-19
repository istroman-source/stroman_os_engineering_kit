import { err, ok, type Result } from "@/lib/result";
import type { OwnerId, ProjectId, ProjectRepository } from "@/domain/project";
import { attempt } from "../shared/attempt";
import { ensureOwner } from "../shared/authorization";
import { NotAuthorizedError, NotFoundError, type RepositoryError } from "../shared/errors";
import { type ProjectView, toProjectView } from "./project-view";

export interface GetProjectDeps {
  readonly projects: ProjectRepository;
}

export interface GetProjectInput {
  readonly actorId: OwnerId;
  readonly projectId: ProjectId;
}

export type GetProjectResult = Result<
  ProjectView,
  NotFoundError | NotAuthorizedError | RepositoryError
>;

export async function getProject(
  deps: GetProjectDeps,
  input: GetProjectInput,
): Promise<GetProjectResult> {
  const loaded = await attempt("project.findById", () => deps.projects.findById(input.projectId));
  if (!loaded.ok) return loaded;
  const project = loaded.value;
  if (!project) return err(new NotFoundError("Project", input.projectId));

  const authorized = ensureOwner(input.actorId, project.ownerId, "project.get");
  if (!authorized.ok) return authorized;

  return ok(toProjectView(project));
}
