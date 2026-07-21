import { describe, expect, it } from "vitest";
import { InvalidStateTransitionError, InvalidValueError } from "../shared";
import { OwnerId } from "../project/project-id";
import {
  acquisitionRunLifecycle,
  AcquisitionRunId,
  archiveSource,
  completeRun,
  createAcquisitionRun,
  createKnowledgeObservation,
  createKnowledgeSource,
  createSourceDocument,
  failRun,
  KnowledgeObservationId,
  KnowledgeReviewId,
  KnowledgeSourceId,
  makeExtractionLocation,
  makeKnowledgeEngineRef,
  makeObservationEvidence,
  ObservationAlreadyReviewedError,
  type ObservationEvidence,
  type ObservationPayload,
  pauseSource,
  resumeSource,
  reviewObservation,
  ReviewOutcomeError,
  SourceDocumentId,
  startRun,
  type KnowledgeSource,
} from "./index";

const OWNER = OwnerId.unsafe("usr_ABCDEF12");
const REVIEWER = OwnerId.unsafe("usr_REVIEW01");
const SOURCE = KnowledgeSourceId.unsafe("ksrc_AAAAAAA1");
const DOCUMENT = SourceDocumentId.unsafe("sdoc_AAAAAAA1");
const RUN = AcquisitionRunId.unsafe("arun_AAAAAAA1");
const T0 = new Date("2026-07-21T00:00:00.000Z");
const T1 = new Date("2026-07-21T01:00:00.000Z");

function unwrap<T>(r: { ok: true; value: T } | { ok: false; error: unknown }): T {
  if (!r.ok) throw r.error;
  return r.value;
}

const evidence = (): ObservationEvidence =>
  makeObservationEvidence({ sourceDocumentId: DOCUMENT, knowledgeSourceId: SOURCE });

const entityPayload: ObservationPayload = { kind: "ENTITY", name: "Michael", entityKind: "person" };

function draftSource(): KnowledgeSource {
  return unwrap(
    createKnowledgeSource({
      id: SOURCE,
      ownerId: OWNER,
      name: "Interview transcripts",
      sourceType: "UPLOAD",
      sourceReliability: "VERIFIED",
      now: T0,
    }),
  );
}

describe("KnowledgeSource", () => {
  it("creates an ACTIVE source (lockVersion 1) with each reliability including VERIFIED", () => {
    const s = draftSource();
    expect(s.status).toBe("ACTIVE");
    expect(s.lockVersion).toBe(1);
    expect(s.sourceReliability).toBe("VERIFIED");
    for (const r of ["VERIFIED", "HIGH", "MEDIUM", "LOW", "UNKNOWN"] as const) {
      const result = createKnowledgeSource({
        id: SOURCE,
        ownerId: OWNER,
        name: "S",
        sourceType: "WEB_PAGE",
        sourceReliability: r,
        now: T0,
      });
      expect(result.ok, `reliability ${r}`).toBe(true);
    }
  });

  it("rejects a blank name", () => {
    const result = createKnowledgeSource({
      id: SOURCE,
      ownerId: OWNER,
      name: "   ",
      sourceType: "MANUAL",
      sourceReliability: "UNKNOWN",
      now: T0,
    });
    expect(result.ok).toBe(false);
  });

  it("pauses, resumes, and archives; rejects reactivating an archived source", () => {
    const paused = unwrap(pauseSource(draftSource()));
    expect(paused.status).toBe("PAUSED");
    expect(paused.lockVersion).toBe(2);
    expect(unwrap(resumeSource(paused)).status).toBe("ACTIVE");

    const archived = unwrap(archiveSource(paused));
    expect(archived.status).toBe("ARCHIVED");
    const reactivate = resumeSource(archived);
    expect(reactivate.ok).toBe(false);
    if (!reactivate.ok) expect(reactivate.error).toBeInstanceOf(InvalidStateTransitionError);
  });
});

describe("SourceDocument", () => {
  const base = {
    id: DOCUMENT,
    ownerId: OWNER,
    knowledgeSourceId: SOURCE,
    contentHash: "sha256:abc123",
    title: "Chef interview",
    now: T0,
  };

  it("creates a document for each document type", () => {
    for (const documentType of [
      "TRANSCRIPT",
      "ARTICLE",
      "WEB_PAGE",
      "SOCIAL_POST",
      "PDF",
      "VIDEO",
      "NOTE",
    ] as const) {
      const result = createSourceDocument({ ...base, documentType });
      expect(result.ok, `documentType ${documentType}`).toBe(true);
    }
  });

  it("rejects a blank content hash or title", () => {
    expect(createSourceDocument({ ...base, documentType: "PDF", contentHash: "  " }).ok).toBe(
      false,
    );
    expect(createSourceDocument({ ...base, documentType: "PDF", title: "  " }).ok).toBe(false);
  });
});

