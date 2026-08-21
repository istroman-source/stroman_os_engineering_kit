import { createPreparedLocation, type PreparedLocationRepository } from "@/domain/location-library";
import type { Clock, IdGenerator } from "@/application/shared";
import type { OwnerId } from "@/domain/project";

interface Deps {
  readonly preparedLocations: PreparedLocationRepository;
  readonly ids: IdGenerator;
  readonly clock: Clock;
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
