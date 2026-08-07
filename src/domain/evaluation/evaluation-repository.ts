import type { ProjectId } from "../project/project-id";
import type { Evaluation } from "./evaluation";
import type { EvaluationId, ReviewRunId, RubricId } from "./evaluation-id";
import type { Rubric } from "./rubric";
import type { ReviewRun } from "./review-run";

/** Rubrics are append-only in the current domain (no edit use case). */
export interface RubricRepository {
  findById(id: RubricId): Promise<Rubric | null>;
  /** Create a new rubric. Rejects if the id already exists. */
  insert(rubric: Rubric): Promise<void>;
}

/** Evaluations are append-only (immutable once recorded). */
export interface EvaluationRepository {
  findById(id: EvaluationId): Promise<Evaluation | null>;
  listByProject(projectId: ProjectId): Promise<readonly Evaluation[]>;
  /** Create a new evaluation. Rejects if the id already exists. */
  insert(evaluation: Evaluation): Promise<void>;
}

/** Completed reviews are immutable audit records. */
export interface ReviewRunRepository {
  findById(id: ReviewRunId): Promise<ReviewRun | null>;
  listByProject(projectId: ProjectId): Promise<readonly ReviewRun[]>;
  insert(review: ReviewRun): Promise<void>;
}