describe("AcquisitionRun", () => {
  const base = {
    id: RUN,
    ownerId: OWNER,
    knowledgeSourceId: SOURCE,
    extractor: "story-observer",
    extractorVersion: "v1",
    now: T0,
  };

  it("requires extractor and extractorVersion", () => {
    expect(createAcquisitionRun({ ...base, extractor: "  " }).ok).toBe(false);
    expect(createAcquisitionRun({ ...base, extractorVersion: "  " }).ok).toBe(false);
  });

  it("runs PENDING → RUNNING → each terminal outcome", () => {
    const run = unwrap(createAcquisitionRun(base));
    expect(run.status).toBe("PENDING");
    const running = unwrap(startRun(run, T1));
    expect(running.status).toBe("RUNNING");
    expect(running.startedAt).toEqual(T1);

    for (const status of ["SUCCEEDED", "PARTIALLY_SUCCEEDED", "FAILED"] as const) {
      const done = unwrap(
        completeRun(running, {
          status,
          summary: { documentsProcessed: 3, observationsCreated: 5, failureCount: 0 },
          now: T1,
        }),
      );
      expect(done.status).toBe(status);
      expect(done.summary?.observationsCreated).toBe(5);
      expect(done.finishedAt).toEqual(T1);
    }
  });

  it("cannot complete a PENDING run and cannot leave a terminal state", () => {
    const run = unwrap(createAcquisitionRun(base));
    const bad = completeRun(run, {
      status: "SUCCEEDED",
      summary: { documentsProcessed: 0, observationsCreated: 0, failureCount: 0 },
      now: T1,
    });
    expect(bad.ok).toBe(false);
    if (!bad.ok) expect(bad.error).toBeInstanceOf(InvalidStateTransitionError);

    const failed = unwrap(failRun(unwrap(startRun(run, T1)), T1));
    expect(acquisitionRunLifecycle.can(failed.status, "RUNNING")).toBe(false);
  });

  it("rejects negative summary counts", () => {
    const running = unwrap(startRun(unwrap(createAcquisitionRun(base)), T1));
    const bad = completeRun(running, {
      status: "SUCCEEDED",
      summary: { documentsProcessed: -1, observationsCreated: 0, failureCount: 0 },
      now: T1,
    });
    expect(bad.ok).toBe(false);
  });
});

describe("ObservationEvidence & ExtractionLocation", () => {
  it("assembles evidence with required ids and optional run/location", () => {
    const e = makeObservationEvidence({ sourceDocumentId: DOCUMENT, knowledgeSourceId: SOURCE });
    expect(e.sourceDocumentId).toBe(DOCUMENT);
    expect(e.knowledgeSourceId).toBe(SOURCE);
    expect(e.acquisitionRunId).toBeNull();
    expect(e.location).toBeNull();
  });

  it("accepts valid locations and rejects malformed ones", () => {
    const characterRange = makeExtractionLocation({ charStart: 10, charEnd: 40 });
    const timeRange = makeExtractionLocation({ timeStartMs: 0, timeEndMs: 1000 });
    const page = makeExtractionLocation({ pageNumber: 3, textSpan: "quoted" });
    expect(characterRange.ok && characterRange.value).not.toBeNull();
    expect(timeRange.ok && timeRange.value).not.toBeNull();
    expect(page.ok && page.value).not.toBeNull();
    expect(makeExtractionLocation({})).toEqual({ ok: true, value: null });
    expect(makeExtractionLocation({ charStart: 40, charEnd: 10 }).ok).toBe(false);
    expect(makeExtractionLocation({ pageNumber: 0 }).ok).toBe(false);
    expect(makeExtractionLocation({ charStart: -1 }).ok).toBe(false);
  });
});

describe("KnowledgeObservation", () => {
  const base = {
    id: KnowledgeObservationId.unsafe("kobs_AAAAAAA1"),
    ownerId: OWNER,
    observationType: "ENTITY" as const,
    payload: entityPayload,
    evidence: evidence(),
    createdBy: "AI" as const,
    now: T0,
  };

  it("creates a PENDING_REVIEW observation", () => {
    const o = unwrap(createKnowledgeObservation(base));
    expect(o.status).toBe("PENDING_REVIEW");
    expect(o.lockVersion).toBe(1);
    expect(o.confidence).toBeNull();
  });

  it("accepts each origin AI / HUMAN / IMPORT", () => {
    for (const createdBy of ["AI", "HUMAN", "IMPORT"] as const) {
      expect(createKnowledgeObservation({ ...base, createdBy }).ok, createdBy).toBe(true);
    }
  });

  it("requires observationType to equal payload.kind", () => {
    const result = createKnowledgeObservation({ ...base, observationType: "MEMORY" });
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.error).toBeInstanceOf(InvalidValueError);
  });

  it("allows an omitted confidence but rejects an out-of-range one", () => {
    expect(createKnowledgeObservation({ ...base, createdBy: "HUMAN" }).ok).toBe(true); // no confidence
    expect(createKnowledgeObservation({ ...base, confidence: 0.7 }).ok).toBe(true);
    expect(createKnowledgeObservation({ ...base, confidence: 1.5 }).ok).toBe(false);
  });

  it("validates payload text per kind", () => {
    const blankName = createKnowledgeObservation({
      ...base,
      payload: { kind: "ENTITY", name: "  ", entityKind: "person" },
    });
    expect(blankName.ok).toBe(false);
  });

  it("carries provenance grouped under evidence", () => {
    const o = unwrap(createKnowledgeObservation(base));
    expect(o.evidence.sourceDocumentId).toBe(DOCUMENT);
    expect(o.evidence.knowledgeSourceId).toBe(SOURCE);
  });
});

