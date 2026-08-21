import type { OwnerId } from "@/domain/project";
import { type DomainError, InvalidValueError, validateBoundedText } from "@/domain/shared";
import { err, ok, type Result } from "@/lib/result";

export type PreparedLocationStatus =
  | "DRAFT"
  | "UPLOADING"
  | "PROCESSING"
  | "READY"
  | "NEEDS_ATTENTION"
  | "FAILED";
export type PreparedLocationInputKind = "GLB" | "PHOTOS";

export interface PreparedLocationInput {
  readonly id: string;
  readonly kind: "GEOMETRY" | "PHOTO";
  readonly fileName: string;
  readonly contentType: string;
  readonly byteSize: number;
  readonly contentHash: string;
  /** Server-only; never place this in a filmmaker-facing view. */
  readonly storageKey: string;
  readonly createdAt: Date;
}

export interface PreparedLocation {
  readonly id: string;
  readonly ownerId: OwnerId;
  readonly name: string;
  readonly inputKind: PreparedLocationInputKind;
  readonly status: PreparedLocationStatus;
  /** Serialized SpatialEnvironment once the source evidence is ready. */
  readonly environment: unknown | null;
  readonly failureCode: string | null;
  readonly inputs: readonly PreparedLocationInput[];
  readonly createdAt: Date;
  readonly updatedAt: Date;
  readonly lockVersion: number;
}

export interface PreparedLocationRepository {
  findById(id: string): Promise<PreparedLocation | null>;
  listByOwner(ownerId: OwnerId): Promise<readonly PreparedLocation[]>;
  insert(location: PreparedLocation): Promise<void>;
  update(location: PreparedLocation): Promise<void>;
}

export function createPreparedLocation(input: {
  readonly id: string;
  readonly ownerId: OwnerId;
  readonly name: string;
  readonly inputKind: PreparedLocationInputKind;
  readonly now: Date;
}): Result<PreparedLocation, DomainError> {
  const name = validateBoundedText(input.name, { label: "Location name", max: 160 });
  if (!name.ok) return name;
  if (!input.id) return err(new InvalidValueError("Prepared location id is required"));
  return ok({
    id: input.id,
    ownerId: input.ownerId,
    name: name.value,
    inputKind: input.inputKind,
    status: "DRAFT",
    environment: null,
    failureCode: null,
    inputs: [],
    createdAt: input.now,
    updatedAt: input.now,
    lockVersion: 1,
  });
}
