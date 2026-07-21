import { ConflictError } from "@/lib/errors";
import { err, ok } from "@/lib/result";
import type { OwnerId } from "@/domain/project";
import { InvalidValueError } from "@/domain/shared";
import {
  makeKnowledgeEngineRef,
  type KnowledgeObservationId,
  type KnowledgeObservationRepository,
  type KnowledgeReviewRepository,
} from "@/domain/knowledge-acquisition";
import {
  createEntity,
  createInsight,
  createMemory,
  createRelationship,
  EntityId,
  InsightId,
  MemoryId,
  RelationshipId,
  SourceId,
  type EntityRepository,
  type MemoryRepository,
  type SourceRepository,
} from "@/domain/memory";
import type { Clock, IdGenerator } from "../shared";
import { attempt } from "../shared/attempt";
import { ObservationNotAcceptedError, RepositoryError } from "../shared/errors";
import { loadOwnedEntity, loadOwnedMemory, loadOwnedSource } from "../memory/record-access";
import { loadOwnedObservation } from "./knowledge-source-access";
import type {
  MaterializationLink,
  MaterializationRepository,
  MaterializedRecord,
} from "./materialization-repository";
import { toMaterializationView } from "./materialization-view";

export type MaterializationResolution =
  | { readonly kind: "ENTITY" }
  | { readonly kind: "MEMORY"; readonly entityId: string; readonly sourceId?: string | null }
  | {
      readonly kind: "INSIGHT";
      readonly memoryIds: readonly string[];
      readonly confidence?: number | null;
      readonly evidence?: string | null;
    }
  | { readonly kind: "RELATIONSHIP"; readonly fromEntityId: string; readonly toEntityId: string };
export interface MaterializeObservationDeps {
  readonly knowledgeObservations: KnowledgeObservationRepository;
  readonly knowledgeReviews: KnowledgeReviewRepository;
  readonly materializations: MaterializationRepository;
  readonly entities: EntityRepository;
  readonly sources: SourceRepository;
  readonly memories: MemoryRepository;
  readonly ids: IdGenerator;
  readonly clock: Clock;
}

