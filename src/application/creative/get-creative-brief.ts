import { err, ok, type Result } from "@/lib/result";
import { type CreativeBriefRepository, generateBlueprint } from "@/domain/creative";
import type { OwnerId, ProjectId, ProjectRepository } from "@/domain/project";
import { attempt } from "../shared/attempt";
import { ensureOwner } from "../shared/authorization";
import { NotAuthorizedError, NotFoundError, type RepositoryError } from "../shared/errors";
import { type AnalysisView, toCreativeBriefView } from "./creative-view";

export interface GetCreativeBriefDeps {
  readonly projects: ProjectRepository;
  readonly creativeBriefs: CreativeBriefRepository;
}

export interface GetCreativeBriefInput {
  readonly actorId: OwnerId;
  readonly projectId: ProjectId;
}

export type GetCreativeBriefResult = Result<
  AnalysisView,
  NotFoundError | NotAuthorizedError | RepositoryError
>;

/** Fetch a project's brief + regenerated blueprint. NotFound when not yet analyzed. */
export async function getCreativeBrief(
  deps: GetCreativeBriefDeps,
  input: GetCreativeBriefInput,
): Promise<GetCreativeBriefResult> {
  const projectLoad = await attempt("project.findById", () =>
    deps.projects.findById(input.projectId),
  );
  if (!projectLoad.ok) return projectLoad;
  const project = projectLoad.value;
  if (!project) return err(new NotFoundError("Project", input.projectId));
  const authorized = ensureOwner(input.actorId, project.ownerId, "project.analysis.get");
  if (!authorized.ok) return authorized;

  const briefLoad = await attempt("creativeBrief.findByProject", () =>
    deps.creativeBriefs.findByProject(input.projectId),
  );
  if (!briefLoad.ok) return briefLoad;
  if (briefLoad.value === null) return err(new NotFoundError("CreativeBrief", input.projectId));

  return ok({
    brief: toCreativeBriefView(briefLoad.value),
    blueprint: generateBlueprint(briefLoad.value),
  });
}
