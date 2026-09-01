import type { Analysis } from "./creative-api";
import {
  CreativeBriefId,
  emptyCreativePlanningContext,
  generateBlueprint,
  generateDevelopmentBlueprint,
  type CreativeBrief as DomainCreativeBrief,
} from "@/domain/creative";
import { ProjectId } from "@/domain/project";

export function creativeAnalysisFixture(interviewStrategy: string[] | null = null): Analysis {
  const now = new Date("2026-08-10T12:00:00.000Z");
  const brief: DomainCreativeBrief = {
    id: CreativeBriefId.unsafe("brief_fixture1"),
    projectId: ProjectId.unsafe("proj_fixture1"),
    title: "Morning routine of an everyday mom who eats Jimmy's Famous Meals",
    client: "Jimmy's Famous Meals",
    projectType: "Commercial",
    creativeGoal: "Conversion",
    targetAudience: "Parents who need convenience",
    desiredEmotion: "Understood, relatable, sentimental",
    context:
      "An everyday mother and her eight-month-old baby. Do not show the baby's face. Hands and feet are allowed.",
    runtimeTarget: "30 seconds",
    deliveryPlatform: "Broadcast and social",
    references: "Natural morning-routine observation",
    restrictions: "Never show the baby's face.",
    clientRequirements: "Show Jimmy's Famous Meals clearly.",
    nonNegotiables: "Hands and feet only when the baby enters frame.",
    successCriteria: "Parents recognize a credible convenience benefit.",
    createdAt: now,
    updatedAt: now,
    lockVersion: 1,
    developmentStatus: "READY",
    developmentError: null,
    developmentStartedAt: now,
    planningContext: emptyCreativePlanningContext(),
  };
  const generated = generateBlueprint(brief, generateDevelopmentBlueprint(brief));

  return {
    brief: {
      id: "brief_1",
      projectId: "proj_1",
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
      createdAt: "",
      updatedAt: "",
      planningContext: brief.planningContext,
      developmentStatus: "READY",
      developmentError: null,
      developmentStartedAt: now.toISOString(),
    },
    blueprint: { ...generated, interviewStrategy },
  };
}
