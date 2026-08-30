import { err, type Result } from "@/lib/result";
import type { CreativeBriefRepository } from "@/domain/creative";
import type { OwnerId, ProjectId, ProjectRepository } from "@/domain/project";
import { attempt } from "../shared/attempt";
import { ensureOwner } from "../shared/authorization";
import { NotAuthorizedError, NotFoundError, type RepositoryError } from "../shared/errors";
import { type CreativeBriefRevisionView, toCreativeBriefRevisionView } from "./creative-view";

export async function listCreativeBriefRevisions(
  deps: { projects: ProjectRepository; creativeBriefs: CreativeBriefRepository },
  input: { actorId: OwnerId; projectId: ProjectId },
): Promise<
  Result<readonly CreativeBriefRevisionView[], NotFoundError | NotAuthorizedError | RepositoryError>
> {
  const projectLoad = await attempt("project.findById", () =>
    deps.projects.findById(input.projectId),
  );
  if (!projectLoad.ok) return projectLoad;
  if (!projectLoad.value) return err(new NotFoundError("Project", input.projectId));
  const authorized = ensureOwner(
    input.actorId,
    projectLoad.value.ownerId,
    "project.intentHistory.list",
  );
  if (!authorized.ok) return authorized;

  const revisions = await attempt("creativeBrief.listRevisions", () =>
    deps.creativeBriefs.listRevisions(input.projectId),
  );
  if (!revisions.ok) return revisions;
  return { ok: true, value: revisions.value.map(toCreativeBriefRevisionView) };
}
