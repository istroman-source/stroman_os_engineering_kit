import type { ProjectId } from "../project";
import type { CreativeBrief } from "./creative-brief";

/**
 * Persistence port for the Creative Brief. One brief per project (the project id
 * is unique). Insert/update are split (no upsert): the application decides which
 * to call based on whether a brief already exists.
 */
export interface CreativeBriefRepository {
  findByProject(projectId: ProjectId): Promise<CreativeBrief | null>;
  insert(brief: CreativeBrief): Promise<void>;
  /** Compare-and-swap on lockVersion; rejects stale writes and missing rows. */
  update(brief: CreativeBrief): Promise<void>;
}
