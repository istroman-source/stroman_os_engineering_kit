import { createHash } from "node:crypto";
import { importProjectSource } from "@/application/source-import";
import type { Clock, IdGenerator } from "@/application/shared";
import {
  createLocationWorkspace,
  toLocationReconstructionView,
  type CreativeBriefRepository,
  type LocationReconstructionJob,
  type LocationGeometryInspector,
  type LocationReconstructionPhotoInput,
  type LocationReconstructionProvider,
  type LocationReconstructionRepository,
  type LocationReconstructionView,
} from "@/domain/creative";
import type { OwnerId, ProjectId, ProjectRepository } from "@/domain/project";
import type { SourceImportRepository, SourceStorage } from "@/domain/source-import";
import { AppError } from "@/lib/errors";
import { updateCreativePlanning } from "./update-creative-planning";

const MAX_ENVIRONMENT_BYTES = 500 * 1024 * 1024;
const MAX_PHOTO_BYTES = 8 * 1024 * 1024;
const MAX_TOTAL_PHOTO_BYTES = 180 * 1024 * 1024;
const ALLOWED_PHOTO_TYPES = new Set(["image/jpeg", "image/png"]);
const SUBMISSION_STALE_MS = 11 * 60_000;

interface ReconstructionDeps {
  readonly projects: ProjectRepository;
  readonly creativeBriefs: CreativeBriefRepository;
  readonly locationReconstructions: LocationReconstructionRepository;
  readonly locationReconstructionProvider: LocationReconstructionProvider;
  readonly locationGeometryInspector: LocationGeometryInspector;
  readonly sourceImports: SourceImportRepository;
  readonly sourceStorage: SourceStorage;
  readonly ids: IdGenerator;
  readonly clock: Clock;
}

function fail(code: ConstructorParameters<typeof AppError>[0], message: string): never {
  throw new AppError(code, message);
}

async function requireOwnedProject(
  deps: ReconstructionDeps,
  actorId: OwnerId,
  projectId: ProjectId,
) {
  const project = await deps.projects.findById(projectId);
  if (!project) fail("NOT_FOUND", "Project not found.");
  if (project.ownerId !== actorId) fail("FORBIDDEN", "You cannot access this project.");
  return project;
}

async function requireDevelopedBrief(deps: ReconstructionDeps, projectId: ProjectId) {
  const brief = await deps.creativeBriefs.findByProject(projectId);
  if (!brief?.blueprint) fail("NOT_FOUND", "Develop the project before building a location.");
  return brief;
}

export async function stageLocationReconstructionPhoto(
  deps: ReconstructionDeps,
  input: {
    readonly actorId: OwnerId;
    readonly projectId: ProjectId;
    readonly fileName: string;
    readonly contentType: "image/jpeg" | "image/png";
    readonly bytes: Uint8Array;
  },
) {
  await requireOwnedProject(deps, input.actorId, input.projectId);
  await requireDevelopedBrief(deps, input.projectId);
  if (deps.locationReconstructionProvider.key === "unavailable") {
    fail("UNAVAILABLE", "Photo reconstruction is not configured on this deployment.");
  }
  if (
    !ALLOWED_PHOTO_TYPES.has(input.contentType) ||
    input.bytes.byteLength === 0 ||
    input.bytes.byteLength > MAX_PHOTO_BYTES
  ) {
    fail("VALIDATION", "Location photos must be JPEG or PNG and no larger than 8 MB each.");
  }
  const contentHash = `sha256:${createHash("sha256").update(input.bytes).digest("hex")}`;
  const imported = await importProjectSource(
    { ...deps, imports: deps.sourceImports, storage: deps.sourceStorage },
    {
      actorId: input.actorId,
      projectId: input.projectId,
      idempotencyKey: `${input.projectId}:location-photo:${contentHash}`,
      sourceName: input.fileName,
      contentType: input.contentType,
      bytes: input.bytes,
      contentHash,
    },
  );
  if (!imported.ok) throw imported.error;
  if (!imported.value.mediaAssetId) fail("INTERNAL", "A location photo was not persisted.");
  return {
    uploadId: imported.value.id,
    fileName: imported.value.sourceName,
    contentType: imported.value.contentType as "image/jpeg" | "image/png",
    byteSize: imported.value.byteSize,
  };
}

