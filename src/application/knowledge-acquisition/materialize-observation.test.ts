import { describe, expect, it } from "vitest";
import { OwnerId } from "@/domain/project";
import { createEntity, createMemory, EntityId, InsightId, MemoryId } from "@/domain/memory";
import { ConflictError } from "@/lib/errors";
import {
  createKnowledgeObservation,
  KnowledgeObservationId,
  KnowledgeReviewId,
  KnowledgeSourceId,
  makeObservationEvidence,
  reviewObservation,
  SourceDocumentId,
  type ObservationPayload,
} from "@/domain/knowledge-acquisition";
import { FixedClock, SequentialIdGenerator } from "../../../test/adapters/fakes";
import {
  InMemoryEntityRepository,
  InMemoryKnowledgeObservationRepository,
  InMemoryKnowledgeReviewRepository,
  InMemoryKnowledgeReviewStore,
  InMemoryMaterializationRepository,
  InMemoryMemoryRepository,
  InMemoryInsightRepository,
  InMemoryRelationshipRepository,
  InMemorySourceRepository,
} from "../../../test/adapters/in-memory-repositories";
import { InvalidValueError } from "@/domain/shared";
import { NotAuthorizedError, ObservationNotAcceptedError } from "../shared/errors";
import { materializeObservation, type MaterializationResolution } from "./materialize-observation";

const OWNER = OwnerId.unsafe("usr_00000001");
const OTHER = OwnerId.unsafe("usr_99999999");
const NOW = new Date("2026-07-21T00:00:00Z");
const unwrap = <T>(r: { ok: true; value: T } | { ok: false; error: unknown }): T => {
  if (!r.ok) throw r.error;
  return r.value;
};
function env() {
  const store = new InMemoryKnowledgeReviewStore();
  const entities = new InMemoryEntityRepository();
  const memories = new InMemoryMemoryRepository();
  const insights = new InMemoryInsightRepository();
  const relationships = new InMemoryRelationshipRepository();
  return {
    knowledgeObservations: new InMemoryKnowledgeObservationRepository(store),
    knowledgeReviews: new InMemoryKnowledgeReviewRepository(store),
    materializations: new InMemoryMaterializationRepository(
      entities,
      memories,
      insights,
      relationships,
    ),
    entities,
    sources: new InMemorySourceRepository(),
    memories,
    insights,
    relationships,
    ids: new SequentialIdGenerator(),
    clock: new FixedClock(NOW),
  };
}
function pending(payload: ObservationPayload, confidence?: number | null) {
  return unwrap(
    createKnowledgeObservation({
      id: KnowledgeObservationId.unsafe("kobs_AAAAAAA1"),
      ownerId: OWNER,
      observationType: payload.kind,
      payload,
      evidence: makeObservationEvidence({
        sourceDocumentId: SourceDocumentId.unsafe("sdoc_AAAAAAA1"),
        knowledgeSourceId: KnowledgeSourceId.unsafe("ksrc_AAAAAAA1"),
      }),
      confidence,
      createdBy: "AI",
      now: NOW,
    }),
  );
}
function accepted(
  e: ReturnType<typeof env>,
  payload: ObservationPayload,
  confidence?: number | null,
) {
  const pair = unwrap(
    reviewObservation(pending(payload, confidence), {
      id: KnowledgeReviewId.unsafe("krev_AAAAAAA1"),
      reviewerId: OWNER,
      outcome: "ACCEPT",
      now: NOW,
    }),
  );
  e.knowledgeObservations.seed(pair.observation);
  e.knowledgeReviews.seed(pair.review);
  return pair.observation;
}
const entity = (e: ReturnType<typeof env>, id: string, owner = OWNER) => {
  const value = unwrap(
    createEntity({ id: EntityId.unsafe(id), ownerId: owner, name: id, kind: "person", now: NOW }),
  );
  e.entities.seed(value);
  return value;
};

