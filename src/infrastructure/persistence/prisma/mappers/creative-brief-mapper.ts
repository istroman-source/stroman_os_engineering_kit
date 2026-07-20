import type { CreativeBrief as CreativeBriefRow, Prisma } from "@prisma/client";
import { type CreativeBrief, CreativeBriefId } from "@/domain/creative";
import { ProjectId } from "@/domain/project";
import { orThrowMapping } from "./shared";

export function toCreativeBrief(row: CreativeBriefRow): CreativeBrief {
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
    createdAt: brief.createdAt,
    updatedAt: brief.updatedAt,
    lockVersion: brief.lockVersion,
  };
}
