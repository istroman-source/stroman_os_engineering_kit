import type { ProjectId } from "../project/project-id";
import type { Evaluation } from "./evaluation";
import type { EvaluationId, RubricId } from "./evaluation-id";
import type { Rubric } from "./rubric";

export interface RubricRepository {
  findById(id: RubricId): Promise<Rubric | null>;
  save(rubric: Rubric): Promise<void>;
}

export interface EvaluationRepository {
  findById(id: EvaluationId): Promise<Evaluation | null>;
  listByProject(projectId: ProjectId): Promise<readonly Evaluation[]>;
  save(evaluation: Evaluation): Promise<void>;
}
