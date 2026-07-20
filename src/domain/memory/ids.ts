import { type Brand, defineId } from "@/domain/shared";

/** Identifiers for the creative memory graph. */
export type EntityId = Brand<string, "EntityId">;
export const EntityId = defineId<"EntityId">("EntityId", "ent");

export type SourceId = Brand<string, "SourceId">;
export const SourceId = defineId<"SourceId">("SourceId", "src");

export type MemoryId = Brand<string, "MemoryId">;
export const MemoryId = defineId<"MemoryId">("MemoryId", "mem");

export type RelationshipId = Brand<string, "RelationshipId">;
export const RelationshipId = defineId<"RelationshipId">("RelationshipId", "rel");

export type InsightId = Brand<string, "InsightId">;
export const InsightId = defineId<"InsightId">("InsightId", "ins");
