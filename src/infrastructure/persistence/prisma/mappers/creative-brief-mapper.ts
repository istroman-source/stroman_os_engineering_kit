import { Prisma, type CreativeBrief as CreativeBriefRow } from "@prisma/client";
import { type CreativeBrief, CreativeBriefId, isBlueprint } from "@/domain/creative";
import { ProjectId } from "@/domain/project";
import { PersistenceMappingError } from "../errors";
import { orThrowMapping } from "./shared";

export function toCreativeBrief(row: CreativeBriefRow): CreativeBrief {
  if (row.blueprint !== null && !isBlueprint(row.blueprint)) {
    throw new PersistenceMappingError(`creativeBrief.blueprint id="${row.id}"`);
  }
  return {
    id: orThrowMapping(CreativeBriefId.parse(row.id), `creativeBrief.id="${row.id}"`),
    projectId: orThrowMapping(
      ProjectId.parse(row.projectId),
      `creativeBrief.projectId="${row.projectId}"`,
    ),
    title: row.title,
    client: row.client,
    projectType: row.projectType,
    creativeGoal: row.creativeGoal,
    targetAudience: row.targetAudience,
    desiredEmotion: row.desiredEmotion,
    context: row.context,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
    lockVersion: row.lockVersion,
    blueprint: row.blueprint,
    reasoningProvider: row.reasoningProvider,
  };
}

export function toCreativeBriefFields(brief: CreativeBrief): Prisma.CreativeBriefCreateManyInput {
  return {
    id: brief.id,
    projectId: brief.projectId,
    title: brief.title,
    client: brief.client,
    projectType: brief.projectType,
    creativeGoal: brief.creativeGoal,
    targetAudience: brief.targetAudience,
    desiredEmotion: brief.desiredEmotion,
    context: brief.context,
    blueprint: brief.blueprint
      ? (brief.blueprint as unknown as Prisma.InputJsonValue)
      : Prisma.DbNull,
    reasoningProvider: brief.reasoningProvider ?? null,
    createdAt: brief.createdAt,
    updatedAt: brief.updatedAt,
    lockVersion: brief.lockVersion,
  };
}
