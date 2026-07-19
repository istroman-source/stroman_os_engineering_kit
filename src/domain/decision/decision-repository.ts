import type { ProjectId } from "../project/project-id";
import type { Decision } from "./decision";
import type { DecisionId } from "./decision-id";

export interface DecisionRepository {
  findById(id: DecisionId): Promise<Decision | null>;
  listByProject(projectId: ProjectId): Promise<readonly Decision[]>;
  /** Create a new decision. Rejects if the id already exists. */
  insert(decision: Decision): Promise<void>;
  /**
   * Update an existing decision (advisory attach / human finalization). Rejects if
   * the id does not exist and rejects a stale write (optimistic concurrency on
   * `lockVersion`) — so a duplicate finalization cannot overwrite a valid decision.
   */
  update(decision: Decision): Promise<void>;
}
