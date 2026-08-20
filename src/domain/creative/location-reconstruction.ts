import type { OwnerId, ProjectId } from "@/domain/project";
import type { SpatialBounds } from "./location-workspace";

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
  readonly bytes: Uint8Array;
}

export type ProviderReconstructionStatus = "PROCESSING" | "SUCCEEDED" | "FAILED" | "EXPIRED";

export interface LocationReconstructionProvider {
  readonly key: string;
  start(input: {
    readonly name: string;
    readonly photos: readonly LocationReconstructionPhotoInput[];
  }): Promise<{ readonly providerJobId: string }>;
  status(providerJobId: string): Promise<ProviderReconstructionStatus>;
  downloadGlb(providerJobId: string): Promise<{
    readonly bytes: Uint8Array;
    readonly fileName: string;
  }>;
}

export interface LocationGeometryInspector {
  inferRoomScale(bytes: Uint8Array): {
    readonly scaleMetersPerUnit: number;
    readonly bounds: SpatialBounds;
  };
}

export interface LocationReconstructionView {
  readonly id: string;
  readonly name: string;
  readonly status: LocationReconstructionStatus;
  readonly photoCount: number;
  readonly environmentId: string | null;
  readonly failureCode: string | null;
  readonly createdAt: string;
  readonly updatedAt: string;
}

export function toLocationReconstructionView(
  job: LocationReconstructionJob,
): LocationReconstructionView {
  return {
    id: job.id,
    name: job.name,
    status: job.status,
    photoCount: job.photos.length,
    environmentId: job.environmentId,
    failureCode: job.failureCode,
    createdAt: job.createdAt.toISOString(),
    updatedAt: job.updatedAt.toISOString(),
  };
}
