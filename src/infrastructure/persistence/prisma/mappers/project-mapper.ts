import type { Project as ProjectRow } from "@prisma/client";
import { makeProjectName, OwnerId, type Project, ProjectId } from "@/domain/project";
import { orThrowMapping } from "./shared";

/** Persistence row → domain aggregate (validates ids and name). */
export function toProject(row: ProjectRow): Project {
  return {
    id: orThrowMapping(ProjectId.parse(row.id), `project.id="${row.id}"`),
    ownerId: orThrowMapping(OwnerId.parse(row.ownerId), `project.ownerId="${row.ownerId}"`),
    name: orThrowMapping(makeProjectName(row.name), "project.name"),
    status: row.status,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
    lockVersion: row.lockVersion,
  };
}

/** Domain aggregate → persistence field values (used for both create and update). */
export function toProjectFields(project: Project) {
  return {
    id: project.id,
    ownerId: project.ownerId,
    name: project.name,
    status: project.status,
    createdAt: project.createdAt,
    updatedAt: project.updatedAt,
    lockVersion: project.lockVersion,
  };
}
