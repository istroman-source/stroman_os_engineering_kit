import { createHash } from "node:crypto";
import {
  createPreparedLocation,
  assessLocationGeometry,
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
  try {
    await deps.preparedLocationReconstructions.insert(job);
  } catch (error) {
    // PostgreSQL's partial unique index allows only one active build per room.
    // When two requests race, the winning job is the idempotent result for both.
    if (!(error instanceof AppError) || error.code !== "CONFLICT") throw error;
    const winner = await deps.preparedLocationReconstructions.findLatestByLocation(location.id);
    if (
      !winner ||
      winner.ownerId !== location.ownerId ||
      !["SUBMITTING", "PROCESSING"].includes(winner.status)
    ) {
      throw error;
    }
    return winner;
  }
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
  const shootBrief = assessLocationGeometry(geometry.bounds, geometry.scaleMetersPerUnit, "PHOTOS");
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
    status: shootBrief.usability === "SHOOTABLE_ESTIMATE" ? "READY" : "NEEDS_ATTENTION",
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
      shootBrief,
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
  const shootBrief = assessLocationGeometry(geometry.bounds, geometry.scaleMetersPerUnit, "GLB");
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
      status:
        shootBrief.usability === "SHOOTABLE_ESTIMATE"
          ? ("READY" as const)
          : ("NEEDS_ATTENTION" as const),
      environment: {
        source: "GLB",
        inputId: `${location.id}:${contentHash}`,
        bounds: geometry.bounds,
        scaleMetersPerUnit: geometry.scaleMetersPerUnit,
        scaleConfidence: "ESTIMATED",
        sourceToCanonical: geometry.sourceToCanonical,
        shootBrief,
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
    readonly files: readonly {
      readonly fileName: string;
      readonly contentType: string;
      readonly byteSize?: number;
      readonly bytes?: Uint8Array;
      readonly readBytes?: () => Promise<Uint8Array>;
    }[];
  },
) {
  const location = await deps.preparedLocations.findById(input.locationId);
  if (!location) throw new AppError("NOT_FOUND", "Location not found.");
  if (location.ownerId !== input.actorId)
    throw new AppError("FORBIDDEN", "You cannot change this location.");
  if (location.inputKind !== "PHOTOS")
    throw new AppError("CONFLICT", "This location uses a 3D scan.");
  if (!input.files.length || input.files.length > 40)
    throw new AppError("VALIDATION", "Add between 1 and 40 JPEG or PNG room photos.");
  const readFileBytes = async (file: (typeof input.files)[number]) => {
    const bytes = file.bytes ?? (await file.readBytes?.());
    if (!bytes) throw new AppError("VALIDATION", "A selected room photo could not be read.");
    return bytes;
  };
  const preparedFiles: {
    readonly file: (typeof input.files)[number];
    readonly contentHash: string;
    readonly byteSize: number;
  }[] = [];
  const selectedHashes = new Set<string>();
  // Read one photo at a time. Browser multipart parsing may retain the source
  // Files, but Stroman never creates forty additional ArrayBuffer copies at once.
  for (const file of input.files) {
    if (
      !new Set(["image/jpeg", "image/png"]).has(file.contentType) ||
      (file.byteSize !== undefined && (!file.byteSize || file.byteSize > 8 * 1024 * 1024))
    )
      throw new AppError(
        "VALIDATION",
        "Each room photo must be JPEG or PNG and no larger than 8 MB.",
      );
    const bytes = await readFileBytes(file);
    if (
      !bytes.byteLength ||
      bytes.byteLength > 8 * 1024 * 1024 ||
      (file.byteSize !== undefined && file.byteSize !== bytes.byteLength)
    ) {
      throw new AppError(
        "VALIDATION",
        "Each room photo must be JPEG or PNG and no larger than 8 MB.",
      );
    }
    const contentHash = `sha256:${createHash("sha256").update(bytes).digest("hex")}`;
    if (selectedHashes.has(contentHash))
      throw new AppError("VALIDATION", "Each selected room photo must be unique.");
    selectedHashes.add(contentHash);
    preparedFiles.push({ file, contentHash, byteSize: bytes.byteLength });
  }
  const existingPhotos = location.inputs.filter((item) => item.kind === "PHOTO");
  const persistedHashes = new Set(existingPhotos.map((item) => item.contentHash));
  const newPhotoCount = [...selectedHashes].filter((hash) => !persistedHashes.has(hash)).length;
  if (existingPhotos.length + newPhotoCount > 40)
    throw new AppError("VALIDATION", "A room can contain at most 40 original photos.");
  if (!["DRAFT", "NEEDS_ATTENTION", "UPLOADING"].includes(location.status) && newPhotoCount > 0) {
    throw new AppError(
      "CONFLICT",
      "This room is already building or complete. Prepare a new version to add different photos.",
    );
  }
  for (const prepared of preparedFiles) {
    if (persistedHashes.has(prepared.contentHash)) continue;
    const beforeInsert = await deps.preparedLocations.findById(location.id);
    if (!beforeInsert || beforeInsert.ownerId !== input.actorId)
      throw new AppError("NOT_FOUND", "Location not found.");
    const currentPhotos = beforeInsert.inputs.filter((item) => item.kind === "PHOTO");
    if (currentPhotos.length >= 40)
      throw new AppError("VALIDATION", "A room can contain at most 40 original photos.");
    if (!["DRAFT", "NEEDS_ATTENTION", "UPLOADING"].includes(beforeInsert.status))
      throw new AppError(
        "CONFLICT",
        "This room is already building or complete. Prepare a new version to add different photos.",
      );
    const bytes = await readFileBytes(prepared.file);
    const verifiedHash = `sha256:${createHash("sha256").update(bytes).digest("hex")}`;
    if (bytes.byteLength !== prepared.byteSize || verifiedHash !== prepared.contentHash) {
      throw new AppError("VALIDATION", "A selected room photo changed while it was uploading.");
    }
    const storageKey = `${input.actorId}/locations/${location.id}/${prepared.contentHash}`;
    const lease = await deps.sourceStorage.put(storageKey, bytes);
    let inserted = false;
    try {
      await deps.preparedLocations.addInput(location.id, {
        id: deps.ids.generate("locin"),
        kind: "PHOTO",
        fileName: prepared.file.fileName,
        contentType: prepared.file.contentType,
        byteSize: prepared.byteSize,
        contentHash: prepared.contentHash,
        storageKey,
        createdAt: deps.clock.now(),
      });
      inserted = true;
      await deps.sourceStorage.retain(storageKey, lease.leaseId);
    } catch (error) {
      if (inserted) {
        // The evidence row now durably references this object. Never delete it
        // merely because lease finalization reported an ambiguous failure.
        await deps.sourceStorage.retain(storageKey, lease.leaseId).catch(() => undefined);
        throw error;
      }
      await deps.sourceStorage.discard(storageKey, lease.leaseId).catch(() => undefined);
      // A concurrent/replayed request may have won the immutable hash insert.
      // Treat that as success only after verifying the durable row ourselves.
      const current = await deps.preparedLocations.findById(location.id);
      if (
        error instanceof AppError &&
        error.code === "CONFLICT" &&
        current?.ownerId === input.actorId &&
        current.inputs.some(
          (item) => item.kind === "PHOTO" && item.contentHash === prepared.contentHash,
        )
      ) {
        persistedHashes.add(prepared.contentHash);
        continue;
      }
      throw error;
    }
    persistedHashes.add(prepared.contentHash);
  }
  let current = await deps.preparedLocations.findById(location.id);
  if (!current || current.ownerId !== input.actorId)
    throw new AppError("NOT_FOUND", "Location not found.");
  const durableHashes = new Set(
    current.inputs.filter((item) => item.kind === "PHOTO").map((item) => item.contentHash),
  );
  if ([...selectedHashes].some((hash) => !durableHashes.has(hash))) {
    throw new AppError(
      "CONFLICT",
      "This room photo is still being preserved. Try again in a moment.",
    );
  }
  if (durableHashes.size < 20 || !["DRAFT", "UPLOADING"].includes(current.status)) return current;
  const updated = {
    ...current,
    status: "NEEDS_ATTENTION" as const,
    failureCode: null,
    updatedAt: deps.clock.now(),
  };
  try {
    await deps.preparedLocations.update(updated);
  } catch (error) {
    if (!(error instanceof AppError) || error.code !== "CONFLICT") throw error;
    current = await deps.preparedLocations.findById(location.id);
    if (!current || current.ownerId !== input.actorId) throw error;
    if (current.inputs.filter((item) => item.kind === "PHOTO").length < 20) return current;
    if (!["DRAFT", "UPLOADING"].includes(current.status)) return current;
    const retried = { ...current, status: "NEEDS_ATTENTION" as const, updatedAt: deps.clock.now() };
    await deps.preparedLocations.update(retried);
    return (await deps.preparedLocations.findById(location.id)) ?? retried;
  }
  return (await deps.preparedLocations.findById(location.id)) ?? updated;
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

/**
 * Load one reusable room without revealing whether another owner has a room at
 * the same opaque id. Detail and geometry routes both use this boundary.
 */
export async function getPreparedLocationForOwner(
  deps: Deps,
  input: { readonly actorId: OwnerId; readonly locationId: string },
) {
  const location = await deps.preparedLocations.findById(input.locationId);
  if (!location || location.ownerId !== input.actorId) {
    throw new AppError("NOT_FOUND", "Location not found.");
  }
  return location;
}

/** Rename the filmmaker-facing room while preserving its evidence and build. */
export async function renamePreparedLocationForOwner(
  deps: Deps,
  input: { readonly actorId: OwnerId; readonly locationId: string; readonly name: string },
) {
  const location = await getPreparedLocationForOwner(deps, input);
  const name = input.name.trim();
  if (!name || name.length > 160) {
    throw new AppError("VALIDATION", "Location name must be between 1 and 160 characters.");
  }
  if (name === location.name) return location;
  const updated = { ...location, name, updatedAt: deps.clock.now() };
  await deps.preparedLocations.update(updated);
  return (await deps.preparedLocations.findById(location.id)) ?? updated;
}

/**
 * Return the exact geometry selected by the durable environment. Storage keys
 * remain server-only and never enter a JSON response.
 */
export async function getPreparedLocationGeometryForOwner(
  deps: Deps,
  input: { readonly actorId: OwnerId; readonly locationId: string },
) {
  const location = await getPreparedLocationForOwner(deps, input);
  // A rebuild keeps its last-known-good environment attached while the Mac worker
  // processes the replacement. That geometry remains private to the owner and is
  // safe to view until a successful replacement atomically takes its place.
  if (location.environment === null) {
    throw new AppError("CONFLICT", "This room is not ready to open yet.");
  }
  const environment = location.environment as { contentHash?: unknown; inputId?: unknown };
  const referencedHash =
    typeof environment.contentHash === "string"
      ? environment.contentHash
      : typeof environment.inputId === "string"
        ? environment.inputId.slice(environment.inputId.indexOf(":") + 1)
        : null;
  if (!referencedHash) throw new AppError("NOT_FOUND", "Location geometry not found.");
  const geometry = location.inputs.find(
    (item) => item.kind === "GEOMETRY" && item.contentHash === referencedHash,
  );
  if (!geometry) throw new AppError("NOT_FOUND", "Location geometry not found.");
  return {
    bytes: await deps.sourceStorage.get(geometry.storageKey),
    contentHash: geometry.contentHash,
  };
}

type PointView = { readonly x: number; readonly y: number; readonly z: number };

function pointView(value: unknown): PointView | null {
  if (!value || typeof value !== "object") return null;
  const point = value as Record<string, unknown>;
  if (
    ![point.x, point.y, point.z].every((item) => typeof item === "number" && Number.isFinite(item))
  )
    return null;
  return { x: point.x as number, y: point.y as number, z: point.z as number };
}

function environmentView(value: unknown) {
  if (!value || typeof value !== "object") return null;
  const environment = value as Record<string, unknown>;
  const bounds = environment.bounds as Record<string, unknown> | undefined;
  const min = pointView(bounds?.min);
  const max = pointView(bounds?.max);
  const sourceToCanonical = environment.sourceToCanonical;
  const scaleMetersPerUnit = environment.scaleMetersPerUnit;
  if (
    !min ||
    !max ||
    !Array.isArray(sourceToCanonical) ||
    sourceToCanonical.length !== 16 ||
    !sourceToCanonical.every((item) => typeof item === "number" && Number.isFinite(item)) ||
    typeof scaleMetersPerUnit !== "number" ||
    !Number.isFinite(scaleMetersPerUnit)
  ) {
    return null;
  }
  return {
    source: environment.source === "APPLE_PHOTOGRAMMETRY" ? "PHOTOS" : "GLB",
    bounds: { min, max },
    sourceToCanonical: sourceToCanonical as readonly number[],
    scaleMetersPerUnit,
    // Current GLB and photo workflows infer scale rather than claim a surveyed measurement.
    scaleConfidence: "ESTIMATED" as const,
    shootBrief:
      environment.shootBrief ??
      assessLocationGeometry(
        { min, max },
        scaleMetersPerUnit,
        environment.source === "APPLE_PHOTOGRAMMETRY" ? "PHOTOS" : "GLB",
      ),
  };
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
    failureCode: location.failureCode ? "ROOM_BUILD_FAILED" : null,
    createdAt: location.createdAt.toISOString(),
    updatedAt: location.updatedAt.toISOString(),
  };
}

/** Detail shape for the room page; raw evidence metadata is deliberately absent. */
export function preparedLocationDetailView(
  location: Awaited<ReturnType<typeof getPreparedLocationForOwner>>,
) {
  const base = preparedLocationView(location);
  return {
    ...base,
    photoCount: location.inputs.filter((item) => item.kind === "PHOTO").length,
    environment: environmentView(location.environment),
  };
}
