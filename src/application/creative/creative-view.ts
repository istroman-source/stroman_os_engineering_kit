import type {
  Blueprint,
  CreativeBrief,
  CreativeBriefRevision,
  CreativePlanningContext,
} from "@/domain/creative";
import type { ProjectId } from "@/domain/project";
import type { CreativeBriefId } from "@/domain/creative";

export interface CreativeBriefView {
  readonly id: CreativeBriefId;
  readonly projectId: ProjectId;
  readonly title: string;
  readonly client: string;
  readonly projectType: string;
  readonly creativeGoal: string;
  readonly targetAudience: string;
  readonly desiredEmotion: string;
  readonly context: string;
  readonly runtimeTarget: string;
  readonly deliveryPlatform: string;
  readonly references: string;
  readonly restrictions: string;
  readonly clientRequirements: string;
  readonly nonNegotiables: string;
  readonly successCriteria: string;
  readonly createdAt: Date;
  readonly updatedAt: Date;
  readonly lockVersion: number;
  readonly developmentStatus: CreativeBrief["developmentStatus"];
  readonly developmentError: string | null;
  readonly developmentStartedAt: Date | null;
  readonly planningContext: CreativePlanningContext;
}

/** A project's analyzed brief together with the generated blueprint. */
export interface AnalysisView {
  readonly brief: CreativeBriefView;
  readonly blueprint: Blueprint;
}

export interface CreativeBriefRevisionView extends CreativeBriefFieldsView {
  readonly version: number;
  readonly createdAt: Date;
}

type CreativeBriefFieldsView = Pick<
  CreativeBriefView,
  | "title"
  | "client"
  | "projectType"
  | "creativeGoal"
  | "targetAudience"
  | "desiredEmotion"
  | "context"
  | "runtimeTarget"
  | "deliveryPlatform"
  | "references"
  | "restrictions"
  | "clientRequirements"
  | "nonNegotiables"
  | "successCriteria"
>;

export function toCreativeBriefView(brief: CreativeBrief): CreativeBriefView {
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
    createdAt: brief.createdAt,
    updatedAt: brief.updatedAt,
    lockVersion: brief.lockVersion,
    developmentStatus: brief.developmentStatus,
    developmentError: brief.developmentError ?? null,
    developmentStartedAt: brief.developmentStartedAt ?? null,
    planningContext: brief.planningContext,
  };
}

export function toCreativeBriefRevisionView(
  revision: CreativeBriefRevision,
): CreativeBriefRevisionView {
  return { ...revision.fields, version: revision.version, createdAt: revision.createdAt };
}
