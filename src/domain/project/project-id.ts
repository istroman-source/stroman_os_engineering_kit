import { type Brand, defineId } from "../shared";

/** Identity of a Project. */
export type ProjectId = Brand<string, "ProjectId">;
export const ProjectId = defineId<"ProjectId">("ProjectId", "proj");

/**
 * Reference to the user who owns a project. The user domain is external to this
 * codebase for now; we only hold a validated reference.
 */
export type OwnerId = Brand<string, "OwnerId">;
export const OwnerId = defineId<"OwnerId">("OwnerId", "usr");
