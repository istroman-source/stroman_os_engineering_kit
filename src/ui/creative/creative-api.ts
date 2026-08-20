"use client";

import {
  ApiRequestError,
  apiGetWithEtag,
  apiPostForm,
  apiPostWithEtag,
  errorStatus,
} from "@/ui/auth/api-client";
import type {
  Blueprint as DomainBlueprint,
  CreativePlanningContext,
  ProductionReality,
  ProductionStage,
  ShotPlanningState,
  LocationWorkspaceState,
  LocationReconstructionView,
} from "@/domain/creative";

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
  readonly planningContext: CreativePlanningContext;
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

const RECOVERY_POLL_INTERVAL_MS = 5_000;
// The hosted pipeline has four sequential stages, and each provider call has a
// ten-minute hard bound. Poll through that full worst case plus teardown/commit
// margin so the UI never encourages a duplicate generation while the original
// atomic write can still legitimately complete.
const RECOVERY_TIMEOUT_MS = 41 * 60_000;

function wait(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function currentAnalysisTimestamp(projectId: string): Promise<string | null> {
  try {
    return (await getAnalysis(projectId)).brief.updatedAt;
  } catch (error) {
    if (errorStatus(error) === 404) return null;
    throw error;
  }
}

/**
 * Railway can close an otherwise healthy long-running HTTP request before the
 * four-stage hosted reasoning pipeline finishes. The Node process continues the
 * work and commits atomically, so recover by polling the owner-scoped GET until
 * a new brief appears. An existing analysis must actually change; returning the
 * stale blueprint would falsely imply that a re-development completed.
 */
async function awaitCommittedAnalysis(
  projectId: string,
  baselineUpdatedAt: string | null,
): Promise<Analysis> {
  const deadline = Date.now() + RECOVERY_TIMEOUT_MS;
  while (Date.now() < deadline) {
    await wait(RECOVERY_POLL_INTERVAL_MS);
    try {
      const analysis = await getAnalysis(projectId);
      if (baselineUpdatedAt === null || analysis.brief.updatedAt !== baselineUpdatedAt) {
        return analysis;
      }
    } catch (error) {
      const status = errorStatus(error);
      if (status !== 404 && (status === undefined || status < 500)) throw error;
    }
  }
  throw new ApiRequestError(
    504,
    "CREATIVE_DEVELOPMENT_PENDING",
    "Creative development has not finished yet.",
  );
}

/** Analyze a project from creator context; returns the generated blueprint. */
export async function analyzeProject(projectId: string, fields: AnalyzeFields): Promise<Analysis> {
  const baselineUpdatedAt = await currentAnalysisTimestamp(projectId);
  try {
    const { data } = await apiPostWithEtag<Analysis>(
      `/api/v1/projects/${enc(projectId)}/analysis`,
      fields,
    );
    return data;
  } catch (error) {
    if (!(error instanceof ApiRequestError) || error.code !== "INVALID_UPSTREAM_RESPONSE") {
      throw error;
    }
    return awaitCommittedAnalysis(projectId, baselineUpdatedAt);
  }
}

export async function uploadScoutPhotos(
  projectId: string,
  files: readonly File[],
): Promise<Analysis> {
  const form = new FormData();
  for (const file of files) form.append("files", file);
  return apiPostForm<Analysis>(`/api/v1/projects/${enc(projectId)}/scout-photos`, form);
}

export async function uploadLocationEnvironment(
  projectId: string,
  input: {
    readonly file: File;
    readonly name: string;
    readonly sourceKind: "PHONE_SCAN" | "PHOTOGRAMMETRY" | "ROOMPLAN" | "OTHER";
    readonly unit: "METERS" | "CENTIMETERS" | "MILLIMETERS";
    readonly metricScale: boolean;
  },
): Promise<Analysis> {
  const form = new FormData();
  form.append("file", input.file);
  form.append("name", input.name);
  form.append("sourceKind", input.sourceKind);
  form.append("unit", input.unit);
  form.append("metricScale", String(input.metricScale));
  return apiPostForm<Analysis>(`/api/v1/projects/${enc(projectId)}/location-environments`, form);
}

export async function startLocationPhotoReconstruction(
  projectId: string,
  input: {
    readonly name: string;
    readonly photos: readonly File[];
    readonly onProgress?: (uploaded: number, total: number) => void;
  },
): Promise<LocationReconstructionView> {
  const uploadIds: string[] = [];
  for (const [index, photo] of input.photos.entries()) {
    const form = new FormData();
    form.append("photo", photo);
    const response = await apiPostForm<{ upload: { uploadId: string } }>(
      `/api/v1/projects/${enc(projectId)}/location-reconstructions/photos`,
      form,
    );
    uploadIds.push(response.upload.uploadId);
    input.onProgress?.(index + 1, input.photos.length);
  }
  try {
    const { data: response } = await apiPostWithEtag<{ job: LocationReconstructionView }>(
      `/api/v1/projects/${enc(projectId)}/location-reconstructions`,
      { name: input.name, uploadIds },
    );
    return response.job;
  } catch (error) {
    const status = errorStatus(error);
    if (status !== undefined && status >= 500) {
      try {
        const recovered = await getLatestLocationPhotoReconstruction(projectId);
        if (
          recovered &&
          recovered.name === input.name &&
          recovered.photoCount === input.photos.length
        ) {
          return recovered;
        }
      } catch {
        // Preserve the original typed edge/provider failure below.
      }
    }
    throw error;
  }
}

export async function getLatestLocationPhotoReconstruction(
  projectId: string,
): Promise<LocationReconstructionView | null> {
  const { data } = await apiGetWithEtag<{ job: LocationReconstructionView | null }>(
    `/api/v1/projects/${enc(projectId)}/location-reconstructions`,
  );
  return data.job;
}

export async function refreshLocationPhotoReconstruction(
  projectId: string,
  reconstructionId: string,
): Promise<LocationReconstructionView> {
  const { data } = await apiPostWithEtag<{ job: LocationReconstructionView }>(
    `/api/v1/projects/${enc(projectId)}/location-reconstructions/${enc(reconstructionId)}/refresh`,
    {},
  );
  return data.job;
}

export async function saveLocationShot(
  projectId: string,
  input: {
    readonly workspace: LocationWorkspaceState;
    readonly frame: Blob;
    readonly width: number;
    readonly height: number;
    readonly title: string;
    readonly technicalSummary: string;
    readonly shootingInstructions: string;
    readonly includesUnknownSpace: boolean;
  },
): Promise<Analysis> {
  const form = new FormData();
  form.append("workspace", JSON.stringify(input.workspace));
  form.append("frame", input.frame, "camera-frame.png");
  form.append("width", String(input.width));
  form.append("height", String(input.height));
  form.append("title", input.title);
  form.append("technicalSummary", input.technicalSummary);
  form.append("shootingInstructions", input.shootingInstructions);
  form.append("includesUnknownSpace", String(input.includesUnknownSpace));
  return apiPostForm<Analysis>(`/api/v1/projects/${enc(projectId)}/location-shots`, form);
}

export async function updatePlanning(
  projectId: string,
  input: {
    readonly stage?: ProductionStage;
    readonly production?: Partial<ProductionReality>;
    readonly correction?: { readonly statement: string; readonly replacesClaimId?: string | null };
    readonly shotPlanning?: ShotPlanningState;
  },
): Promise<Analysis> {
  const { data } = await apiPostWithEtag<Analysis>(
    `/api/v1/projects/${enc(projectId)}/planning`,
    input,
  );
  return data;
}
