import { describe, expect, it } from "vitest";
import { OptimisticConcurrencyError } from "@/lib/errors";
import { OwnerId } from "@/domain/project";
import { FixedClock, SequentialIdGenerator } from "../../../test/adapters/fakes";
import {
  InMemoryAcquisitionRunRepository,
  InMemoryKnowledgeObservationRepository,
  InMemoryKnowledgeReviewRepository,
  InMemoryKnowledgeReviewStore,
  InMemoryKnowledgeSourceRepository,
  InMemorySourceDocumentRepository,
} from "../../../test/adapters/in-memory-repositories";
import { ObservationAlreadyReviewedError } from "@/domain/knowledge-acquisition";
import {
  addSourceDocument,
  createAcquisitionRun,
  createKnowledgeObservation,
  createKnowledgeSource,
  reviewKnowledgeObservation,
  getObservationWithReview,
  getKnowledgeSource,
} from "./index";

const OWNER = OwnerId.unsafe("usr_00000001");
const OTHER = OwnerId.unsafe("usr_99999999");
const NOW = new Date("2026-07-21T00:00:00Z");
const env = () => {
  const reviews = new InMemoryKnowledgeReviewStore();
  return {
    knowledgeSources: new InMemoryKnowledgeSourceRepository(),
    sourceDocuments: new InMemorySourceDocumentRepository(),
    acquisitionRuns: new InMemoryAcquisitionRunRepository(),
    knowledgeObservations: new InMemoryKnowledgeObservationRepository(reviews),
    knowledgeReviews: new InMemoryKnowledgeReviewRepository(reviews),
    ids: new SequentialIdGenerator(),
    clock: new FixedClock(NOW),
  };
};
const unwrap = <T>(r: { ok: true; value: T } | { ok: false; error: unknown }): T => {
  if (!r.ok) throw r.error;
  return r.value;
};
async function source(e: ReturnType<typeof env>) {
  return unwrap(
    await createKnowledgeSource(e, {
      actorId: OWNER,
      name: "Interviews",
      sourceType: "UPLOAD",
      sourceReliability: "VERIFIED",
    }),
  );
}
async function document(e: ReturnType<typeof env>, sourceId: string) {
  return unwrap(
    await addSourceDocument(e, {
      actorId: OWNER,
      knowledgeSourceId: sourceId as never,
      documentType: "TRANSCRIPT",
      contentHash: "sha256:a",
      title: "Interview",
    }),
  );
}

