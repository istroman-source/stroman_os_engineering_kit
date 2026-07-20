import { ok, type Result } from "@/lib/result";
import type { OwnerId } from "@/domain/project";
import { type DomainError, validateBoundedText } from "@/domain/shared";
import type { EntityId } from "./ids";

/** A node in the creative knowledge graph (a person, organization, place, concept…). */
export interface Entity {
  readonly id: EntityId;
  readonly ownerId: OwnerId;
  readonly name: string;
  readonly kind: string;
  readonly createdAt: Date;
}

export interface CreateEntityInput {
  readonly id: EntityId;
  readonly ownerId: OwnerId;
  readonly name: string;
  readonly kind: string;
  readonly now: Date;
}

export function createEntity(input: CreateEntityInput): Result<Entity, DomainError> {
  const name = validateBoundedText(input.name, { label: "Entity name", max: 200 });
  if (!name.ok) return name;
  const kind = validateBoundedText(input.kind, { label: "Entity kind", max: 60 });
  if (!kind.ok) return kind;
  return ok({
    id: input.id,
    ownerId: input.ownerId,
    name: name.value,
    kind: kind.value,
    createdAt: input.now,
  });
}
