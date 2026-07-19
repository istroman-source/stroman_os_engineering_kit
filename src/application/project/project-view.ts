import type { Project, ProjectId, ProjectName, ProjectStatus } from "@/domain/project";

/**
 * Application-owned projection of a project. Delivery layers depend on this
 * stable shape, not on the `Project` aggregate, so domain refactors do not ripple
 * into transport. Excludes `ownerId` (an authorization detail, not output).
 */
export interface ProjectView {
  readonly id: ProjectId;
  readonly name: ProjectName;
  readonly status: ProjectStatus;
  readonly createdAt: Date;
  readonly updatedAt: Date;
  /** Optimistic-concurrency token for delivery layers (e.g. HTTP ETag). */
  readonly lockVersion: number;
}

export function toProjectView(project: Project): ProjectView {
  return {
    id: project.id,
    name: project.name,
    status: project.status,
    createdAt: project.createdAt,
    updatedAt: project.updatedAt,
    lockVersion: project.lockVersion,
  };
}
