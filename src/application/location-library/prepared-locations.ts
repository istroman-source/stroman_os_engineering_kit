import { createHash } from "node:crypto";
import { createPreparedLocation, type PreparedLocationRepository } from "@/domain/location-library";
import type { Clock, IdGenerator } from "@/application/shared";
import type { OwnerId } from "@/domain/project";
import type { SourceStorage } from "@/domain/source-import";
import { AppError } from "@/lib/errors";
import type { LocationGeometryInspector } from "@/domain/creative";

interface Deps {
  readonly preparedLocations: PreparedLocationRepository;
  readonly ids: IdGenerator;
  readonly clock: Clock;
  readonly sourceStorage: SourceStorage;
  readonly locationGeometryInspector: LocationGeometryInspector;
}

export async function uploadPreparedLocationGlb(deps: Deps, input: {
  readonly actorId: OwnerId; readonly locationId: string; readonly fileName: string; readonly bytes: Uint8Array;
}) {
  const location = await deps.preparedLocations.findById(input.locationId);
  if (!location) throw new AppError("NOT_FOUND", "Location not found.");
  if (location.ownerId !== input.actorId) throw new AppError("FORBIDDEN", "You cannot change this location.");
  if (location.inputKind !== "GLB") throw new AppError("CONFLICT", "This location is being built from photos.");
  if (!input.fileName.toLowerCase().endsWith(".glb") || input.bytes.byteLength === 0 || input.bytes.byteLength > 100 * 1024 * 1024) throw new AppError("VALIDATION", "Upload one GLB room file no larger than 100 MB.");
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
      id: deps.ids.generate("locin"), kind: "GEOMETRY", fileName: input.fileName, contentType: "model/gltf-binary",
      byteSize: input.bytes.byteLength, contentHash, storageKey, createdAt: deps.clock.now(),
    });
    await deps.sourceStorage.retain(storageKey, lease.leaseId);
    const updated = {
      ...location,
      status: "READY" as const,
      environment: {
        source: "GLB", inputId: `${location.id}:${contentHash}`, bounds: geometry.bounds,
        scaleMetersPerUnit: geometry.scaleMetersPerUnit, scaleConfidence: "ESTIMATED",
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

export async function uploadPreparedLocationPhotos(deps: Deps, input: {
  readonly actorId: OwnerId; readonly locationId: string;
  readonly files: readonly { fileName: string; contentType: string; bytes: Uint8Array }[];
}) {
  const location = await deps.preparedLocations.findById(input.locationId);
  if (!location) throw new AppError("NOT_FOUND", "Location not found.");
  if (location.ownerId !== input.actorId) throw new AppError("FORBIDDEN", "You cannot change this location.");
  if (location.inputKind !== "PHOTOS") throw new AppError("CONFLICT", "This location uses a 3D scan.");
  if (input.files.length < 20 || input.files.length > 40) throw new AppError("VALIDATION", "Choose 20 to 40 overlapping JPEG or PNG room photos.");
  if (location.inputs.length > 0) throw new AppError("CONFLICT", "This room already has preserved photos. Replace them from Room details if needed.");
  for (const file of input.files) {
    if (!new Set(["image/jpeg", "image/png"]).has(file.contentType) || !file.bytes.byteLength || file.bytes.byteLength > 8 * 1024 * 1024) throw new AppError("VALIDATION", "Each room photo must be JPEG or PNG and no larger than 8 MB.");
    const contentHash = `sha256:${createHash("sha256").update(file.bytes).digest("hex")}`;
    const storageKey = `${input.actorId}/locations/${location.id}/${contentHash}`;
    const lease = await deps.sourceStorage.put(storageKey, file.bytes);
    try {
      await deps.preparedLocations.addInput(location.id, { id: deps.ids.generate("locin"), kind: "PHOTO", fileName: file.fileName, contentType: file.contentType, byteSize: file.bytes.byteLength, contentHash, storageKey, createdAt: deps.clock.now() });
      await deps.sourceStorage.retain(storageKey, lease.leaseId);
    } catch (error) { await deps.sourceStorage.discard(storageKey, lease.leaseId).catch(() => undefined); throw error; }
  }
  const updated = { ...location, status: "NEEDS_ATTENTION" as const, failureCode: null, updatedAt: deps.clock.now() };
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
export function preparedLocationView(location: Awaited<ReturnType<typeof listPreparedLocationsForOwner>>[number]) {
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