export async function materializeObservation(
  deps: MaterializeObservationDeps,
  input: {
    actorId: OwnerId;
    knowledgeObservationId: KnowledgeObservationId;
    resolution: MaterializationResolution;
  },
) {
  const loaded = await loadOwnedObservation(
    deps.knowledgeObservations,
    input.actorId,
    input.knowledgeObservationId,
    "knowledgeObservation.materialize",
  );
  if (!loaded.ok) return loaded;
  const observation = loaded.value;
  if (observation.status !== "ACCEPTED") return err(new ObservationNotAcceptedError());
  if (input.resolution.kind !== observation.observationType)
    return err(
      new InvalidValueError("Materialization resolution kind must match the observation type"),
    );
  const existing = await attempt("materialization.findByObservation", () =>
    deps.materializations.findByObservation(observation.id),
  );
  if (!existing.ok) return existing;
  if (existing.value.length > 0) return ok(toMaterializationView(existing.value[0]!));
  const reviewResult = await attempt("knowledgeReview.findByObservation", () =>
    deps.knowledgeReviews.findByObservation(observation.id),
  );
  if (!reviewResult.ok) return reviewResult;
  const review = reviewResult.value;
  if (!review) return err(new RepositoryError("knowledgeReview.findByObservation"));
  const payload = review.editedPayload ?? observation.payload;
  const now = deps.clock.now();
  let record: MaterializedRecord;
  if (payload.kind === "ENTITY" && input.resolution.kind === "ENTITY") {
    const made = createEntity({
      id: EntityId.unsafe(deps.ids.generate(EntityId.prefix)),
      ownerId: input.actorId,
      name: payload.name,
      kind: payload.entityKind,
      now,
    });
    if (!made.ok) return made;
    record = { kind: "ENTITY", entity: made.value };
  } else if (payload.kind === "MEMORY" && input.resolution.kind === "MEMORY") {
    const entityId = EntityId.parse(input.resolution.entityId);
    if (!entityId.ok) return entityId;
    const entity = await loadOwnedEntity(
      deps.entities,
      input.actorId,
      entityId.value,
      "knowledgeObservation.materialize",
    );
    if (!entity.ok) return entity;
    let sourceId = null;
    if (input.resolution.sourceId != null) {
      const parsed = SourceId.parse(input.resolution.sourceId);
      if (!parsed.ok) return parsed;
      const source = await loadOwnedSource(
        deps.sources,
        input.actorId,
        parsed.value,
        "knowledgeObservation.materialize",
      );
      if (!source.ok) return source;
      sourceId = parsed.value;
    }
    const made = createMemory({
      id: MemoryId.unsafe(deps.ids.generate(MemoryId.prefix)),
      ownerId: input.actorId,
      entityId: entityId.value,
      sourceId,
      content: payload.content,
      now,
    });
    if (!made.ok) return made;
    record = { kind: "MEMORY", memory: made.value };
  } else if (payload.kind === "INSIGHT" && input.resolution.kind === "INSIGHT") {
    const memoryIds = [] as MemoryId[];
    for (const raw of input.resolution.memoryIds) {
      const parsed = MemoryId.parse(raw);
      if (!parsed.ok) return parsed;
      const memory = await loadOwnedMemory(
        deps.memories,
        input.actorId,
        parsed.value,
        "knowledgeObservation.materialize",
      );
      if (!memory.ok) return memory;
      memoryIds.push(parsed.value);
    }
    const confidence = observation.confidence ?? input.resolution.confidence;
    if (confidence == null)
      return err(new InvalidValueError("Insight materialization requires confidence"));
    const made = createInsight({
      id: InsightId.unsafe(deps.ids.generate(InsightId.prefix)),
      ownerId: input.actorId,
      statement: payload.statement,
      confidence,
      evidence: input.resolution.evidence,
      memoryIds,
      now,
    });
    if (!made.ok) return made;
    record = { kind: "INSIGHT", insight: made.value };
  } else if (payload.kind === "RELATIONSHIP" && input.resolution.kind === "RELATIONSHIP") {
    const from = EntityId.parse(input.resolution.fromEntityId);
    if (!from.ok) return from;
    const to = EntityId.parse(input.resolution.toEntityId);
    if (!to.ok) return to;
    const ownedFrom = await loadOwnedEntity(
      deps.entities,
      input.actorId,
      from.value,
      "knowledgeObservation.materialize",
    );
    if (!ownedFrom.ok) return ownedFrom;
    const ownedTo = await loadOwnedEntity(
      deps.entities,
      input.actorId,
      to.value,
      "knowledgeObservation.materialize",
    );
    if (!ownedTo.ok) return ownedTo;
    const made = createRelationship({
      id: RelationshipId.unsafe(deps.ids.generate(RelationshipId.prefix)),
      ownerId: input.actorId,
      fromEntityId: from.value,
      toEntityId: to.value,
      relationType: payload.relationType,
      now,
    });
    if (!made.ok) return made;
    record = { kind: "RELATIONSHIP", relationship: made.value };
  } else
    return err(new InvalidValueError("Effective payload kind must match the observation type"));
  const value =
    record.kind === "ENTITY"
      ? record.entity
      : record.kind === "MEMORY"
        ? record.memory
        : record.kind === "INSIGHT"
          ? record.insight
          : record.relationship;
  const ref = makeKnowledgeEngineRef(record.kind, value.id);
  if (!ref.ok) return ref;
  const link: MaterializationLink = {
    ownerId: input.actorId,
    knowledgeObservationId: observation.id,
    knowledgeReviewId: review.id,
    record: ref.value,
    createdAt: now,
  };
  try {
    await deps.materializations.materialize(record, link);
  } catch (cause) {
    if (!(cause instanceof ConflictError))
      return err(new RepositoryError("materialization.materialize", { cause }));
    const raced = await attempt("materialization.findByObservation", () =>
      deps.materializations.findByObservation(observation.id),
    );
    if (!raced.ok) return raced;
    if (raced.value.length === 0)
      return err(new RepositoryError("materialization.materializeRace"));
    return ok(toMaterializationView(raced.value[0]!));
  }
  return ok(toMaterializationView(link));
}
