import type { OwnerId, ProjectId } from "@/domain/project";
import type { SpatialBounds, SpatialTransform } from "./location-workspace";

export type LocationReconstructionStatus =
  "SUBMITTING" | "PROCESSING" | "SUCCEEDED" | "FAILED" | "EXPIRED";

export interface LocationCapturePhoto {
  readonly mediaAssetId: string;
  readonly fileName: string;
  readonly contentType: "image/jpeg" | "image/png";
  readonly byteSize: number;
  readonly contentHash: string;
  readonly storageKey: string;
}

/**
 * Server-side orchestration state. Provider ids stay here rather than leaking
 * into the filmmaker-owned planning aggregate.
 */
export interface LocationReconstructionJob {
  readonly id: string;
  readonly ownerId: OwnerId;
  readonly projectId: ProjectId;
  readonly name: string;
  readonly providerKey: string;
  readonly providerJobId: string | null;
  readonly status: LocationReconstructionStatus;
  readonly photos: readonly LocationCapturePhoto[];
  readonly environmentId: string | null;
  readonly failureCode: string | null;
  readonly createdAt: Date;
  readonly updatedAt: Date;
  readonly completedAt: Date | null;
  readonly lockVersion: number;
}

export interface LocationReconstructionRepository {
  findById(id: string): Promise<LocationReconstructionJob | null>;
  findLatestByProject(projectId: ProjectId): Promise<LocationReconstructionJob | null>;
  insert(job: LocationReconstructionJob): Promise<void>;
  update(job: LocationReconstructionJob): Promise<void>;
}

export interface LocationReconstructionPhotoInput {
  readonly fileName: string;
  readonly contentType: "image/jpeg" | "image/png";
  readonly byteSize: number;
  readonly contentHash: string;
  /** Load one preserved photo only when the provider is ready to stream it. */
  readonly loadBytes: () => Promise<Uint8Array>;
}

export interface LocationReconstructionPhotoUploadView {
  readonly uploadId: string;
  readonly fileName: string;
  readonly contentType: "image/jpeg" | "image/png";
  readonly byteSize: number;
}

export type ProviderReconstructionStatus =
  "UPLOADING" | "QUEUED" | "PROCESSING" | "SUCCEEDED" | "FAILED" | "EXPIRED";

export type ProviderReconstructionPhase =
  | "UPLOADING"
  | "QUEUED"
  | "ALIGNING"
  | "DENSIFYING"
  | "MESHING"
  | "TEXTURING"
  | "PACKAGING"
  | "PROCESSING";

export interface ProviderReconstructionProgress {
  readonly status: ProviderReconstructionStatus;
  /** Optional provider-neutral detail for honest filmmaker-facing progress. */
  readonly phase: ProviderReconstructionPhase | null;
  /** Optional bounded completion estimate. Never treated as evidence of success. */
  readonly percent: number | null;
}

export interface LocationReconstructionProvider {
  readonly key: string;
  start(input: {
    readonly name: string;
    readonly photos: readonly LocationReconstructionPhotoInput[];
    /** Stable per-job key so a transport retry cannot create a second capture. */
    readonly idempotencyKey?: string;
  }): Promise<{ readonly providerJobId: string }>;
  status(providerJobId: string): Promise<ProviderReconstructionProgress>;
  downloadGlb(providerJobId: string): Promise<{
    readonly bytes: Uint8Array;
    readonly fileName: string;
    /** Axis-only transform; scale is resolved separately and composed by Stroman. */
    readonly sourceToCanonicalBasis: SpatialTransform;
    /** Null when photogrammetry did not recover trustworthy absolute scale. */
    readonly metersPerSourceUnit: number | null;
  }>;
}

export interface LocationGeometryInspector {
  inferRoomScale(
    bytes: Uint8Array,
    source: {
      readonly sourceToCanonicalBasis: SpatialTransform;
      readonly metersPerSourceUnit: number | null;
    },
  ): {
    readonly scaleMetersPerUnit: number;
    readonly sourceToCanonical: SpatialTransform;
    readonly bounds: SpatialBounds;
  };
}

export interface LocationReconstructionView {
  readonly id: string;
  readonly name: string;
  readonly status: LocationReconstructionStatus;
  /** Ephemeral provider progress; never includes provider ids or implementation details. */
  readonly phase: ProviderReconstructionPhase | null;
  readonly percent: number | null;
  readonly photoCount: number;
  readonly environmentId: string | null;
  readonly failureCode: string | null;
  readonly createdAt: string;
  readonly updatedAt: string;
}

export function toLocationReconstructionView(
  job: LocationReconstructionJob,
  progress: Pick<ProviderReconstructionProgress, "phase" | "percent"> = {
    phase: null,
    percent: null,
  },
): LocationReconstructionView {
  return {
    id: job.id,
    name: job.name,
    status: job.status,
    phase: progress.phase,
    percent: progress.percent,
    photoCount: job.photos.length,
    environmentId: job.environmentId,
    failureCode: job.failureCode,
    createdAt: job.createdAt.toISOString(),
    updatedAt: job.updatedAt.toISOString(),
  };
}
