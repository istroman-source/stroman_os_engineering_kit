import { err, ok, type Result } from "@/lib/result";
import type { ReviewRunRepository } from "@/domain/evaluation";
import type { OwnerId, ProjectId, ProjectRepository } from "@/domain/project";
import { attempt } from "../shared/attempt";
import { ensureOwner } from "../shared/authorization";
import { NotAuthorizedError, NotFoundError, RepositoryError } from "../shared/errors";
import { toReviewRunView, type ReviewRunView } from "./review-run-view";

export async function listReviewRunsForProject(
  deps: { reviewRuns: ReviewRunRepository; projects: ProjectRepository },
  input: { actorId: OwnerId; projectId: ProjectId },
): Promise<Result<readonly ReviewRunView[], NotFoundError | NotAuthorizedError | RepositoryError>> {
  const project = await attempt("project.findById", () => deps.projects.findById(input.projectId));
  if (!project.ok) return project;
  if (!project.value) return err(new NotFoundError("Project", input.projectId));
  const authorized = ensureOwner(input.actorId, project.value.ownerId, "review-run.list");
  if (!authorized.ok) return authorized;
  const reviews = await attempt("reviewRun.listByProject", () =>
    deps.reviewRuns.listByProject(input.projectId),
  );
  return reviews.ok ? ok(reviews.value.map(toReviewRunView)) : reviews;
}
