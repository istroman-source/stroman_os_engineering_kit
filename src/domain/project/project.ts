import { ok, type Result } from "@/lib/result";
import { defineStateMachine, type InvalidStateTransitionError } from "../shared";
import type { OwnerId, ProjectId } from "./project-id";
import type { ProjectName } from "./project-name";

/** Project lifecycle. Archive is reachable from any non-terminal state. */
export type ProjectStatus = "DRAFT" | "ACTIVE" | "COMPLETED" | "ARCHIVED";

const lifecycle = defineStateMachine<ProjectStatus>({
  DRAFT: ["ACTIVE", "ARCHIVED"],
  ACTIVE: ["COMPLETED", "ARCHIVED"],
  COMPLETED: ["ARCHIVED"],
  ARCHIVED: [],
});

/**
 * A unit of creative work. Aggregate root of the Project domain. Immutable:
 * transitions return a new Project rather than mutating in place.
 */
export interface Project {
  readonly id: ProjectId;
  readonly ownerId: OwnerId;
  readonly name: ProjectName;
  readonly status: ProjectStatus;
  readonly createdAt: Date;
  readonly updatedAt: Date;
  /**
   * Optimistic-concurrency token, managed by the persistence layer. Distinct from
   * any domain revision count. Loaded with the aggregate and used to reject stale
   * writes; transitions preserve it (persistence increments it on update).
   */
  readonly lockVersion: number;
}

export interface CreateProjectInput {
  readonly id: ProjectId;
  readonly ownerId: OwnerId;
  readonly name: ProjectName;
  readonly now: Date;
}

export function createProject(input: CreateProjectInput): Project {
  return {
    id: input.id,
    ownerId: input.ownerId,
    name: input.name,
    status: "DRAFT",
    createdAt: input.now,
    updatedAt: input.now,
    lockVersion: 1,
  };
}

function transition(
  project: Project,
  to: ProjectStatus,
  now: Date,
): Result<Project, InvalidStateTransitionError> {
  const check = lifecycle.assert("Project", project.status, to);
  if (!check.ok) return check;
  return ok({ ...project, status: to, updatedAt: now });
}

export function activateProject(
  project: Project,
  now: Date,
): Result<Project, InvalidStateTransitionError> {
  return transition(project, "ACTIVE", now);
}

export function completeProject(
  project: Project,
  now: Date,
): Result<Project, InvalidStateTransitionError> {
  return transition(project, "COMPLETED", now);
}

export function archiveProject(
  project: Project,
  now: Date,
): Result<Project, InvalidStateTransitionError> {
  return transition(project, "ARCHIVED", now);
}
