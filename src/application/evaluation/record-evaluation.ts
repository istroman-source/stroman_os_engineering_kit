import { err, ok, type Result } from "@/lib/result";
import {
  createEvaluation as createEvaluationAggregate,
  CriterionId,
  type CriterionScoreInput,
  EvaluationId,
  type EvaluationRepository,
  type ReviewerType,
  type RubricId,
  type RubricRepository,
} from "@/domain/evaluation";
import type { OwnerId, ProjectId, ProjectRepository } from "@/domain/project";
import { type DomainError, makeScore } from "@/domain/shared";
import { attempt } from "../shared/attempt";
import { ensureOwner } from "../shared/authorization";
import type { Clock } from "../shared/clock";
import {
  NotAuthorizedError,
  NotFoundError,
  type RepositoryError,
  UnknownRubricCriterionError,
} from "../shared/errors";
import type { IdGenerator } from "../shared/id-generator";
import { type EvaluationView, toEvaluationView } from "./evaluation-view";

export interface RecordEvaluationDeps {
  readonly projects: ProjectRepository;
  readonly rubrics: RubricRepository;
  readonly evaluations: EvaluationRepository;
  readonly ids: IdGenerator;
  readonly clock: Clock;
}

export interface ScoreInput {
  readonly criterionId: string;
  readonly score: number;
  readonly justification: string;
}

export interface RecordEvaluationInput {
  readonly actorId: OwnerId;
  readonly projectId: ProjectId;
  readonly rubricId: RubricId;
  readonly reviewerType: ReviewerType;
  readonly scores: readonly ScoreInput[];
}

export type RecordEvaluationResult = Result<
  EvaluationView,
  DomainError | NotFoundError | NotAuthorizedError | UnknownRubricCriterionError | RepositoryError
>;

export async function recordEvaluation(
  deps: RecordEvaluationDeps,
  input: RecordEvaluationInput,
): Promise<RecordEvaluationResult> {
  const projectLoad = await attempt("project.findById", () =>
    deps.projects.findById(input.projectId),
  );
  if (!projectLoad.ok) return projectLoad;
  const project = projectLoad.value;
  if (!project) return err(new NotFoundError("Project", input.projectId));
  const authorized = ensureOwner(input.actorId, project.ownerId, "evaluation.record");
  if (!authorized.ok) return authorized;

  const rubricLoad = await attempt("rubric.findById", () => deps.rubrics.findById(input.rubricId));
  if (!rubricLoad.ok) return rubricLoad;
  const rubric = rubricLoad.value;
  if (!rubric) return err(new NotFoundError("Rubric", input.rubricId));

  const validCriteria = new Set<string>(rubric.criteria.map((criterion) => criterion.id));
  const scores: CriterionScoreInput[] = [];
  for (const entry of input.scores) {
    if (!validCriteria.has(entry.criterionId)) {
      return err(new UnknownRubricCriterionError(entry.criterionId));
    }
    const score = makeScore(entry.score);
    if (!score.ok) return score;
    scores.push({
      criterionId: CriterionId.unsafe(entry.criterionId),
      score: score.value,
      justification: entry.justification,
    });
  }

  const evaluation = createEvaluationAggregate({
    id: EvaluationId.unsafe(deps.ids.generate(EvaluationId.prefix)),
    projectId: input.projectId,
    rubricId: input.rubricId,
    reviewerType: input.reviewerType,
    reviewerId: input.reviewerType === "HUMAN" ? input.actorId : null,
    scores,
    now: deps.clock.now(),
  });
  if (!evaluation.ok) return evaluation;

  const saved = await attempt("evaluation.save", () => deps.evaluations.save(evaluation.value));
  if (!saved.ok) return saved;
  return ok(toEvaluationView(evaluation.value));
}
