import { createHash } from "node:crypto";
import {
  createPreparedLocation,
  type PreparedLocationReconstructionJob,
  type PreparedLocationReconstructionRepository,
  type PreparedLocationRepository,
} from "@/domain/location-library";
import type { Clock, IdGenerator } from "@/application/shared";
import type { OwnerId } from "@/domain/project";
import type { SourceStorage } from "@/domain/source-import";
import { AppError } from "@/lib/errors";
import type { LocationGeometryInspector } from "@/domain/creative";

interface Deps {
  readonly preparedLocations: PreparedLocationRepository;
  readonly preparedLocationReconstructions: PreparedLocationReconstructionRepository;
  readonly ids: IdGenerator;
  readonly clock: Clock;
  readonly sourceStorage: SourceStorage;
  readonly locationGeometryInspector: LocationGeometryInspector;
}

const PULL_WORKER_KEY = "stroman-pull-v1";

async function loadOwnedPhotoLocation(deps: Deps, actorId: OwnerId, locationId: string) {
  const location = await deps.preparedLocations.findById(locationId);
  if (!location) throw new AppError("NOT_FOUND", "Location not found.");
  if (location.ownerId !== actorId)
    throw new AppError("FORBIDDEN", "You cannot change this location.");
  if (location.inputKind !== "PHOTOS")
    throw new AppError("CONFLICT", "This location uses a 3D scan.");
  return location;
}

/** Queue preserved room photos for the local Mac worker without ever re-uploading evidence. */
export async function startPreparedLocationReconstruction(
  deps: Deps,
  input: {
    readonly actorId: OwnerId;
    readonly locationId: string;
  },
) {
  const location = await loadOwnedPhotoLocation(deps, input.actorId, input.locationId);
  const photos = location.inputs.filter((item) => item.kind === "PHOTO");
  if (photos.length < 20 || photos.length > 40)
    throw new AppError(
      "VALIDATION",
      "This room needs 20 to 40 preserved photos before it can be built.",
    );
  const latest = await deps.preparedLocationReconstructions.findLatestByLocation(location.id);
  if (latest && ["SUBMITTING", "PROCESSING"].includes(latest.status)) {
    if (location.status !== "PROCESSING")
      await deps.preparedLocations.update({
        ...location,
        status: "PROCESSING",
        failureCode: null,
        updatedAt: deps.clock.now(),
      });
    return latest;
  }
  const now = deps.clock.now();
  const job: PreparedLocationReconstructionJob = {
    id: deps.ids.generate("locrec"),
    ownerId: location.ownerId,
    preparedLocationId: location.id,
    providerKey: PULL_WORKER_KEY,
    status: "PROCESSING",
    failureCode: null,
    workerLeaseId: null,
    workerLeaseExpiresAt: null,
    createdAt: now,
    updatedAt: now,
    completedAt: null,
    lockVersion: 1,
  };
  await deps.preparedLocationReconstructions.insert(job);
  await deps.preparedLocations.update({
    ...location,
    status: "PROCESSING",
    failureCode: null,
    updatedAt: now,
  });
  return job;
}

