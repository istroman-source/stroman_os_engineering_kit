import type { KnowledgeObservation } from "@prisma/client";
import { describe, expect, it } from "vitest";
import { PersistenceMappingError } from "../errors";
import { toKnowledgeObservation } from "./knowledge-acquisition-mappers";

const row = (): KnowledgeObservation => ({
  id: "kobs_AAAAAAA1",
  ownerId: "usr_AAAAAAAA",
  observationType: "ENTITY",
  payload: { kind: "ENTITY", name: "Michael", entityKind: "person" },
  sourceDocumentId: "sdoc_AAAAAAA1",
  knowledgeSourceId: "ksrc_AAAAAAA1",
  acquisitionRunId: null,
  location: null,
  confidence: null,
  createdBy: "AI",
  status: "PENDING_REVIEW",
  createdAt: new Date("2026-07-21T00:00:00Z"),
  lockVersion: 1,
});

describe("knowledge acquisition persistence mapping", () => {
  it("maps an unknown payload kind to PersistenceMappingError", () => {
    expect(() => toKnowledgeObservation({ ...row(), payload: { kind: "UNKNOWN" } })).toThrow(
      PersistenceMappingError,
    );
  });

  it("maps an observation type and payload kind mismatch to PersistenceMappingError", () => {
    expect(() =>
      toKnowledgeObservation({
        ...row(),
        payload: { kind: "MEMORY", content: "Fact" },
      }),
    ).toThrow(PersistenceMappingError);
  });
});
