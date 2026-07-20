import { err, type Result } from "@/lib/result";
import {
  EntityId,
  type EntityRepository,
  InsightId,
  type InsightRepository,
  MemoryId,
  type MemoryRepository,
  RelationshipId,
  type RelationshipRepository,
  SourceId,
  type SourceRepository,
} from "@/domain/memory";
import type { OwnerId } from "@/domain/project";
import type { InvalidValueError } from "@/domain/shared";
import { attempt } from "../shared/attempt";
import { ensureOwner } from "../shared/authorization";
import { NotAuthorizedError, NotFoundError, type RepositoryError } from "../shared/errors";
import { loadOwnedEntity, loadOwnedMemory, loadOwnedSource } from "./record-access";

type DeleteResult = Result<
  void,
  InvalidValueError | NotFoundError | NotAuthorizedError | RepositoryError
>;

export async function deleteEntity(
  deps: { entities: EntityRepository },
  input: { actorId: OwnerId; entityId: string },
): Promise<DeleteResult> {
  const id = EntityId.parse(input.entityId);
  if (!id.ok) return id;
  const owned = await loadOwnedEntity(deps.entities, input.actorId, id.value, "entity.delete");
  if (!owned.ok) return owned;
  return attempt("entity.delete", () => deps.entities.delete(id.value));
}

export async function deleteSource(
  deps: { sources: SourceRepository },
  input: { actorId: OwnerId; sourceId: string },
): Promise<DeleteResult> {
  const id = SourceId.parse(input.sourceId);
  if (!id.ok) return id;
  const owned = await loadOwnedSource(deps.sources, input.actorId, id.value, "source.delete");
  if (!owned.ok) return owned;
  return attempt("source.delete", () => deps.sources.delete(id.value));
}

export async function deleteMemory(
  deps: { memories: MemoryRepository },
  input: { actorId: OwnerId; memoryId: string },
): Promise<DeleteResult> {
  const id = MemoryId.parse(input.memoryId);
  if (!id.ok) return id;
  const owned = await loadOwnedMemory(deps.memories, input.actorId, id.value, "memory.delete");
  if (!owned.ok) return owned;
  return attempt("memory.delete", () => deps.memories.delete(id.value));
}

export async function deleteRelationship(
  deps: { relationships: RelationshipRepository },
  input: { actorId: OwnerId; relationshipId: string },
): Promise<DeleteResult> {
  const id = RelationshipId.parse(input.relationshipId);
  if (!id.ok) return id;
  const loaded = await attempt("relationship.findById", () =>
    deps.relationships.findById(id.value),
  );
  if (!loaded.ok) return loaded;
  if (!loaded.value) return err(new NotFoundError("Relationship", id.value));
  const authorized = ensureOwner(input.actorId, loaded.value.ownerId, "relationship.delete");
  if (!authorized.ok) return authorized;
  return attempt("relationship.delete", () => deps.relationships.delete(id.value));
}

export async function deleteInsight(
  deps: { insights: InsightRepository },
  input: { actorId: OwnerId; insightId: string },
): Promise<DeleteResult> {
  const id = InsightId.parse(input.insightId);
  if (!id.ok) return id;
  const loaded = await attempt("insight.findById", () => deps.insights.findById(id.value));
  if (!loaded.ok) return loaded;
  if (!loaded.value) return err(new NotFoundError("Insight", id.value));
  const authorized = ensureOwner(input.actorId, loaded.value.ownerId, "insight.delete");
  if (!authorized.ok) return authorized;
  return attempt("insight.delete", () => deps.insights.delete(id.value));
}
