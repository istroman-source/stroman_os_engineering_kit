import { map, type Result } from "@/lib/result";
import type { OwnerId, ProjectRepository } from "@/domain/project";
import { attempt } from "../shared/attempt";
import type { RepositoryError } from "../shared/errors";
import { type ProjectView, toProjectView } from "./project-view";

export interface ListProjectsForOwnerDeps {
  readonly projects: ProjectRepository;
}

export interface ListProjectsForOwnerInput {
  /** The actor lists their own projects; ownership is implicit. */
  readonly actorId: OwnerId;
}

export type ListProjectsForOwnerResult = Result<readonly ProjectView[], RepositoryError>;

export async function listProjectsForOwner(
  deps: ListProjectsForOwnerDeps,
  input: ListProjectsForOwnerInput,
): Promise<ListProjectsForOwnerResult> {
  const listed = await attempt("project.listByOwner", () =>
    deps.projects.listByOwner(input.actorId),
  );
  return map(listed, (projects) => projects.map(toProjectView));
}
