import { OptimisticConcurrencyError } from "@/lib/errors";
import { err, ok, type Result } from "@/lib/result";
import {
  makeProjectName,
  renameProject as rename,
  type OwnerId,
  type ProjectId,
  type ProjectRepository,
} from "@/domain/project";
import type { InvalidValueError } from "@/domain/shared";
import { attempt, attemptUpdate } from "../shared/attempt";
import { ensureOwner } from "../shared/authorization";
import type { Clock } from "../shared/clock";
import { NotAuthorizedError, NotFoundError, type RepositoryError } from "../shared/errors";
import { type ProjectView, toProjectView } from "./project-view";

export interface RenameProjectDeps {
  readonly projects: ProjectRepository;
  readonly clock: Clock;
}

export interface RenameProjectInput {
  readonly actorId: OwnerId;
  readonly projectId: ProjectId;
  readonly name: string;
  readonly expectedVersion: number;
}

export type RenameProjectResult = Result<
  ProjectView,
  | InvalidValueError
  | NotFoundError
  | NotAuthorizedError
  | OptimisticConcurrencyError
  | RepositoryError
>;

export async function renameProject(
  deps: RenameProjectDeps,
  input: RenameProjectInput,
): Promise<RenameProjectResult> {
  const parsedName = makeProjectName(input.name);
  if (!parsedName.ok) return parsedName;

  const loaded = await attempt("project.findById", () => deps.projects.findById(input.projectId));
  if (!loaded.ok) return loaded;
  const project = loaded.value;
  if (!project) return err(new NotFoundError("Project", input.projectId));

  const authorized = ensureOwner(input.actorId, project.ownerId, "project.rename");
  if (!authorized.ok) return authorized;

  // Repository compare-and-swap is authoritative. Keeping the caller's version on
  // the aggregate lets the adapter reject a stale browser write atomically.
  if (project.lockVersion !== input.expectedVersion) {
    return err(new OptimisticConcurrencyError());
  }

  const renamed = rename(project, parsedName.value, deps.clock.now());
  const saved = await attemptUpdate("project.update", () => deps.projects.update(renamed));
  if (!saved.ok) return saved;

  return ok(toProjectView({ ...renamed, lockVersion: renamed.lockVersion + 1 }));
}
