import { err, ok, type Result } from "@/lib/result";
import type { OwnerId } from "@/domain/project";
import { type DomainError, InvalidValueError, validateBoundedText } from "@/domain/shared";
import type { EntityId, RelationshipId } from "./ids";

/** A directed, typed link between two entities (e.g. "founder_of", "owns"). */
export interface Relationship {
  readonly id: RelationshipId;
  readonly ownerId: OwnerId;
  readonly fromEntityId: EntityId;
  readonly toEntityId: EntityId;
  readonly relationType: string;
  readonly createdAt: Date;
}

export interface CreateRelationshipInput {
  readonly id: RelationshipId;
  readonly ownerId: OwnerId;
  readonly fromEntityId: EntityId;
  readonly toEntityId: EntityId;
  readonly relationType: string;
  readonly now: Date;
}

export function createRelationship(
  input: CreateRelationshipInput,
): Result<Relationship, DomainError> {
  if (input.fromEntityId === input.toEntityId) {
    return err(new InvalidValueError("A relationship must connect two different entities"));
  }
  const relationType = validateBoundedText(input.relationType, {
    label: "Relationship type",
    max: 60,
  });
  if (!relationType.ok) return relationType;
  return ok({
    id: input.id,
    ownerId: input.ownerId,
    fromEntityId: input.fromEntityId,
    toEntityId: input.toEntityId,
    relationType: relationType.value,
    createdAt: input.now,
  });
}
