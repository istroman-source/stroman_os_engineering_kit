import type {
  Prisma,
  StoryAngle as StoryAngleRow,
  StoryCritique as StoryCritiqueRow,
  StoryEvidence as StoryEvidenceRow,
} from "@prisma/client";
import { InsightId, MemoryId } from "@/domain/memory";
import { OwnerId } from "@/domain/project";
import { makeScore } from "@/domain/shared";
import {
  type CriticType,
  type EvidenceRole,
  type StoryAngle,
  StoryAngleId,
  type StoryAngleStatus,
  type StoryCritique,
  StoryCritiqueId,
  type StoryEvidence,
  StoryEvidenceId,
  type StoryRecommendation,
} from "@/domain/story-reasoning";
import { ProjectId } from "@/domain/project";
import { orThrowMapping } from "./shared";

const ownerOf = (raw: string): OwnerId => orThrowMapping(OwnerId.parse(raw), `owner_id="${raw}"`);

export function toStoryAngle(row: StoryAngleRow): StoryAngle {
  return {
    id: orThrowMapping(StoryAngleId.parse(row.id), `storyAngle.id="${row.id}"`),
    ownerId: ownerOf(row.ownerId),
    projectId: orThrowMapping(
      ProjectId.parse(row.projectId),
      `storyAngle.projectId="${row.projectId}"`,
    ),
    title: row.title,
    theme: row.theme,
    premise: row.premise,
    audiencePromise: row.audiencePromise,
    centralQuestion: row.centralQuestion,
    status: row.status as StoryAngleStatus,
    createdAt: row.createdAt,
    lockVersion: row.lockVersion,
  };
}

export function toStoryAngleFields(angle: StoryAngle): Prisma.StoryAngleCreateManyInput {
  return {
    id: angle.id,
    ownerId: angle.ownerId,
    projectId: angle.projectId,
    title: angle.title,
    theme: angle.theme,
    premise: angle.premise,
    audiencePromise: angle.audiencePromise,
    centralQuestion: angle.centralQuestion,
    status: angle.status,
    createdAt: angle.createdAt,
    lockVersion: angle.lockVersion,
  };
}

export function toStoryEvidence(row: StoryEvidenceRow): StoryEvidence {
  return {
    id: orThrowMapping(StoryEvidenceId.parse(row.id), `storyEvidence.id="${row.id}"`),
    ownerId: ownerOf(row.ownerId),
    storyAngleId: orThrowMapping(
      StoryAngleId.parse(row.storyAngleId),
      `storyEvidence.storyAngleId="${row.storyAngleId}"`,
    ),
    memoryId:
      row.memoryId === null
        ? null
        : orThrowMapping(MemoryId.parse(row.memoryId), `storyEvidence.memoryId="${row.memoryId}"`),
    insightId:
      row.insightId === null
        ? null
        : orThrowMapping(
            InsightId.parse(row.insightId),
            `storyEvidence.insightId="${row.insightId}"`,
          ),
    role: row.role as EvidenceRole,
    reason: row.reason,
    createdAt: row.createdAt,
  };
}

export function toStoryEvidenceFields(
  evidence: StoryEvidence,
): Prisma.StoryEvidenceCreateManyInput {
  return {
    id: evidence.id,
    ownerId: evidence.ownerId,
    storyAngleId: evidence.storyAngleId,
    memoryId: evidence.memoryId,
    insightId: evidence.insightId,
    role: evidence.role,
    reason: evidence.reason,
    createdAt: evidence.createdAt,
  };
}

const scoreOf = (value: number, field: string) =>
  orThrowMapping(makeScore(value), `storyCritique.${field}=${value}`);

export function toStoryCritique(row: StoryCritiqueRow): StoryCritique {
  return {
    id: orThrowMapping(StoryCritiqueId.parse(row.id), `storyCritique.id="${row.id}"`),
    ownerId: ownerOf(row.ownerId),
    storyAngleId: orThrowMapping(
      StoryAngleId.parse(row.storyAngleId),
      `storyCritique.storyAngleId="${row.storyAngleId}"`,
    ),
    criticType: row.criticType as CriticType,
    criticId: row.criticId === null ? null : ownerOf(row.criticId),
    evidenceStrength: scoreOf(row.evidenceStrength, "evidenceStrength"),
    emotionalPotential: scoreOf(row.emotionalPotential, "emotionalPotential"),
    visualPotential: scoreOf(row.visualPotential, "visualPotential"),
    brandAlignment: scoreOf(row.brandAlignment, "brandAlignment"),
    originality: scoreOf(row.originality, "originality"),
    interviewPotential: scoreOf(row.interviewPotential, "interviewPotential"),
    strengths: row.strengths,
    weaknesses: row.weaknesses,
    recommendation: row.recommendation as StoryRecommendation,
    rationale: row.rationale,
    createdAt: row.createdAt,
  };
}

export function toStoryCritiqueFields(
  critique: StoryCritique,
): Prisma.StoryCritiqueCreateManyInput {
  return {
    id: critique.id,
    ownerId: critique.ownerId,
    storyAngleId: critique.storyAngleId,
    criticType: critique.criticType,
    criticId: critique.criticId,
    evidenceStrength: critique.evidenceStrength,
    emotionalPotential: critique.emotionalPotential,
    visualPotential: critique.visualPotential,
    brandAlignment: critique.brandAlignment,
    originality: critique.originality,
    interviewPotential: critique.interviewPotential,
    strengths: critique.strengths,
    weaknesses: critique.weaknesses,
    recommendation: critique.recommendation,
    rationale: critique.rationale,
    createdAt: critique.createdAt,
  };
}
