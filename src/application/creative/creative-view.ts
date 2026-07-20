import type { Blueprint, CreativeBrief } from "@/domain/creative";
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
  readonly createdAt: Date;
  readonly updatedAt: Date;
  readonly lockVersion: number;
}

/** A project's analyzed brief together with the generated blueprint. */
export interface AnalysisView {
  readonly brief: CreativeBriefView;
  readonly blueprint: Blueprint;
}

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
    createdAt: brief.createdAt,
    updatedAt: brief.updatedAt,
    lockVersion: brief.lockVersion,
  };
}
