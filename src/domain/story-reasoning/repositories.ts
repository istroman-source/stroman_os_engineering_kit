import type { OwnerId, ProjectId } from "@/domain/project";
import type { StoryAngleId, StoryCritiqueId, StoryEvidenceId } from "./ids";
import type { StoryAngle } from "./story-angle";
import type { StoryCritique } from "./story-critique";
import type { StoryEvidence } from "./story-evidence";

/**
 * Persistence ports for the Story Reasoning Engine. The angle is a mutable
 * aggregate (lifecycle transitions); evidence and critiques are append-only.
 * Query methods are used only after the application has authorized the owning
 * angle/project, so they filter by the natural key.
 */
export interface StoryAngleRepository {
  insert(angle: StoryAngle): Promise<void>;
  findById(id: StoryAngleId): Promise<StoryAngle | null>;
  listByProject(projectId: ProjectId): Promise<readonly StoryAngle[]>;
  listByOwner(ownerId: OwnerId): Promise<readonly StoryAngle[]>;
  /**
   * The project's currently SELECTED angle, if any. Supports the application/
   * persistence rule that a project has at most one selected angle.
   */
  findSelectedByProject(projectId: ProjectId): Promise<StoryAngle | null>;
  /**
   * Update an existing angle's lifecycle state. Rejects if the id does not exist
   * and rejects a stale write (optimistic concurrency on `lockVersion`).
   */
  update(angle: StoryAngle): Promise<void>;
}

export interface StoryEvidenceRepository {
  insert(evidence: StoryEvidence): Promise<void>;
  findById(id: StoryEvidenceId): Promise<StoryEvidence | null>;
  listByAngle(storyAngleId: StoryAngleId): Promise<readonly StoryEvidence[]>;
  delete(id: StoryEvidenceId): Promise<void>;
}

export interface StoryCritiqueRepository {
  insert(critique: StoryCritique): Promise<void>;
  findById(id: StoryCritiqueId): Promise<StoryCritique | null>;
  listByAngle(storyAngleId: StoryAngleId): Promise<readonly StoryCritique[]>;
  delete(id: StoryCritiqueId): Promise<void>;
}
