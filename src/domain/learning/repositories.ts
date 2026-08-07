import type { ProjectId } from "../project";
import type { RetrospectiveId } from "./ids";
import type { Retrospective } from "./retrospective";
export interface RetrospectiveRepository {
  findById(id: RetrospectiveId): Promise<Retrospective | null>;
  listByProject(projectId: ProjectId): Promise<readonly Retrospective[]>;
  insert(value: Retrospective): Promise<void>;
  update(value: Retrospective): Promise<void>;
}