export async function startLocationReconstruction(
  deps: ReconstructionDeps,
  input: {
    readonly actorId: OwnerId;
    readonly projectId: ProjectId;
    readonly name: string;
    readonly uploadIds: readonly string[];
  },
): Promise<LocationReconstructionView> {
  await requireOwnedProject(deps, input.actorId, input.projectId);
  await requireDevelopedBrief(deps, input.projectId);
  if (deps.locationReconstructionProvider.key === "unavailable") {
    fail("UNAVAILABLE", "Photo reconstruction is not configured on this deployment.");
  }
  const active = await deps.locationReconstructions.findLatestByProject(input.projectId);
  if (active && (active.status === "SUBMITTING" || active.status === "PROCESSING")) {
    const interrupted =
      active.status === "SUBMITTING" &&
      !active.providerJobId &&
      deps.clock.now().getTime() - active.updatedAt.getTime() > SUBMISSION_STALE_MS;
    if (!interrupted) {
      fail("CONFLICT", "A location is already being built from photos for this project.");
    }
    await deps.locationReconstructions.update({
      ...active,
      status: "FAILED",
      failureCode: "SUBMISSION_INTERRUPTED",
      updatedAt: deps.clock.now(),
      completedAt: deps.clock.now(),
    });
  }
  const name = input.name.trim();
  if (!name || name.length > 160)
    fail("VALIDATION", "Name the location in 160 characters or fewer.");
  if (input.uploadIds.length < 20 || input.uploadIds.length > 40) {
    fail("VALIDATION", "Choose between 20 and 40 overlapping room photos.");
  }
  if (new Set(input.uploadIds).size !== input.uploadIds.length) {
    fail("VALIDATION", "Remove duplicate photos so every angle contributes to the room.");
  }
  const imports = await deps.sourceImports.listByProject(input.projectId);
  const importsById = new Map(imports.map((receipt) => [receipt.id, receipt]));
  const selected = input.uploadIds.map((uploadId) => importsById.get(uploadId));
  if (
    selected.some(
      (receipt) =>
        !receipt ||
        receipt.ownerId !== input.actorId ||
        receipt.status !== "COMPLETED" ||
        receipt.sourceKind !== "MEDIA" ||
        !receipt.mediaAssetId ||
        !ALLOWED_PHOTO_TYPES.has(receipt.contentType) ||
        receipt.byteSize <= 0 ||
        receipt.byteSize > MAX_PHOTO_BYTES,
    )
  ) {
    fail("VALIDATION", "One or more location-photo uploads are invalid or unavailable.");
  }
  const photos = selected.map((receipt) => receipt!);
  if (new Set(photos.map(({ contentHash }) => contentHash)).size !== photos.length) {
    fail("VALIDATION", "Remove duplicate photos so every angle contributes to the room.");
  }
  if (photos.reduce((total, photo) => total + photo.byteSize, 0) > MAX_TOTAL_PHOTO_BYTES) {
    fail("VALIDATION", "The location photo set must be no larger than 180 MB.");
  }
  const sources = photos.map((photo) => ({
    mediaAssetId: photo.mediaAssetId!,
    fileName: photo.sourceName,
    contentType: photo.contentType as "image/jpeg" | "image/png",
    byteSize: photo.byteSize,
    contentHash: photo.contentHash,
    storageKey: photo.storageKey,
  }));

  const now = deps.clock.now();
  let job: LocationReconstructionJob = {
    id: deps.ids.generate("lrec"),
    ownerId: input.actorId,
    projectId: input.projectId,
    name,
    providerKey: deps.locationReconstructionProvider.key,
    providerJobId: null,
    status: "SUBMITTING",
    photos: sources,
    environmentId: null,
    failureCode: null,
    createdAt: now,
    updatedAt: now,
    completedAt: null,
    lockVersion: 1,
  };
  await deps.locationReconstructions.insert(job);
  try {
    const submitted = await deps.locationReconstructionProvider.start({
      name,
      photos: sources.map((photo): LocationReconstructionPhotoInput => ({
        fileName: photo.fileName,
        contentType: photo.contentType,
        byteSize: photo.byteSize,
        contentHash: photo.contentHash,
        loadBytes: () => deps.sourceStorage.get(photo.storageKey),
      })),
    });
    job = {
      ...job,
      providerJobId: submitted.providerJobId,
      status: "PROCESSING",
      updatedAt: deps.clock.now(),
    };
    await deps.locationReconstructions.update(job);
    return toLocationReconstructionView({ ...job, lockVersion: job.lockVersion + 1 }, "QUEUED");
  } catch (error) {
    const failed = {
      ...job,
      status: "FAILED" as const,
      failureCode: "PROVIDER_SUBMISSION_FAILED",
      updatedAt: deps.clock.now(),
      completedAt: deps.clock.now(),
    };
    await deps.locationReconstructions.update(failed).catch(() => undefined);
    throw error;
  }
}

