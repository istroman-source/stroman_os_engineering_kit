import { ok, type Result } from "@/lib/result";
import {
  createProject as createProjectAggregate,
  makeProjectName,
  type OwnerId,
  ProjectId,
  type ProjectRepository,
} from "@/domain/project";
import type { InvalidValueError } from "@/domain/shared";
import { attempt } from "../shared/attempt";
import type { Clock } from "../shared/clock";
import type { RepositoryError } from "../shared/errors";
import type { IdGenerator } from "../shared/id-generator";
import { type ProjectView, toProjectView } from "./project-view";

export interface CreateProjectDeps {
  readonly projects: ProjectRepository;
  readonly ids: IdGenerator;
  readonly clock: Clock;
}

export interface CreateProjectInput {
  /** The authenticated user; becomes the project owner. */
  readonly actorId: OwnerId;
  readonly name: string;
}

export type CreateProjectResult = Result<ProjectView, InvalidValueError | RepositoryError>;

export async function createProject(
  deps: CreateProjectDeps,
  input: CreateProjectInput,
): Promise<CreateProjectResult> {
  const name = makeProjectName(input.name);
  if (!name.ok) return name;

  const project = createProjectAggregate({
    id: ProjectId.unsafe(deps.ids.generate(ProjectId.prefix)),
    ownerId: input.actorId,
    name: name.value,
    now: deps.clock.now(),
  });

  const saved = await attempt("project.insert", () => deps.projects.insert(project));
  if (!saved.ok) return saved;
  return ok(toProjectView(project));
}