describe("materializeObservation", () => {
  it.each([
    [{ kind: "ENTITY", name: "Michael", entityKind: "person" }, { kind: "ENTITY" }],
    [
      { kind: "MEMORY", content: "Fact" },
      { kind: "MEMORY", entityId: "ent_AAAAAAA1" },
    ],
    [
      { kind: "INSIGHT", statement: "Conclusion" },
      { kind: "INSIGHT", memoryIds: ["mem_AAAAAAA1"], confidence: 0.8 },
    ],
    [
      { kind: "RELATIONSHIP", relationType: "knows", fromLabel: "A", toLabel: "B" },
      { kind: "RELATIONSHIP", fromEntityId: "ent_AAAAAAA1", toEntityId: "ent_BBBBBBB2" },
    ],
  ] as const)("materializes %s and is idempotent", async (payload, resolution) => {
    const e = env();
    entity(e, "ent_AAAAAAA1");
    entity(e, "ent_BBBBBBB2");
    e.memories.seed(
      unwrap(
        createMemory({
          id: MemoryId.unsafe("mem_AAAAAAA1"),
          ownerId: OWNER,
          entityId: EntityId.unsafe("ent_AAAAAAA1"),
          content: "Evidence",
          now: NOW,
        }),
      ),
    );
    const observation = accepted(e, payload);
    const first = unwrap(
      await materializeObservation(e, {
        actorId: OWNER,
        knowledgeObservationId: observation.id,
        resolution: resolution as MaterializationResolution,
      }),
    );
    const second = unwrap(
      await materializeObservation(e, {
        actorId: OWNER,
        knowledgeObservationId: observation.id,
        resolution: resolution as MaterializationResolution,
      }),
    );
    expect(second.record).toEqual(first.record);
    expect(await e.materializations.findByObservation(observation.id)).toHaveLength(1);
  });
  it("uses observation confidence before resolution confidence", async () => {
    const e = env();
    const memory = entity(e, "ent_AAAAAAA1");
    e.memories.seed(
      unwrap(
        createMemory({
          id: MemoryId.unsafe("mem_AAAAAAA1"),
          ownerId: OWNER,
          entityId: memory.id,
          content: "Evidence",
          now: NOW,
        }),
      ),
    );
    const observation = accepted(e, { kind: "INSIGHT", statement: "Conclusion" }, 0.9);
    const result = unwrap(
      await materializeObservation(e, {
        actorId: OWNER,
        knowledgeObservationId: observation.id,
        resolution: { kind: "INSIGHT", memoryIds: ["mem_AAAAAAA1"], confidence: 0.2 },
      }),
    );
    const insight = await e.insights.findById(InsightId.unsafe(result.record.recordId));
    expect(insight?.confidence).toBe(0.9);
  });
  it("rejects pending observations and missing insight confidence", async () => {
    const e = env();
    const p = pending({ kind: "ENTITY", name: "M", entityKind: "person" });
    e.knowledgeObservations.seed(p);
    const denied = await materializeObservation(e, {
      actorId: OWNER,
      knowledgeObservationId: p.id,
      resolution: { kind: "ENTITY" },
    });
    expect(!denied.ok && denied.error).toBeInstanceOf(ObservationNotAcceptedError);
    const memory = entity(e, "ent_AAAAAAA1");
    e.memories.seed(
      unwrap(
        createMemory({
          id: MemoryId.unsafe("mem_AAAAAAA1"),
          ownerId: OWNER,
          entityId: memory.id,
          content: "Evidence",
          now: NOW,
        }),
      ),
    );
    const a = accepted(e, { kind: "INSIGHT", statement: "Conclusion" });
    const missing = await materializeObservation(e, {
      actorId: OWNER,
      knowledgeObservationId: a.id,
      resolution: { kind: "INSIGHT", memoryIds: ["mem_AAAAAAA1"] },
    });
    expect(!missing.ok && missing.error).toBeInstanceOf(InvalidValueError);
  });
  it("denies references owned by another actor", async () => {
    const e = env();
    entity(e, "ent_AAAAAAA1", OTHER);
    const observation = accepted(e, { kind: "MEMORY", content: "Fact" });
    const result = await materializeObservation(e, {
      actorId: OWNER,
      knowledgeObservationId: observation.id,
      resolution: { kind: "MEMORY", entityId: "ent_AAAAAAA1" },
    });
    expect(result.ok).toBe(false);
  });

  it("uses the edited payload from EDIT_AND_ACCEPT", async () => {
    const e = env();
    const original = pending({ kind: "ENTITY", name: "Original", entityKind: "person" });
    const pair = unwrap(
      reviewObservation(original, {
        id: KnowledgeReviewId.unsafe("krev_AAAAAAA1"),
        reviewerId: OWNER,
        outcome: "EDIT_AND_ACCEPT",
        editedPayload: { kind: "ENTITY", name: "Edited", entityKind: "organization" },
        now: NOW,
      }),
    );
    e.knowledgeObservations.seed(pair.observation);
    e.knowledgeReviews.seed(pair.review);
    const result = unwrap(
      await materializeObservation(e, {
        actorId: OWNER,
        knowledgeObservationId: pair.observation.id,
        resolution: { kind: "ENTITY" },
      }),
    );
    const created = await e.entities.findById(EntityId.unsafe(result.record.recordId));
    expect(created).toMatchObject({ name: "Edited", kind: "organization" });
  });

  it("returns the winning link after a materialization race without a duplicate record", async () => {
    const e = env();
    const observation = accepted(e, { kind: "ENTITY", name: "Michael", entityKind: "person" });
    const base = e.materializations;
    let reads = 0;
    const racing = {
      findByObservation: async (id: KnowledgeObservationId) =>
        reads++ === 0 ? [] : base.findByObservation(id),
      findByRecord: base.findByRecord.bind(base),
      materialize: async (...args: Parameters<typeof base.materialize>) => {
        await base.materialize(...args);
        throw new ConflictError("Concurrent materialization");
      },
    };
    const result = unwrap(
      await materializeObservation(
        { ...e, materializations: racing },
        { actorId: OWNER, knowledgeObservationId: observation.id, resolution: { kind: "ENTITY" } },
      ),
    );
    expect(await base.findByObservation(observation.id)).toHaveLength(1);
    expect(await e.entities.listByOwner(OWNER)).toHaveLength(1);
    expect(result.record.recordType).toBe("ENTITY");
  });

  it("rejects a resolution kind mismatch", async () => {
    const e = env();
    const observation = accepted(e, { kind: "ENTITY", name: "Michael", entityKind: "person" });
    const result = await materializeObservation(e, {
      actorId: OWNER,
      knowledgeObservationId: observation.id,
      resolution: { kind: "MEMORY", entityId: "ent_AAAAAAA1" },
    });
    expect(!result.ok && result.error).toBeInstanceOf(InvalidValueError);
  });

  it("does not mutate the observation or review", async () => {
    const e = env();
    const observation = accepted(e, { kind: "ENTITY", name: "Michael", entityKind: "person" });
    const review = await e.knowledgeReviews.findByObservation(observation.id);
    const observationBefore = structuredClone(observation);
    const reviewBefore = structuredClone(review);
    unwrap(
      await materializeObservation(e, {
        actorId: OWNER,
        knowledgeObservationId: observation.id,
        resolution: { kind: "ENTITY" },
      }),
    );
    expect(await e.knowledgeObservations.findById(observation.id)).toEqual(observationBefore);
    expect(await e.knowledgeReviews.findByObservation(observation.id)).toEqual(reviewBefore);
  });

  it("rejects a rejected observation", async () => {
    const e = env();
    const pair = unwrap(
      reviewObservation(pending({ kind: "ENTITY", name: "Michael", entityKind: "person" }), {
        id: KnowledgeReviewId.unsafe("krev_AAAAAAA1"),
        reviewerId: OWNER,
        outcome: "REJECT",
        now: NOW,
      }),
    );
    e.knowledgeObservations.seed(pair.observation);
    e.knowledgeReviews.seed(pair.review);
    const result = await materializeObservation(e, {
      actorId: OWNER,
      knowledgeObservationId: pair.observation.id,
      resolution: { kind: "ENTITY" },
    });
    expect(!result.ok && result.error).toBeInstanceOf(ObservationNotAcceptedError);
  });

  it("denies a foreign actor who owns neither observation nor provenance", async () => {
    const e = env();
    entity(e, "ent_AAAAAAA1", OWNER);
    const observation = accepted(e, { kind: "MEMORY", content: "Fact" });
    const result = await materializeObservation(e, {
      actorId: OTHER,
      knowledgeObservationId: observation.id,
      resolution: { kind: "MEMORY", entityId: "ent_AAAAAAA1" },
    });
    expect(!result.ok && result.error).toBeInstanceOf(NotAuthorizedError);
  });
});
