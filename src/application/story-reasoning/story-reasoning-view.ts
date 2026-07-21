import type { InsightId, MemoryId } from "@/domain/memory";
import type { ProjectId } from "@/domain/project";
import type {
  CriticType,
  EvidenceRole,
  StoryAngle,
  StoryAngleId,
  StoryAngleStatus,
  StoryCritique,
  StoryCritiqueId,
  StoryEvidence,
  StoryEvidenceId,
  StoryRecommendation,
} from "@/domain/story-reasoning";

/** Read models for the Story Reasoning Engine. `ownerId` is internal and omitted. */
export interface StoryAngleView {
  readonly id: StoryAngleId;
  readonly projectId: ProjectId;
  readonly title: string;
  readonly theme: string;
  readonly premise: string;
  readonly audiencePromise: string;
  readonly centralQuestion: string;
  readonly status: StoryAngleStatus;
  readonly createdAt: Date;
  /** Optimistic-concurrency token the caller echoes back on a lifecycle change. */
  readonly lockVersion: number;
}

export interface StoryEvidenceView {
  readonly id: StoryEvidenceId;
  readonly storyAngleId: StoryAngleId;
  readonly memoryId: MemoryId | null;
  readonly insightId: InsightId | null;
  readonly role: EvidenceRole;
  readonly reason: string;
  readonly createdAt: Date;
}

export interface StoryCritiqueView {
  readonly id: StoryCritiqueId;
  readonly storyAngleId: StoryAngleId;
  readonly criticType: CriticType;
  readonly criticId: string | null;
  readonly evidenceStrength: number;
  readonly emotionalPotential: number;
  readonly visualPotential: number;
  readonly brandAlignment: number;
  readonly originality: number;
  readonly interviewPotential: number;
  readonly strengths: string;
  readonly weaknesses: string;
  readonly recommendation: StoryRecommendation;
  readonly rationale: string;
  readonly createdAt: Date;
}

/** Aggregate read: an angle with its cited evidence and scored critiques. */
export interface StoryAngleDetailView {
  readonly angle: StoryAngleView;
  readonly evidence: readonly StoryEvidenceView[];
  readonly critiques: readonly StoryCritiqueView[];
}

export const toStoryAngleView = (a: StoryAngle): StoryAngleView => ({
  id: a.id,
  projectId: a.projectId,
  title: a.title,
  theme: a.theme,
  premise: a.premise,
  audiencePromise: a.audiencePromise,
  centralQuestion: a.centralQuestion,
  status: a.status,
  createdAt: a.createdAt,
  lockVersion: a.lockVersion,
});

export const toStoryEvidenceView = (e: StoryEvidence): StoryEvidenceView => ({
  id: e.id,
  storyAngleId: e.storyAngleId,
  memoryId: e.memoryId,
  insightId: e.insightId,
  role: e.role,
  reason: e.reason,
  createdAt: e.createdAt,
});

export const toStoryCritiqueView = (c: StoryCritique): StoryCritiqueView => ({
  id: c.id,
  storyAngleId: c.storyAngleId,
  criticType: c.criticType,
  criticId: c.criticId,
  evidenceStrength: c.evidenceStrength,
  emotionalPotential: c.emotionalPotential,
  visualPotential: c.visualPotential,
  brandAlignment: c.brandAlignment,
  originality: c.originality,
  interviewPotential: c.interviewPotential,
  strengths: c.strengths,
  weaknesses: c.weaknesses,
  recommendation: c.recommendation,
  rationale: c.rationale,
  createdAt: c.createdAt,
});