/** Final worker hand-off: persist the reconstructed geometry and only then mark the room ready. */
export async function completePreparedLocationReconstruction(
  deps: Deps,
  input: {
    readonly job: PreparedLocationReconstructionJob;
    readonly bytes: Uint8Array;
    readonly fileName: string;
  },
) {
  const job = input.job;
  const location = await deps.preparedLocations.findById(job.preparedLocationId);
  if (!location || location.ownerId !== job.ownerId)
    throw new AppError("NOT_FOUND", "Prepared room no longer exists.");
  // A response can be lost after the location commit but before the job commit.
  // Completing the same signed lease again must settle that durable state, not
  // create another geometry input or send the room back through the worker.
  const completedEnvironment = location.environment as {
    reconstructionId?: unknown;
    contentHash?: unknown;
  } | null;
  if (
    location.status === "READY" &&
    completedEnvironment?.reconstructionId === job.id &&
    typeof completedEnvironment.contentHash === "string"
  ) {
    const now = deps.clock.now();
    await deps.preparedLocationReconstructions.update({
      ...job,
      status: "SUCCEEDED",
      failureCode: null,
      workerLeaseId: null,
      workerLeaseExpiresAt: null,
      completedAt: now,
      updatedAt: now,
    });
    return location;
  }
  let geometry;
  try {
    geometry = deps.locationGeometryInspector.inferRoomScale(input.bytes, {
      sourceToCanonicalBasis: [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1],
      metersPerSourceUnit: null,
    });
  } catch {
    throw new AppError("VALIDATION", "The Mac worker returned unusable room geometry.");
  }
  const contentHash = `sha256:${createHash("sha256").update(input.bytes).digest("hex")}`;
  const existing = location.inputs.find(
    (item) => item.kind === "GEOMETRY" && item.contentHash === contentHash,
  );
  if (!existing) {
    const storageKey = `${location.ownerId}/locations/${location.id}/${contentHash}`;
    const lease = await deps.sourceStorage.put(storageKey, input.bytes);
    try {
      await deps.preparedLocations.addInput(location.id, {
        id: deps.ids.generate("locin"),
        kind: "GEOMETRY",
        fileName: input.fileName,
        contentType: "model/gltf-binary",
        byteSize: input.bytes.byteLength,
        contentHash,
        storageKey,
        createdAt: deps.clock.now(),
      });
      await deps.sourceStorage.retain(storageKey, lease.leaseId);
    } catch (error) {
      await deps.sourceStorage.discard(storageKey, lease.leaseId).catch(() => undefined);
      throw error;
    }
  }
  const now = deps.clock.now();
  await deps.preparedLocations.update({
    ...location,
    status: "READY",
    failureCode: null,
    updatedAt: now,
    environment: {
      source: "APPLE_PHOTOGRAMMETRY",
      reconstructionId: job.id,
      contentHash,
      inputId: `${location.id}:${contentHash}`,
      bounds: geometry.bounds,
      scaleMetersPerUnit: geometry.scaleMetersPerUnit,
      scaleConfidence: "ESTIMATED",
      sourceToCanonical: geometry.sourceToCanonical,
    },
  });
  await deps.preparedLocationReconstructions.update({
    ...job,
    status: "SUCCEEDED",
    failureCode: null,
    workerLeaseId: null,
    workerLeaseExpiresAt: null,
    completedAt: now,
    updatedAt: now,
  });
  return (await deps.preparedLocations.findById(location.id)) ?? location;
}

/**
 * A terminal result from the Mac is durable orchestration state, not a reason
 * to keep reclaiming the same room forever. Source photos deliberately remain
 * attached to the location so a filmmaker can retry without uploading again.
 */
export async function failPreparedLocationReconstruction(
  deps: Deps,
  input: {
    readonly job: PreparedLocationReconstructionJob;
    readonly failureCode: "LOCAL_RECONSTRUCTION_FAILED" | "EVIDENCE_INTEGRITY_FAILED";
  },
) {
  const location = await deps.preparedLocations.findById(input.job.preparedLocationId);
  if (!location || location.ownerId !== input.job.ownerId)
    throw new AppError("NOT_FOUND", "Prepared room no longer exists.");
  const now = deps.clock.now();
  await deps.preparedLocationReconstructions.update({
    ...input.job,
    status: "FAILED",
    failureCode: input.failureCode,
    workerLeaseId: null,
    workerLeaseExpiresAt: null,
    completedAt: now,
    updatedAt: now,
  });
  await deps.preparedLocations.update({
    ...location,
    status: "FAILED",
    failureCode: input.failureCode,
    updatedAt: now,
  });
  return (await deps.preparedLocations.findById(location.id)) ?? location;
}

export async function uploadPreparedLocationGlb(
  deps: Deps,
  input: {
    readonly actorId: OwnerId;
    readonly locationId: string;
    readonly fileName: string;
    readonly bytes: Uint8Array;
  },
) {
  const location = await deps.preparedLocations.findById(input.locationId);
  if (!location) throw new AppError("NOT_FOUND", "Location not found.");
  if (location.ownerId !== input.actorId)
    throw new AppError("FORBIDDEN", "You cannot change this location.");
  if (location.inputKind !== "GLB")
    throw new AppError("CONFLICT", "This location is being built from photos.");
  if (
    !input.fileName.toLowerCase().endsWith(".glb") ||
    input.bytes.byteLength === 0 ||
    input.bytes.byteLength > 100 * 1024 * 1024
  )
    throw new AppError("VALIDATION", "Upload one GLB room file no larger than 100 MB.");
  const contentHash = `sha256:${createHash("sha256").update(input.bytes).digest("hex")}`;
  let geometry;
  try {
    geometry = deps.locationGeometryInspector.inferRoomScale(input.bytes, {
      sourceToCanonicalBasis: [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1],
      metersPerSourceUnit: null,
    });
  } catch {
    throw new AppError("VALIDATION", "That GLB does not contain a usable room geometry.");
  }
  const storageKey = `${input.actorId}/locations/${location.id}/${contentHash}`;
  const lease = await deps.sourceStorage.put(storageKey, input.bytes);
  try {
    await deps.preparedLocations.addInput(location.id, {
      id: deps.ids.generate("locin"),
      kind: "GEOMETRY",
      fileName: input.fileName,
      contentType: "model/gltf-binary",
      byteSize: input.bytes.byteLength,
      contentHash,
      storageKey,
      createdAt: deps.clock.now(),
    });
    await deps.sourceStorage.retain(storageKey, lease.leaseId);
    const updated = {
      ...location,
      status: "READY" as const,
      environment: {
        source: "GLB",
        inputId: `${location.id}:${contentHash}`,
        bounds: geometry.bounds,
        scaleMetersPerUnit: geometry.scaleMetersPerUnit,
        scaleConfidence: "ESTIMATED",
        sourceToCanonical: geometry.sourceToCanonical,
      },
      failureCode: null,
      updatedAt: deps.clock.now(),
    };
    await deps.preparedLocations.update(updated);
    return updated;
  } catch (error) {
    await deps.sourceStorage.discard(storageKey, lease.leaseId).catch(() => undefined);
    throw error;
  }
}