describe("reviewObservation", () => {
  function pending() {
    return unwrap(
      createKnowledgeObservation({
        id: KnowledgeObservationId.unsafe("kobs_REVIEW01"),
        ownerId: OWNER,
        observationType: "ENTITY",
        payload: entityPayload,
        evidence: evidence(),
        createdBy: "AI",
        now: T0,
      }),
    );
  }
  const reviewBase = {
    id: KnowledgeReviewId.unsafe("krev_AAAAAAA1"),
    reviewerId: REVIEWER,
    now: T1,
  };

  it("ACCEPT moves the observation to ACCEPTED and records the reviewer", () => {
    const { observation, review } = unwrap(
      reviewObservation(pending(), { ...reviewBase, outcome: "ACCEPT" }),
    );
    expect(observation.status).toBe("ACCEPTED");
    expect(observation.lockVersion).toBe(2);
    expect(review.outcome).toBe("ACCEPT");
    expect(review.reviewerId).toBe(REVIEWER);
    expect(review.editedPayload).toBeNull();
    expect(review.reviewedAt).toEqual(T1);
  });

  it("EDIT_AND_ACCEPT retains the edit and leaves the original payload immutable", () => {
    const observation = pending();
    const edited: ObservationPayload = {
      kind: "ENTITY",
      name: "Michael Kramer",
      entityKind: "person",
    };
    const result = unwrap(
      reviewObservation(observation, {
        ...reviewBase,
        outcome: "EDIT_AND_ACCEPT",
        editedPayload: edited,
      }),
    );
    expect(result.observation.status).toBe("ACCEPTED");
    expect(result.observation.payload).toEqual(entityPayload); // original unchanged
    expect(result.review.editedPayload).toEqual(edited);
  });

  it("REJECT moves the observation to REJECTED", () => {
    const { observation } = unwrap(
      reviewObservation(pending(), { ...reviewBase, outcome: "REJECT" }),
    );
    expect(observation.status).toBe("REJECTED");
  });

  it("EDIT_AND_ACCEPT without an edited payload is rejected", () => {
    const result = reviewObservation(pending(), { ...reviewBase, outcome: "EDIT_AND_ACCEPT" });
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.error).toBeInstanceOf(ReviewOutcomeError);
  });

  it("ACCEPT or REJECT carrying an edited payload is rejected", () => {
    const edit: ObservationPayload = { kind: "ENTITY", name: "X", entityKind: "person" };
    expect(
      reviewObservation(pending(), { ...reviewBase, outcome: "ACCEPT", editedPayload: edit }).ok,
    ).toBe(false);
    expect(
      reviewObservation(pending(), { ...reviewBase, outcome: "REJECT", editedPayload: edit }).ok,
    ).toBe(false);
  });

  it("rejects an edited payload whose kind differs from the observation type", () => {
    const mismatch: ObservationPayload = { kind: "MEMORY", content: "different kind" };
    const result = reviewObservation(pending(), {
      ...reviewBase,
      outcome: "EDIT_AND_ACCEPT",
      editedPayload: mismatch,
    });
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.error).toBeInstanceOf(ReviewOutcomeError);
  });

  it("cannot review an already-reviewed observation (accepted knowledge is not overwritten)", () => {
    const { observation } = unwrap(
      reviewObservation(pending(), { ...reviewBase, outcome: "ACCEPT" }),
    );
    const again = reviewObservation(observation, {
      ...reviewBase,
      id: KnowledgeReviewId.unsafe("krev_BBBBBBB2"),
      outcome: "REJECT",
    });
    expect(again.ok).toBe(false);
    if (!again.ok) expect(again.error).toBeInstanceOf(ObservationAlreadyReviewedError);
  });
});

describe("KnowledgeEngineRef", () => {
  it("builds a ref and rejects an empty record id", () => {
    const ref = unwrap(makeKnowledgeEngineRef("MEMORY", "mem_ABCDEF12"));
    expect(ref.recordType).toBe("MEMORY");
    expect(ref.recordId).toBe("mem_ABCDEF12");
    expect(makeKnowledgeEngineRef("ENTITY", "   ").ok).toBe(false);
  });
});
