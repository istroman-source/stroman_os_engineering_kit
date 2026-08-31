import {
  Prisma,
  type CreativeBrief as CreativeBriefRow,
  type CreativeBriefRevision as CreativeBriefRevisionRow,
} from "@prisma/client";
import {
  type CreativeBrief,
  type CreativeBriefRevision,
  CreativeBriefId,
  emptyCreativePlanningContext,
  isBlueprint,
  isCreativePlanningContext,
  isMeaningfulDevelopment,
  parseCreativeBriefFields,
  snapshotCreativeBrief,
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
    runtimeTarget: row.runtimeTarget,
    deliveryPlatform: row.deliveryPlatform,
    references: row.references,
    restrictions: row.restrictions,
    clientRequirements: row.clientRequirements,
    nonNegotiables: row.nonNegotiables,
    successCriteria: row.successCriteria,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
    lockVersion: row.lockVersion,
    blueprint: isBlueprint(row.blueprint) ? row.blueprint : null,
    reasoningProvider: row.reasoningProvider,
    planningContext: row.planningContext ?? emptyCreativePlanningContext(),
  };
}

export function toCreativeBriefRevision(row: CreativeBriefRevisionRow): CreativeBriefRevision {
  const fields = parseCreativeBriefFields(row.snapshot);
  if (!fields.ok) {
    throw new PersistenceMappingError(`creativeBriefRevision.snapshot id="${row.id}"`);
  }
  return {
    creativeBriefId: orThrowMapping(
      CreativeBriefId.parse(row.creativeBriefId),
      `creativeBriefRevision.creativeBriefId="${row.creativeBriefId}"`,
    ),
    projectId: orThrowMapping(
      ProjectId.parse(row.projectId),
      `creativeBriefRevision.projectId="${row.projectId}"`,
    ),
    version: row.version,
    fields: fields.value,
    createdAt: row.createdAt,
  };
}

export function toCreativeBriefRevisionFields(brief: CreativeBrief, version: number) {
  const revision = snapshotCreativeBrief(brief, version);
  return {
    id: `${brief.id}:${version}`,
    creativeBriefId: revision.creativeBriefId,
    projectId: revision.projectId,
    version: revision.version,
    snapshot: revision.fields as unknown as Prisma.InputJsonValue,
    createdAt: revision.createdAt,
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
    runtimeTarget: brief.runtimeTarget,
    deliveryPlatform: brief.deliveryPlatform,
    references: brief.references,
    restrictions: brief.restrictions,
    clientRequirements: brief.clientRequirements,
    nonNegotiables: brief.nonNegotiables,
    successCriteria: brief.successCriteria,
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