export async function uploadPreparedLocationPhotos(
  deps: Deps,
  input: {
    readonly actorId: OwnerId;
    readonly locationId: string;
    readonly files: readonly { fileName: string; contentType: string; bytes: Uint8Array }[];
  },
) {
  const location = await deps.preparedLocations.findById(input.locationId);
  if (!location) throw new AppError("NOT_FOUND", "Location not found.");
  if (location.ownerId !== input.actorId)
    throw new AppError("FORBIDDEN", "You cannot change this location.");
  if (location.inputKind !== "PHOTOS")
    throw new AppError("CONFLICT", "This location uses a 3D scan.");
  if (input.files.length < 20 || input.files.length > 40)
    throw new AppError("VALIDATION", "Choose 20 to 40 overlapping JPEG or PNG room photos.");
  if (location.inputs.length > 0)
    throw new AppError(
      "CONFLICT",
      "This room already has preserved photos. Build it again from this room, or create a new location to use different photos.",
    );
  const preparedFiles = input.files.map((file) => {
    if (
      !new Set(["image/jpeg", "image/png"]).has(file.contentType) ||
      !file.bytes.byteLength ||
      file.bytes.byteLength > 8 * 1024 * 1024
    )
      throw new AppError(
        "VALIDATION",
        "Each room photo must be JPEG or PNG and no larger than 8 MB.",
      );
    return {
      ...file,
      contentHash: `sha256:${createHash("sha256").update(file.bytes).digest("hex")}`,
    };
  });
  if (new Set(preparedFiles.map((file) => file.contentHash)).size !== preparedFiles.length)
    throw new AppError("VALIDATION", "Each selected room photo must be unique.");
  for (const file of preparedFiles) {
    const storageKey = `${input.actorId}/locations/${location.id}/${file.contentHash}`;
    const lease = await deps.sourceStorage.put(storageKey, file.bytes);
    try {
      await deps.preparedLocations.addInput(location.id, {
        id: deps.ids.generate("locin"),
        kind: "PHOTO",
        fileName: file.fileName,
        contentType: file.contentType,
        byteSize: file.bytes.byteLength,
        contentHash: file.contentHash,
        storageKey,
        createdAt: deps.clock.now(),
      });
      await deps.sourceStorage.retain(storageKey, lease.leaseId);
    } catch (error) {
      await deps.sourceStorage.discard(storageKey, lease.leaseId).catch(() => undefined);
      throw error;
    }
  }
  const updated = {
    ...location,
    status: "NEEDS_ATTENTION" as const,
    failureCode: null,
    updatedAt: deps.clock.now(),
  };
  await deps.preparedLocations.update(updated);
  return updated;
}

export async function createPreparedLocationForOwner(
  deps: Deps,
  input: { readonly actorId: OwnerId; readonly name: string; readonly inputKind: "GLB" | "PHOTOS" },
) {
  const created = createPreparedLocation({
    id: deps.ids.generate("loc"),
    ownerId: input.actorId,
    name: input.name,
    inputKind: input.inputKind,
    now: deps.clock.now(),
  });
  if (!created.ok) throw created.error;
  await deps.preparedLocations.insert(created.value);
  return created.value;
}

export async function listPreparedLocationsForOwner(deps: Deps, actorId: OwnerId) {
  return deps.preparedLocations.listByOwner(actorId);
}

/** Filmmaker-facing shape: never expose internal storage keys or raw evidence metadata. */
export function preparedLocationView(
  location: Awaited<ReturnType<typeof listPreparedLocationsForOwner>>[number],
) {
  return {
    id: location.id,
    name: location.name,
    inputKind: location.inputKind,
    status: location.status,
    inputCount: location.inputs.length,
    hasEnvironment: location.environment !== null,
    failureCode: location.failureCode,
    updatedAt: location.updatedAt.toISOString(),
  };
}
