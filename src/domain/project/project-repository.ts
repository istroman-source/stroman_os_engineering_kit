import type { Project } from "./project";
import type { OwnerId, ProjectId } from "./project-id";

/**
 * Persistence contract owned by the Project domain. Intent-revealing, not CRUD.
 * Adapters (built later) must not leak database or query types across this seam.
 */
export interface ProjectRepository {
  /** Return the project, or null if none exists with this identity. */
  findById(id: ProjectId): Promise<Project | null>;
  /** All projects owned by a user. */
  listByOwner(ownerId: OwnerId): Promise<readonly Project[]>;
  /** Create a new project. Rejects if the id already exists (never overwrites). */
  insert(project: Project): Promise<void>;
  /**
   * Update an existing project. Rejects if the id does not exist (never inserts)
   * and rejects a stale write (optimistic concurrency on `lockVersion`).
   */
  update(project: Project): Promise<void>;
}
