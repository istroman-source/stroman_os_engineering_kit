"use client";

import { apiGetWithEtag, apiPostWithEtag } from "@/ui/auth/api-client";
import type { Blueprint as DomainBlueprint } from "@/domain/creative";

export type Blueprint = DomainBlueprint;

export interface CreativeBrief {
  readonly id: string;
  readonly projectId: string;
  readonly title: string;
  readonly client: string;
  readonly projectType: string;
  readonly creativeGoal: string;
  readonly targetAudience: string;
  readonly desiredEmotion: string;
  readonly context: string;
  readonly createdAt: string;
  readonly updatedAt: string;
}

export interface Analysis {
  readonly brief: CreativeBrief;
  readonly blueprint: Blueprint;
}

export interface AnalyzeFields {
  readonly title: string;
  readonly client: string;
  readonly projectType: string;
  readonly creativeGoal: string;
  readonly targetAudience: string;
  readonly desiredEmotion: string;
  readonly context: string;
}

const enc = encodeURIComponent;

/** Fetch a project's saved analysis (brief + blueprint). Throws 404 if not analyzed. */
export async function getAnalysis(projectId: string): Promise<Analysis> {
  const { data } = await apiGetWithEtag<Analysis>(`/api/v1/projects/${enc(projectId)}/analysis`);
  return data;
}

/** Analyze a project from creator context; returns the generated blueprint. */
export async function analyzeProject(projectId: string, fields: AnalyzeFields): Promise<Analysis> {
  const { data } = await apiPostWithEtag<Analysis>(
    `/api/v1/projects/${enc(projectId)}/analysis`,
    fields,
  );
  return data;
}
