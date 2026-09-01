import { err, ok, type Result } from "@/lib/result";
import { type CreativeBriefRepository } from "@/domain/creative";
import type { OwnerId, ProjectId, ProjectRepository } from "@/domain/project";
import { attempt } from "../shared/attempt";
import { ensureOwner } from "../shared/authorization";
import { NotAuthorizedError, NotFoundError, type RepositoryError } from "../shared/errors";
import { type CreativeBriefView, toCreativeBriefView } from "./creative-view";

export async function getCreativeIntent(
  deps: { projects: ProjectRepository; creativeBriefs: CreativeBriefRepository },
  input: { actorId: OwnerId; projectId: ProjectId },
): Promise<Result<CreativeBriefView, NotFoundError | NotAuthorizedError | RepositoryError>> {
  const projectLoad = await attempt("project.findById", () =>
    deps.projects.findById(input.projectId),
  );
  if (!projectLoad.ok) return projectLoad;
  if (!projectLoad.value) return err(new NotFoundError("Project", input.projectId));
  const authorized = ensureOwner(input.actorId, projectLoad.value.ownerId, "project.intent.get");
  if (!authorized.ok) return authorized;
  const briefLoad = await attempt("creativeBrief.findByProject", () =>
    deps.creativeBriefs.findByProject(input.projectId),
  );
  if (!briefLoad.ok) return briefLoad;
  if (!briefLoad.value) return err(new NotFoundError("CreativeBrief", input.projectId));
  return ok(toCreativeBriefView(briefLoad.value));
}
