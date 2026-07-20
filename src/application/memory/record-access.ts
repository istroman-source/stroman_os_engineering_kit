import { err, ok, type Result } from "@/lib/result";
import type {
  Entity,
  EntityId,
  EntityRepository,
  MemoryId,
  MemoryRecord,
  MemoryRepository,
  Source,
  SourceId,
  SourceRepository,
} from "@/domain/memory";
import type { OwnerId } from "@/domain/project";
import { attempt } from "../shared/attempt";
import { ensureOwner } from "../shared/authorization";
import { NotAuthorizedError, NotFoundError, type RepositoryError } from "../shared/errors";

type OwnedResult<T> = Result<T, NotFoundError | NotAuthorizedError | RepositoryError>;

export async function loadOwnedEntity(
  repo: EntityRepository,
  actorId: OwnerId,
  id: EntityId,
  action: string,
): Promise<OwnedResult<Entity>> {
  const loaded = await attempt("entity.findById", () => repo.findById(id));
  if (!loaded.ok) return loaded;
  if (!loaded.value) return err(new NotFoundError("Entity", id));
  const authorized = ensureOwner(actorId, loaded.value.ownerId, action);
  if (!authorized.ok) return authorized;
  return ok(loaded.value);
}

export async function loadOwnedSource(
  repo: SourceRepository,
  actorId: OwnerId,
  id: SourceId,
  action: string,
): Promise<OwnedResult<Source>> {
  const loaded = await attempt("source.findById", () => repo.findById(id));
  if (!loaded.ok) return loaded;
  if (!loaded.value) return err(new NotFoundError("Source", id));
  const authorized = ensureOwner(actorId, loaded.value.ownerId, action);
  if (!authorized.ok) return authorized;
  return ok(loaded.value);
}

export async function loadOwnedMemory(
  repo: MemoryRepository,
  actorId: OwnerId,
  id: MemoryId,
  action: string,
): Promise<OwnedResult<MemoryRecord>> {
  const loaded = await attempt("memory.findById", () => repo.findById(id));
  if (!loaded.ok) return loaded;
  if (!loaded.value) return err(new NotFoundError("Memory", id));
  const authorized = ensureOwner(actorId, loaded.value.ownerId, action);
  if (!authorized.ok) return authorized;
  return ok(loaded.value);
}
