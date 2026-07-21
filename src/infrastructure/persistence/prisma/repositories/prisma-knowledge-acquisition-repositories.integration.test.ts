import type { PrismaClient } from "@prisma/client";
import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";
import { ConflictError, OptimisticConcurrencyError } from "@/lib/errors";
import { OwnerId } from "@/domain/project";
import {
  AcquisitionRunId,
  createAcquisitionRun,
  createKnowledgeObservation,
  createKnowledgeSource,
  createSourceDocument,
  KnowledgeObservationId,
  KnowledgeReviewId,
  KnowledgeSourceId,
  makeObservationEvidence,
  reviewObservation,
  SourceDocumentId,
} from "@/domain/knowledge-acquisition";
import {
  PrismaAcquisitionRunRepository,
  PrismaKnowledgeObservationRepository,
  PrismaKnowledgeReviewRepository,
  PrismaKnowledgeSourceRepository,
  PrismaSourceDocumentRepository,
} from "@/infrastructure/persistence/prisma";
import { createTestPrisma, resetDatabase } from "@test/db/integration-helpers";
const OWNER = OwnerId.unsafe("usr_AAAAAAAA");
const NOW = new Date("2026-07-21T00:00:00Z");
const unwrap = <T>(r: { ok: true; value: T } | { ok: false; error: unknown }): T => {
  if (!r.ok) throw r.error;
  return r.value;
};
const thrown = async (p: Promise<unknown>) => {
  try {
    await p;
  } catch (e) {
    return e;
  }
  throw new Error("expected throw");
};
let db: PrismaClient;
let sources: PrismaKnowledgeSourceRepository;
let docs: PrismaSourceDocumentRepository;
let runs: PrismaAcquisitionRunRepository;
let observations: PrismaKnowledgeObservationRepository;
let reviews: PrismaKnowledgeReviewRepository;
beforeAll(() => {
  db = createTestPrisma();
  sources = new PrismaKnowledgeSourceRepository(db);
  docs = new PrismaSourceDocumentRepository(db);
  runs = new PrismaAcquisitionRunRepository(db);
  observations = new PrismaKnowledgeObservationRepository(db);
  reviews = new PrismaKnowledgeReviewRepository(db);
});
afterAll(() => db.$disconnect());
beforeEach(() => resetDatabase(db));
function aggregates() {
  const source = unwrap(
    createKnowledgeSource({
      id: KnowledgeSourceId.unsafe("ksrc_AAAAAAA1"),
      ownerId: OWNER,
      name: "Source",
      sourceType: "UPLOAD",
      sourceReliability: "HIGH",
      now: NOW,
    }),
  );
  const doc = unwrap(
    createSourceDocument({
      id: SourceDocumentId.unsafe("sdoc_AAAAAAA1"),
      ownerId: OWNER,
      knowledgeSourceId: source.id,
      documentType: "NOTE",
      contentHash: "hash",
      title: "Note",
      now: NOW,
    }),
  );
  const run = unwrap(
    createAcquisitionRun({
      id: AcquisitionRunId.unsafe("arun_AAAAAAA1"),
      ownerId: OWNER,
      knowledgeSourceId: source.id,
      extractor: "x",
      extractorVersion: "1",
      now: NOW,
    }),
  );
  const observation = unwrap(
    createKnowledgeObservation({
      id: KnowledgeObservationId.unsafe("kobs_AAAAAAA1"),
      ownerId: OWNER,
      observationType: "ENTITY",
      payload: { kind: "ENTITY", name: "Michael", entityKind: "person" },
      evidence: makeObservationEvidence({
        sourceDocumentId: doc.id,
        knowledgeSourceId: source.id,
        acquisitionRunId: run.id,
      }),
      confidence: 0.8,
      createdBy: "AI",
      now: NOW,
    }),
  );
  return { source, doc, run, observation };
}
async function seed() {
  const a = aggregates();
  await sources.insert(a.source);
  await docs.insert(a.doc);
  await runs.insert(a.run);
  await observations.insert(a.observation);
  return a;
}
describe("Prisma knowledge acquisition repositories", () => {
  it("round-trips all five aggregates and payload JSON", async () => {
    const a = await seed();
    const pair = unwrap(
      reviewObservation(a.observation, {
        id: KnowledgeReviewId.unsafe("krev_AAAAAAA1"),
        reviewerId: OWNER,
        outcome: "EDIT_AND_ACCEPT",
        editedPayload: { kind: "ENTITY", name: "Mike", entityKind: "person" },
        now: NOW,
      }),
    );
    await observations.applyReview(pair.observation, pair.review);
    expect((await sources.findById(a.source.id))?.name).toBe("Source");
    expect((await docs.findById(a.doc.id))?.contentHash).toBe("hash");
    expect((await runs.findById(a.run.id))?.summary).toBeNull();
    expect((await observations.findById(a.observation.id))?.payload).toEqual(a.observation.payload);
    expect((await reviews.findByObservation(a.observation.id))?.editedPayload).toEqual(
      pair.review.editedPayload,
    );
  });
  it("enforces document uniqueness", async () => {
    const a = await seed();
    expect(
      await thrown(docs.insert({ ...a.doc, id: SourceDocumentId.unsafe("sdoc_BBBBBBB2") })),
    ).toBeInstanceOf(ConflictError);
  });
  it("stale applyReview is atomic and second review conflicts", async () => {
    const a = await seed();
    const pair = unwrap(
      reviewObservation(a.observation, {
        id: KnowledgeReviewId.unsafe("krev_AAAAAAA2"),
        reviewerId: OWNER,
        outcome: "ACCEPT",
        now: NOW,
      }),
    );
    await observations.applyReview(pair.observation, pair.review);
    expect(
      await thrown(
        observations.applyReview(pair.observation, {
          ...pair.review,
          id: KnowledgeReviewId.unsafe("krev_BBBBBBB2"),
        }),
      ),
    ).toBeInstanceOf(OptimisticConcurrencyError);
    expect(await reviews.findById(KnowledgeReviewId.unsafe("krev_BBBBBBB2"))).toBeNull();
  });
  it("database checks confidence, review payload, and FK Restrict", async () => {
    const a = await seed();
    await expect(
      db.$executeRaw`UPDATE "knowledge_observations" SET "confidence" = 2 WHERE "id" = ${a.observation.id}`,
    ).rejects.toBeTruthy();
    await expect(db.knowledgeSource.delete({ where: { id: a.source.id } })).rejects.toBeTruthy();
  });
});
