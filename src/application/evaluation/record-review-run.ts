import { err, ok, type Result } from "@/lib/result";
import {
  createReviewRun,
  CriterionId,
  type EvaluationId,
  type EvaluationRepository,
  ReviewRunId,
  type ReviewRunRepository,
  type RubricRepository,
} from "@/domain/evaluation";
import type { OwnerId, ProjectId, ProjectRepository } from "@/domain/project";
import { type DomainError, makeScore } from "@/domain/shared";
import { attempt } from "../shared/attempt";
import { ensureOwner } from "../shared/authorization";
import {
  NotAuthorizedError,
  NotFoundError,
  RepositoryError,
  UnknownRubricCriterionError,
} from "../shared/errors";
import type { Clock } from "../shared/clock";
import type { IdGenerator } from "../shared/id-generator";
import { toReviewRunView, type ReviewRunView } from "./review-run-view";

export interface RecordReviewRunDeps {
  projects: ProjectRepository;
  rubrics: RubricRepository;
  evaluations: EvaluationRepository;
  reviewRuns: ReviewRunRepository;
  ids: IdGenerator;
  clock: Clock;
}
export interface OverrideInput {
  criterionId: string;
  score: number;
  rationale: string;
}
export interface RecordReviewRunInput {
  actorId: OwnerId;
  projectId: ProjectId;
  evaluationId: EvaluationId;
  overrides: readonly OverrideInput[];
}
export type RecordReviewRunResult = Result<
  ReviewRunView,
  DomainError | NotFoundError | NotAuthorizedError | UnknownRubricCriterionError | RepositoryError
>;

export async function recordReviewRun(
  deps: RecordReviewRunDeps,
  input: RecordReviewRunInput,
): Promise<RecordReviewRunResult> {
  const projectResult = await attempt("project.findById", () =>
    deps.projects.findById(input.projectId),
  );
  if (!projectResult.ok) return projectResult;
  if (!projectResult.value) return err(new NotFoundError("Project", input.projectId));
  const authorized = ensureOwner(input.actorId, projectResult.value.ownerId, "review-run.record");
  if (!authorized.ok) return authorized;

  const evaluationResult = await attempt("evaluation.findById", () =>
    deps.evaluations.findById(input.evaluationId),
  );
  if (!evaluationResult.ok) return evaluationResult;
  const evaluation = evaluationResult.value;
  if (!evaluation) return err(new NotFoundError("Evaluation", input.evaluationId));
  if (evaluation.projectId !== input.projectId)
    return err(new NotFoundError("Evaluation", input.evaluationId));

  const rubricResult = await attempt("rubric.findById", () =>
    deps.rubrics.findById(evaluation.rubricId),
  );
  if (!rubricResult.ok) return rubricResult;
  if (!rubricResult.value) return err(new NotFoundError("Rubric", evaluation.rubricId));
  const criteria = new Set(rubricResult.value.criteria.map((criterion) => criterion.id));
  const originals = new Map(evaluation.scores.map((entry) => [entry.criterionId, entry.score]));
  const overrides = [];
  for (const entry of input.overrides) {
    if (
      !criteria.has(CriterionId.unsafe(entry.criterionId)) ||
      !originals.has(CriterionId.unsafe(entry.criterionId))
    ) {
      return err(new UnknownRubricCriterionError(entry.criterionId));
    }
    const score = makeScore(entry.score);
    if (!score.ok) return score;
    const criterionId = CriterionId.unsafe(entry.criterionId);
    overrides.push({
      criterionId,
      originalScore: originals.get(criterionId)!,
      overrideScore: score.value,
      rationale: entry.rationale,
    });
  }
  const review = createReviewRun({
    id: ReviewRunId.unsafe(deps.ids.generate(ReviewRunId.prefix)),
    projectId: input.projectId,
    rubricId: evaluation.rubricId,
    evaluationId: evaluation.id,
    reviewerId: input.actorId,
    overrides,
    completedAt: deps.clock.now(),
  });
  if (!review.ok) return review;
  const saved = await attempt("reviewRun.insert", () => deps.reviewRuns.insert(review.value));
  if (!saved.ok) return saved;
  return ok(toReviewRunView(review.value));
}
