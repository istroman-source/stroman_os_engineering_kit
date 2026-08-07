import { err, ok, type Result } from "@/lib/result";
import type { ReviewRunId, ReviewRunRepository } from "@/domain/evaluation";
import type { OwnerId, ProjectRepository } from "@/domain/project";
import { attempt } from "../shared/attempt";
import { ensureOwner } from "../shared/authorization";
import { NotAuthorizedError, NotFoundError, RepositoryError } from "../shared/errors";
import { toReviewRunView, type ReviewRunView } from "./review-run-view";

export async function getReviewRun(
  deps: { reviewRuns: ReviewRunRepository; projects: ProjectRepository },
  input: { actorId: OwnerId; reviewRunId: ReviewRunId },
): Promise<Result<ReviewRunView, NotFoundError | NotAuthorizedError | RepositoryError>> {
  const loaded = await attempt("reviewRun.findById", () =>
    deps.reviewRuns.findById(input.reviewRunId),
  );
  if (!loaded.ok) return loaded;
  if (!loaded.value) return err(new NotFoundError("Review run", input.reviewRunId));
  const project = await attempt("project.findById", () =>
    deps.projects.findById(loaded.value!.projectId),
  );
  if (!project.ok) return project;
  if (!project.value) return err(new NotFoundError("Project", loaded.value.projectId));
  const authorized = ensureOwner(input.actorId, project.value.ownerId, "review-run.get");
  if (!authorized.ok) return authorized;
  return ok(toReviewRunView(loaded.value));
}
