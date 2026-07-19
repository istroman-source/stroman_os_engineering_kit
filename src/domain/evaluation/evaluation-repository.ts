import type { ProjectId } from "../project/project-id";
import type { Evaluation } from "./evaluation";
import type { EvaluationId, RubricId } from "./evaluation-id";
import type { Rubric } from "./rubric";

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