describe("knowledge acquisition application", () => {
  it("gets an owned knowledge source", async () => {
    const e = env();
    const created = await source(e);
    const loaded = unwrap(
      await getKnowledgeSource(e, { actorId: OWNER, knowledgeSourceId: created.id }),
    );
    expect(loaded).toEqual(created);
    expect(
      await getKnowledgeSource(e, { actorId: OTHER, knowledgeSourceId: created.id }),
    ).toMatchObject({ ok: false });
  });
  it("creates each aggregate and makes document requests idempotent", async () => {
    const e = env();
    const s = await source(e);
    const d1 = await document(e, s.id);
    const d2 = await document(e, s.id);
    expect(d2.id).toBe(d1.id);
    const run = unwrap(
      await createAcquisitionRun(e, {
        actorId: OWNER,
        knowledgeSourceId: s.id,
        extractor: "extractor",
        extractorVersion: "1",
      }),
    );
    const observation = unwrap(
      await createKnowledgeObservation(e, {
        actorId: OWNER,
        knowledgeSourceId: s.id,
        sourceDocumentId: d1.id,
        acquisitionRunId: run.id,
        location: {},
        payload: { kind: "ENTITY", name: "Michael", entityKind: "person" },
        createdBy: "AI",
      }),
    );
    expect(observation.evidence.location).toBeNull();
  });
  it("denies cross-owner access", async () => {
    const e = env();
    const s = await source(e);
    const result = await addSourceDocument(e, {
      actorId: OTHER,
      knowledgeSourceId: s.id,
      documentType: "NOTE",
      contentHash: "x",
      title: "x",
    });
    expect(result.ok).toBe(false);
  });
  it.each(["ACCEPT", "REJECT"] as const)("applies %s atomically", async (outcome) => {
    const e = env();
    const s = await source(e);
    const d = await document(e, s.id);
    const o = unwrap(
      await createKnowledgeObservation(e, {
        actorId: OWNER,
        knowledgeSourceId: s.id,
        sourceDocumentId: d.id,
        payload: { kind: "MEMORY", content: "Fact" },
        createdBy: "HUMAN",
      }),
    );
    const reviewed = unwrap(
      await reviewKnowledgeObservation(e, {
        actorId: OWNER,
        knowledgeObservationId: o.id,
        expectedVersion: 1,
        outcome,
      }),
    );
    expect(reviewed.observation.status).toBe(outcome === "REJECT" ? "REJECTED" : "ACCEPTED");
  });
  it("stores an edited payload separately and rejects stale review", async () => {
    const e = env();
    const s = await source(e);
    const d = await document(e, s.id);
    const o = unwrap(
      await createKnowledgeObservation(e, {
        actorId: OWNER,
        knowledgeSourceId: s.id,
        sourceDocumentId: d.id,
        payload: { kind: "ENTITY", name: "M", entityKind: "person" },
        createdBy: "AI",
      }),
    );
    const edited = { kind: "ENTITY" as const, name: "Michael", entityKind: "person" };
    const reviewed = unwrap(
      await reviewKnowledgeObservation(e, {
        actorId: OWNER,
        knowledgeObservationId: o.id,
        expectedVersion: 1,
        outcome: "EDIT_AND_ACCEPT",
        editedPayload: edited,
      }),
    );
    expect(reviewed.review.editedPayload).toEqual(edited);
    expect(reviewed.observation.payload).toEqual(o.payload);
    const second = await reviewKnowledgeObservation(e, {
      actorId: OWNER,
      knowledgeObservationId: o.id,
      expectedVersion: 1,
      outcome: "ACCEPT",
    });
    expect(second.ok).toBe(false);
    if (!second.ok) expect(second.error).toBeInstanceOf(OptimisticConcurrencyError);
  });
  it("maps a same-version re-review to ObservationAlreadyReviewedError", async () => {
    const e = env();
    const s = await source(e);
    const d = await document(e, s.id);
    const o = unwrap(
      await createKnowledgeObservation(e, {
        actorId: OWNER,
        knowledgeSourceId: s.id,
        sourceDocumentId: d.id,
        payload: { kind: "MEMORY", content: "Fact" },
        createdBy: "AI",
      }),
    );
    await reviewKnowledgeObservation(e, {
      actorId: OWNER,
      knowledgeObservationId: o.id,
      expectedVersion: 1,
      outcome: "ACCEPT",
    });
    const result = await reviewKnowledgeObservation(e, {
      actorId: OWNER,
      knowledgeObservationId: o.id,
      expectedVersion: 2,
      outcome: "ACCEPT",
    });
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.error).toBeInstanceOf(ObservationAlreadyReviewedError);
  });
  it("reads back the review persisted by atomic applyReview", async () => {
    const e = env();
    const s = await source(e);
    const d = await document(e, s.id);
    const observation = unwrap(
      await createKnowledgeObservation(e, {
        actorId: OWNER,
        knowledgeSourceId: s.id,
        sourceDocumentId: d.id,
        payload: { kind: "MEMORY", content: "Persisted fact" },
        createdBy: "AI",
      }),
    );
    const reviewed = unwrap(
      await reviewKnowledgeObservation(e, {
        actorId: OWNER,
        knowledgeObservationId: observation.id,
        expectedVersion: 1,
        outcome: "ACCEPT",
        note: "Verified",
      }),
    );

    const detail = unwrap(
      await getObservationWithReview(e, {
        actorId: OWNER,
        knowledgeObservationId: observation.id,
      }),
    );
    expect(detail.review).toEqual(reviewed.review);
  });
});
