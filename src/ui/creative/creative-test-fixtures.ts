import type { Analysis } from "./creative-api";
import {
  CreativeBriefId,
  generateBlueprint,
  type CreativeBrief as DomainCreativeBrief,
} from "@/domain/creative";
import { ProjectId } from "@/domain/project";

export function creativeAnalysisFixture(interviewStrategy: string[] | null = null): Analysis {
  const now = new Date("2026-08-10T12:00:00.000Z");
  const brief: DomainCreativeBrief = {
    id: CreativeBriefId.unsafe("brief_fixture1"),
    projectId: ProjectId.unsafe("proj_fixture1"),
    title: "Signature Dish Reel",
    client: "Jimmy's",
    projectType: "Instagram reel",
    creativeGoal: "crave the crab cake",
    targetAudience: "Baltimore foodies",
    desiredEmotion: "hungry",
    context: "20s vertical",
    createdAt: now,
    updatedAt: now,
    lockVersion: 1,
  };
  const generated = generateBlueprint(brief);

  return {
    brief: {
      id: "brief_1",
      projectId: "proj_1",
      title: "Signature Dish Reel",
      client: "Jimmy's",
      projectType: "Instagram reel",
      creativeGoal: "crave the crab cake",
      targetAudience: "Baltimore foodies",
      desiredEmotion: "hungry",
      context: "20s vertical",
      createdAt: "",
      updatedAt: "",
    },
    blueprint: { ...generated, interviewStrategy },
  };
}
