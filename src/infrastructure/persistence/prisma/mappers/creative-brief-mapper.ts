import { Prisma, type CreativeBrief as CreativeBriefRow } from "@prisma/client";
import {
  type CreativeBrief,
  CreativeBriefId,
  emptyCreativePlanningContext,
  isBlueprint,
  isCreativePlanningContext,
  isMeaningfulDevelopment,
} from "@/domain/creative";
import { ProjectId } from "@/domain/project";
import { PersistenceMappingError } from "../errors";
import { orThrowMapping } from "./shared";

export function toCreativeBrief(row: CreativeBriefRow): CreativeBrief {
  const legacyBlueprint =
    row.blueprint !== null &&
    typeof row.blueprint === "object" &&
    "development" in row.blueprint &&
    isMeaningfulDevelopment((row.blueprint as { development?: unknown }).development) &&
    Boolean(
      (row.blueprint as { development?: { storyboard?: { status?: unknown } } }).development
        ?.storyboard?.status === "RENDERED",
    );
  if (row.blueprint !== null && !isBlueprint(row.blueprint) && !legacyBlueprint) {
    throw new PersistenceMappingError(`creativeBrief.blueprint id="${row.id}"`);
  }
  if (row.planningContext !== null && !isCreativePlanningContext(row.planningContext)) {
    throw new PersistenceMappingError(`creativeBrief.planningContext id="${row.id}"`);
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
    blueprint: isBlueprint(row.blueprint) ? row.blueprint : null,
    reasoningProvider: row.reasoningProvider,
    planningContext: row.planningContext ?? emptyCreativePlanningContext(),
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
    planningContext: brief.planningContext as unknown as Prisma.InputJsonValue,
    createdAt: brief.createdAt,
    updatedAt: brief.updatedAt,
    lockVersion: brief.lockVersion,
  };
}