export async function getLatestLocationReconstruction(
  deps: ReconstructionDeps,
  input: { readonly actorId: OwnerId; readonly projectId: ProjectId },
): Promise<LocationReconstructionView | null> {
  await requireOwnedProject(deps, input.actorId, input.projectId);
  const job = await deps.locationReconstructions.findLatestByProject(input.projectId);
  return job ? toLocationReconstructionView(job) : null;
}

export async function refreshLocationReconstruction(
  deps: ReconstructionDeps,
  input: { readonly actorId: OwnerId; readonly projectId: ProjectId; readonly jobId: string },
): Promise<LocationReconstructionView> {
  await requireOwnedProject(deps, input.actorId, input.projectId);
  const job = await deps.locationReconstructions.findById(input.jobId);
  if (!job || job.projectId !== input.projectId || job.ownerId !== input.actorId) {
    fail("NOT_FOUND", "Location reconstruction not found.");
  }
  if (job.status === "SUCCEEDED" || job.status === "FAILED" || job.status === "EXPIRED") {
    return toLocationReconstructionView(job);
  }
  if (!job.providerJobId) {
    const interrupted = deps.clock.now().getTime() - job.updatedAt.getTime() > SUBMISSION_STALE_MS;
    if (!interrupted) return toLocationReconstructionView(job);
    const failed: LocationReconstructionJob = {
      ...job,
      status: "FAILED",
      failureCode: "SUBMISSION_INTERRUPTED",
      updatedAt: deps.clock.now(),
      completedAt: deps.clock.now(),
    };
    await deps.locationReconstructions.update(failed);
    return toLocationReconstructionView({ ...failed, lockVersion: failed.lockVersion + 1 });
  }
  const providerStatus = await deps.locationReconstructionProvider.status(job.providerJobId);
  if (
    providerStatus === "UPLOADING" ||
    providerStatus === "QUEUED" ||
    providerStatus === "PROCESSING"
  ) {
    return toLocationReconstructionView(job, providerStatus);
  }
  if (providerStatus === "FAILED" || providerStatus === "EXPIRED") {
    const ended: LocationReconstructionJob = {
      ...job,
      status: providerStatus,
      failureCode:
        providerStatus === "EXPIRED" ? "PROVIDER_RESULT_EXPIRED" : "RECONSTRUCTION_FAILED",
      updatedAt: deps.clock.now(),
      completedAt: deps.clock.now(),
    };
    await deps.locationReconstructions.update(ended);
    return toLocationReconstructionView({ ...ended, lockVersion: ended.lockVersion + 1 });
  }

  const brief = await requireDevelopedBrief(deps, input.projectId);
  const existing = brief.planningContext.locationWorkspace;
  const alreadyImported = existing?.environments.find(
    (environment) => environment.reconstructionId === job.id,
  );
  if (alreadyImported) {
    const recovered: LocationReconstructionJob = {
      ...job,
      status: "SUCCEEDED",
      environmentId: alreadyImported.id,
      updatedAt: deps.clock.now(),
      completedAt: deps.clock.now(),
    };
    await deps.locationReconstructions.update(recovered);
    return toLocationReconstructionView({ ...recovered, lockVersion: recovered.lockVersion + 1 });
  }
  if (existing && existing.environments.length >= 3) {
    fail(
      "CONFLICT",
      "This project already has three location versions; Stroman will not delete an original automatically.",
    );
  }
  const result = await deps.locationReconstructionProvider.downloadGlb(job.providerJobId);
  let inferred;
  try {
    inferred = deps.locationGeometryInspector.inferRoomScale(result.bytes, {
      sourceToCanonicalBasis: result.sourceToCanonicalBasis,
      metersPerSourceUnit: result.metersPerSourceUnit,
    });
  } catch (error) {
    if (error instanceof AppError && error.code === "VALIDATION") {
      const failed: LocationReconstructionJob = {
        ...job,
        status: "FAILED",
        failureCode: "RESULT_NOT_ROOM_SCALE",
        updatedAt: deps.clock.now(),
        completedAt: deps.clock.now(),
      };
      await deps.locationReconstructions.update(failed);
      return toLocationReconstructionView({ ...failed, lockVersion: failed.lockVersion + 1 });
    }
    throw error;
  }
  const previousBytes =
    existing?.environments.reduce(
      (total, environment) => total + environment.geometryAsset.byteSize,
      0,
    ) ?? 0;
  if (previousBytes + result.bytes.byteLength > MAX_ENVIRONMENT_BYTES) {
    fail("VALIDATION", "Project spatial assets cannot exceed 500 MB.");
  }
  const contentHash = `sha256:${createHash("sha256").update(result.bytes).digest("hex")}`;
  const imported = await importProjectSource(
    { ...deps, imports: deps.sourceImports, storage: deps.sourceStorage },
    {
      actorId: input.actorId,
      projectId: input.projectId,
      idempotencyKey: `${input.projectId}:location-reconstruction:${job.id}:${contentHash}`,
      sourceName: result.fileName,
      contentType: "model/gltf-binary",
      bytes: result.bytes,
      contentHash,
    },
  );
  if (!imported.ok) throw imported.error;
  if (!imported.value.mediaAssetId) fail("INTERNAL", "The reconstructed room was not persisted.");
  const environmentId = deps.ids.generate("env");
  const workspace = createLocationWorkspace(
    {
      id: environmentId,
      version: (existing?.environment.version ?? 0) + 1,
      name: job.name,
      sourceKind: "PHOTOGRAMMETRY",
      reconstructionId: job.id,
      sourcePhotos: job.photos.map((photo) => ({
        mediaAssetId: photo.mediaAssetId,
        fileName: photo.fileName,
        contentType: photo.contentType,
        contentHash: photo.contentHash,
      })),
      geometryAsset: {
        mediaAssetId: imported.value.mediaAssetId,
        fileName: result.fileName,
        mediaType: "model/gltf-binary",
        byteSize: result.bytes.byteLength,
        contentHash,
      },
      bounds: inferred.bounds,
      scaleMetersPerUnit: inferred.scaleMetersPerUnit,
      sourceToCanonical: inferred.sourceToCanonical,
      scaleConfidence: "ESTIMATED",
      createdAt: deps.clock.now().toISOString(),
    },
    existing,
  );
  const planning = await updateCreativePlanning(deps, {
    actorId: input.actorId,
    projectId: input.projectId,
    stage: "SCOUTING",
    locationWorkspace: workspace,
  });
  if (!planning.ok) throw planning.error;
  const completed: LocationReconstructionJob = {
    ...job,
    status: "SUCCEEDED",
    environmentId,
    failureCode: null,
    updatedAt: deps.clock.now(),
    completedAt: deps.clock.now(),
  };
  await deps.locationReconstructions.update(completed);
  return toLocationReconstructionView({ ...completed, lockVersion: completed.lockVersion + 1 });
}
