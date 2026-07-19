import { err, ok, type Result } from "@/lib/result";
import type { EvaluationId, EvaluationRepository } from "@/domain/evaluation";
import type { OwnerId, ProjectRepository } from "@/domain/project";
import { attempt } from "../shared/attempt";
import { ensureOwner } from "../shared/authorization";
import { NotAuthorizedError, NotFoundError, type RepositoryError } from "../shared/errors";
import { type EvaluationView, toEvaluationView } from "./evaluation-view";

export interface GetEvaluationDeps {
  readonly evaluations: EvaluationRepository;
  readonly projects: ProjectRepository;
}

export interface GetEvaluationInput {
  readonly actorId: OwnerId;
  readonly evaluationId: EvaluationId;
}

export type GetEvaluationResult = Result<
  EvaluationView,
  NotFoundError | NotAuthorizedError | RepositoryError
>;

export async function getEvaluation(
  deps: GetEvaluationDeps,
  input: GetEvaluationInput,
): Promise<GetEvaluationResult> {
  const loaded = await attempt("evaluation.findById", () =>
    deps.evaluations.findById(input.evaluationId),
  );
  if (!loaded.ok) return loaded;
  const evaluation = loaded.value;
  if (!evaluation) return err(new NotFoundError("Evaluation", input.evaluationId));

  // Authorize via the owning project.
  const projectLoad = await attempt("project.findById", () =>
    deps.projects.findById(evaluation.projectId),
  );
  if (!projectLoad.ok) return projectLoad;
  const project = projectLoad.value;
  if (!project) return err(new NotFoundError("Project", evaluation.projectId));
  const authorized = ensureOwner(input.actorId, project.ownerId, "evaluation.get");
  if (!authorized.ok) return authorized;

  return ok(toEvaluationView(evaluation));
}
