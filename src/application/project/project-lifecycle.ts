import { OptimisticConcurrencyError } from "@/lib/errors";
import { err, ok, type Result } from "@/lib/result";
import {
  activateProject as activate,
  archiveProject as archive,
  completeProject as complete,
  type OwnerId,
  type Project,
  type ProjectId,
  type ProjectRepository,
} from "@/domain/project";
import type { InvalidStateTransitionError } from "@/domain/shared";
import { attempt, attemptUpdate } from "../shared/attempt";
import { ensureOwner } from "../shared/authorization";
import type { Clock } from "../shared/clock";
import { NotAuthorizedError, NotFoundError, type RepositoryError } from "../shared/errors";
import { type ProjectView, toProjectView } from "./project-view";

export interface ProjectLifecycleDeps {
  readonly projects: ProjectRepository;
  readonly clock: Clock;
}

export interface ProjectLifecycleInput {
  readonly actorId: OwnerId;
  readonly projectId: ProjectId;
  /** The lockVersion the caller last observed (optimistic concurrency). */
  readonly expectedVersion: number;
}

export type ProjectLifecycleResult = Result<
  ProjectView,
  | NotFoundError
  | NotAuthorizedError
  | InvalidStateTransitionError
  | OptimisticConcurrencyError
  | RepositoryError
>;

type DomainTransition = (
  project: Project,
  now: Date,
) => Result<Project, InvalidStateTransitionError>;

async function runTransition(
  deps: ProjectLifecycleDeps,
  input: ProjectLifecycleInput,
  action: string,
  transition: DomainTransition,
): Promise<ProjectLifecycleResult> {
  const loaded = await attempt("project.findById", () => deps.projects.findById(input.projectId));
  if (!loaded.ok) return loaded;
  const project = loaded.value;
  if (!project) return err(new NotFoundError("Project", input.projectId));

  const authorized = ensureOwner(input.actorId, project.ownerId, action);
  if (!authorized.ok) return authorized;

  // Reject a stale caller: the resource changed since the caller observed it.
  if (project.lockVersion !== input.expectedVersion) {
    return err(new OptimisticConcurrencyError());
  }

  // Domain behavior runs before any persistence; a rejected transition never saves.
  const transitioned = transition(project, deps.clock.now());
  if (!transitioned.ok) return transitioned;

  const saved = await attemptUpdate("project.update", () =>
    deps.projects.update(transitioned.value),
  );
  if (!saved.ok) return saved;
  // Persistence incremented the lock version; reflect it in the returned token.
  return ok(
    toProjectView({ ...transitioned.value, lockVersion: transitioned.value.lockVersion + 1 }),
  );
}

export function activateProject(
  deps: ProjectLifecycleDeps,
  input: ProjectLifecycleInput,
): Promise<ProjectLifecycleResult> {
  return runTransition(deps, input, "project.activate", activate);
}

export function completeProject(
  deps: ProjectLifecycleDeps,
  input: ProjectLifecycleInput,
): Promise<ProjectLifecycleResult> {
  return runTransition(deps, input, "project.complete", complete);
}

export function archiveProject(
  deps: ProjectLifecycleDeps,
  input: ProjectLifecycleInput,
): Promise<ProjectLifecycleResult> {
  return runTransition(deps, input, "project.archive", archive);
}
