import type { ProjectId } from "../project/project-id";
import type { Decision } from "./decision";
import type { DecisionId } from "./decision-id";

export interface DecisionRepository {
  findById(id: DecisionId): Promise<Decision | null>;
  listByProject(projectId: ProjectId): Promise<readonly Decision[]>;
  save(decision: Decision): Promise<void>;
}
