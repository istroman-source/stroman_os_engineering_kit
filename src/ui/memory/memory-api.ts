"use client";

import { apiGetWithEtag, apiPostWithEtag } from "@/ui/auth/api-client";

export interface Entity {
  readonly id: string;
  readonly name: string;
  readonly kind: string;
  readonly createdAt: string;
}
export interface Source {
  readonly id: string;
  readonly label: string;
  readonly sourceType: string;
  readonly url: string | null;
  readonly detail: string | null;
  readonly createdAt: string;
}
export interface MemoryRecord {
  readonly id: string;
  readonly entityId: string;
  readonly sourceId: string | null;
  readonly content: string;
  readonly createdAt: string;
}
export interface Relationship {
  readonly id: string;
  readonly fromEntityId: string;
  readonly toEntityId: string;
  readonly relationType: string;
  readonly createdAt: string;
}
export interface Insight {
  readonly id: string;
  readonly statement: string;
  readonly confidence: number;
  readonly evidence: string | null;
  readonly memoryIds: readonly string[];
  readonly createdAt: string;
}
export interface EntityKnowledge {
  readonly entity: Entity;
  readonly memories: ReadonlyArray<{ memory: MemoryRecord; source: Source | null }>;
  readonly relationships: ReadonlyArray<{
    relationship: Relationship;
    direction: "outgoing" | "incoming";
    otherEntity: Entity | null;
  }>;
  readonly insights: ReadonlyArray<{ insight: Insight; citedMemories: readonly MemoryRecord[] }>;
}

const get = async <T>(path: string): Promise<T> => (await apiGetWithEtag<T>(path)).data;
const post = async <T>(path: string, body: unknown): Promise<T> =>
  (await apiPostWithEtag<T>(path, body)).data;

export const listEntities = () => get<{ items: Entity[] }>("/api/v1/entities").then((b) => b.items);
export const createEntity = (name: string, kind: string) =>
  post<Entity>("/api/v1/entities", { name, kind });

export const listSources = () => get<{ items: Source[] }>("/api/v1/sources").then((b) => b.items);
export const createSource = (input: {
  label: string;
  sourceType: string;
  url?: string | null;
  detail?: string | null;
}) => post<Source>("/api/v1/sources", input);

export const createMemory = (input: {
  entityId: string;
  sourceId?: string | null;
  content: string;
}) => post<MemoryRecord>("/api/v1/memories", input);

export const createRelationship = (input: {
  fromEntityId: string;
  toEntityId: string;
  relationType: string;
}) => post<Relationship>("/api/v1/relationships", input);

export const createInsight = (input: {
  statement: string;
  confidence: number;
  evidence?: string | null;
  memoryIds: string[];
}) => post<Insight>("/api/v1/insights", input);

export const getEntityKnowledge = (entityId: string) =>
  get<EntityKnowledge>(`/api/v1/entities/${encodeURIComponent(entityId)}/knowledge`);
