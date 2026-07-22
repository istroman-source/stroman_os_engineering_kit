import { readFileSync } from "node:fs";
import type { PrismaClient } from "@prisma/client";
import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";
import { resetAuthForTests, setRequestAuthenticatorForTests } from "@/server/composition";
import { TestAuthenticator } from "@test/adapters/test-auth";
import { createTestPrisma, resetDatabase } from "@test/db/integration-helpers";
import { call } from "@test/http/call";
import { POST as startRun } from "./acquisition-runs/[runId]/start/route";
import { POST as completeRun } from "./acquisition-runs/[runId]/complete/route";
import { POST as failRun } from "./acquisition-runs/[runId]/fail/route";
import { GET as observationsByRun } from "./acquisition-runs/[runId]/observations/route";
import { GET as observationsByDocument } from "./source-documents/[documentId]/observations/route";
import { GET as getSource } from "./knowledge-sources/[sourceId]/route";
import { POST as pauseSource } from "./knowledge-sources/[sourceId]/pause/route";
import { POST as resumeSource } from "./knowledge-sources/[sourceId]/resume/route";
import { POST as archiveSource } from "./knowledge-sources/[sourceId]/archive/route";
import {
  GET as listDocuments,
  POST as addDocument,
} from "./knowledge-sources/[sourceId]/documents/route";
import { GET as listRuns, POST as createRun } from "./knowledge-sources/[sourceId]/runs/route";
import { GET as listSources, POST as createSource } from "./knowledge-sources/route";
import { GET as getObservation } from "./knowledge-observations/[observationId]/route";
import { POST as reviewObservation } from "./knowledge-observations/[observationId]/review/route";
import { POST as materializeObservation } from "./knowledge-observations/[observationId]/materialize/route";
import { POST as createObservation } from "./knowledge-observations/route";

const ACTOR = "subject-owner-a";
const OTHER = "subject-owner-b";
let prisma: PrismaClient;

beforeAll(() => {
  prisma = createTestPrisma();
  setRequestAuthenticatorForTests(new TestAuthenticator());
});
afterAll(async () => {
  resetAuthForTests();
  await prisma.$disconnect();
});
beforeEach(async () => resetDatabase(prisma));

const bodyId = (body: unknown) => (body as { id: string }).id;
async function source(principal = ACTOR) {
  const response = await call(createSource, {
    method: "POST",
    principal,
    json: {
      name: "Founder interviews",
      sourceType: "UPLOAD",
      sourceReliability: "VERIFIED",
    },
  });
  expect(response.status).toBe(201);
  return { id: bodyId(response.body), etag: response.headers.get("etag")! };
}
async function document(sourceId: string, hash = "sha256:document") {
  const response = await call(addDocument, {
    method: "POST",
    principal: ACTOR,
    params: { sourceId },
    json: { documentType: "TRANSCRIPT", contentHash: hash, title: "Interview" },
  });
  expect(response.status).toBe(201);
  return bodyId(response.body);
}
async function run(sourceId: string) {
  const response = await call(createRun, {
    method: "POST",
    principal: ACTOR,
    params: { sourceId },
    json: { extractor: "manual", extractorVersion: "1" },
  });
  expect(response.status).toBe(201);
  return { id: bodyId(response.body), etag: response.headers.get("etag")! };
}
async function observation(
  sourceId: string,
  documentId: string,
  payload: unknown = { kind: "ENTITY", name: "Michael", entityKind: "person" },
  runId?: string,
) {
  const response = await call(createObservation, {
    method: "POST",
    principal: ACTOR,
    json: {
      knowledgeSourceId: sourceId,
      sourceDocumentId: documentId,
      acquisitionRunId: runId,
      payload,
      createdBy: "HUMAN",
    },
  });
  expect(response.status).toBe(201);
  return { id: bodyId(response.body), etag: response.headers.get("etag")! };
}

describe("Knowledge Acquisition HTTP delivery", () => {
  it("rejects unauthenticated access and identity/concurrency fields", async () => {
    expect((await call(listSources)).status).toBe(401);
    for (const field of ["ownerId", "actorId", "reviewerId", "lockVersion"] as const) {
      const response = await call(createSource, {
        method: "POST",
        principal: ACTOR,
        json: {
          name: "Source",
          sourceType: "MANUAL",
          sourceReliability: "UNKNOWN",
          [field]: field === "lockVersion" ? 1 : OTHER,
        },
      });
      expect(response.status).toBe(400);
    }
  });

  it("creates, lists, gets, and transitions sources with ETag concurrency", async () => {
    const created = await source();
    expect(created.etag).toBe('"knowledgesource:1"');
    const listed = await call(listSources, { principal: ACTOR });
    expect((listed.body as { items: unknown[] }).items).toHaveLength(1);
    const got = await call(getSource, { principal: ACTOR, params: { sourceId: created.id } });
    expect(got.headers.get("etag")).toBe(created.etag);
    expect(JSON.stringify(got.body)).not.toMatch(/ownerId|lockVersion/);

    expect(
      (
        await call(pauseSource, {
          method: "POST",
          principal: ACTOR,
          params: { sourceId: created.id },
        })
      ).status,
    ).toBe(428);
    expect(
      (
        await call(pauseSource, {
          method: "POST",
          principal: ACTOR,
          params: { sourceId: created.id },
          ifMatch: "bad",
        })
      ).status,
    ).toBe(400);
    const paused = await call(pauseSource, {
      method: "POST",
      principal: ACTOR,
      params: { sourceId: created.id },
      ifMatch: created.etag,
    });
    expect(paused.headers.get("etag")).toBe('"knowledgesource:2"');
    expect(
      (
        await call(archiveSource, {
          method: "POST",
          principal: ACTOR,
          params: { sourceId: created.id },
          ifMatch: created.etag,
        })
      ).status,
    ).toBe(409);
    const resumed = await call(resumeSource, {
      method: "POST",
      principal: ACTOR,
      params: { sourceId: created.id },
      ifMatch: '"knowledgesource:2"',
    });
    expect(resumed.status).toBe(200);
    const archived = await call(archiveSource, {
      method: "POST",
      principal: ACTOR,
      params: { sourceId: created.id },
      ifMatch: '"knowledgesource:3"',
    });
    expect(archived.status).toBe(200);
    expect(
      (
        await call(pauseSource, {
          method: "POST",
          principal: ACTOR,
          params: { sourceId: created.id },
          ifMatch: '"knowledgesource:4"',
        })
      ).status,
    ).toBe(409);
  });

  it("adds and lists documents idempotently and isolates source ownership", async () => {
    const created = await source();
    const first = await document(created.id);
    const second = await document(created.id);
    expect(second).toBe(first);
    expect(await prisma.sourceDocument.count()).toBe(1);
    const listed = await call(listDocuments, {
      principal: ACTOR,
      params: { sourceId: created.id },
    });
    expect((listed.body as { items: unknown[] }).items).toHaveLength(1);
    expect(
      (await call(listDocuments, { principal: OTHER, params: { sourceId: created.id } })).status,
    ).toBe(403);
  });

  it("creates, lists, starts, completes, and fails runs", async () => {
    const created = await source();
    const completed = await run(created.id);
    expect(
      (await call(listRuns, { principal: ACTOR, params: { sourceId: created.id } })).status,
    ).toBe(200);
    const started = await call(startRun, {
      method: "POST",
      principal: ACTOR,
      params: { runId: completed.id },
      ifMatch: completed.etag,
    });
    expect(started.headers.get("etag")).toBe('"acquisitionrun:2"');
    const finished = await call(completeRun, {
      method: "POST",
      principal: ACTOR,
      params: { runId: completed.id },
      ifMatch: '"acquisitionrun:2"',
      json: {
        status: "SUCCEEDED",
        summary: { documentsProcessed: 1, observationsCreated: 1, failureCount: 0 },
      },
    });
    expect(finished.status).toBe(200);
    const failed = await run(created.id);
    expect(
      (
        await call(failRun, {
          method: "POST",
          principal: ACTOR,
          params: { runId: failed.id },
          ifMatch: failed.etag,
        })
      ).status,
    ).toBe(200);
    expect(
      (
        await call(startRun, {
          method: "POST",
          principal: OTHER,
          params: { runId: failed.id },
          ifMatch: '"acquisitionrun:2"',
        })
      ).status,
    ).toBe(403);
  });

  it("creates, gets, and lists observations by run and document without private fields", async () => {
    const created = await source();
    const doc = await document(created.id);
    const acquisition = await run(created.id);
    const obs = await observation(created.id, doc, undefined, acquisition.id);
    const got = await call(getObservation, { principal: ACTOR, params: { observationId: obs.id } });
    expect(got.status).toBe(200);
    expect(got.headers.get("etag")).toBe('"knowledgeobservation:1"');
    expect(JSON.stringify(got.body)).not.toMatch(/ownerId|lockVersion/);
    expect(
      (await call(observationsByRun, { principal: ACTOR, params: { runId: acquisition.id } }))
        .status,
    ).toBe(200);
    expect(
      (await call(observationsByDocument, { principal: ACTOR, params: { documentId: doc } }))
        .status,
    ).toBe(200);
    expect(
      (await call(getObservation, { principal: OTHER, params: { observationId: obs.id } })).status,
    ).toBe(403);
  });

  it.each([
    ["ACCEPT", undefined],
    ["EDIT_AND_ACCEPT", { kind: "ENTITY", name: "Edited", entityKind: "person" }],
    ["REJECT", undefined],
  ] as const)("supports the %s review outcome", async (outcome, editedPayload) => {
    const created = await source();
    const doc = await document(created.id);
    const obs = await observation(created.id, doc);
    const reviewed = await call(reviewObservation, {
      method: "POST",
      principal: ACTOR,
      params: { observationId: obs.id },
      ifMatch: obs.etag,
      json: { outcome, editedPayload },
    });
    expect(reviewed.status).toBe(200);
    expect(reviewed.headers.get("etag")).toBe('"knowledgeobservation:2"');
  });

  it("materializes accepted and edited observations idempotently", async () => {
    const created = await source();
    const doc = await document(created.id);
    const obs = await observation(created.id, doc);
    await call(reviewObservation, {
      method: "POST",
      principal: ACTOR,
      params: { observationId: obs.id },
      ifMatch: obs.etag,
      json: {
        outcome: "EDIT_AND_ACCEPT",
        editedPayload: { kind: "ENTITY", name: "Edited", entityKind: "person" },
      },
    });
    const options = {
      method: "POST" as const,
      principal: ACTOR,
      params: { observationId: obs.id },
      json: { resolution: { kind: "ENTITY" } },
    };
    const first = await call(materializeObservation, options);
    const second = await call(materializeObservation, options);
    expect(first.status).toBe(200);
    expect(second.body).toEqual(first.body);
    expect(await prisma.entity.count()).toBe(1);
    expect(await prisma.entity.findFirst()).toMatchObject({ name: "Edited" });
    expect(await prisma.observationMaterialization.count()).toBe(1);
  });

  it("rejects pending, rejected, mismatched, and foreign materialization", async () => {
    const created = await source();
    const doc = await document(created.id);
    const pending = await observation(created.id, doc);
    const request = (id: string, principal = ACTOR, kind = "ENTITY") =>
      call(materializeObservation, {
        method: "POST",
        principal,
        params: { observationId: id },
        json: {
          resolution: kind === "MEMORY" ? { kind, entityId: "ent_00000001" } : { kind },
        },
      });
    expect((await request(pending.id)).status).toBe(409);
    expect((await request(pending.id, OTHER)).status).toBe(403);
    await call(reviewObservation, {
      method: "POST",
      principal: ACTOR,
      params: { observationId: pending.id },
      ifMatch: pending.etag,
      json: { outcome: "REJECT" },
    });
    expect((await request(pending.id)).status).toBe(409);

    const accepted = await observation(created.id, doc);
    await call(reviewObservation, {
      method: "POST",
      principal: ACTOR,
      params: { observationId: accepted.id },
      ifMatch: accepted.etag,
      json: { outcome: "ACCEPT" },
    });
    expect((await request(accepted.id, ACTOR, "MEMORY")).status).toBe(422);
  });

  it("documents every Knowledge Acquisition path in OpenAPI", () => {
    const contract = readFileSync("docs/openapi/stroman-os-v1.yaml", "utf8");
    for (const path of [
      "/api/v1/knowledge-sources",
      "/api/v1/knowledge-sources/{sourceId}",
      "/api/v1/knowledge-sources/{sourceId}/pause",
      "/api/v1/knowledge-sources/{sourceId}/resume",
      "/api/v1/knowledge-sources/{sourceId}/archive",
      "/api/v1/knowledge-sources/{sourceId}/documents",
      "/api/v1/knowledge-sources/{sourceId}/runs",
      "/api/v1/acquisition-runs/{runId}/start",
      "/api/v1/acquisition-runs/{runId}/complete",
      "/api/v1/acquisition-runs/{runId}/fail",
      "/api/v1/acquisition-runs/{runId}/observations",
      "/api/v1/source-documents/{documentId}/observations",
      "/api/v1/knowledge-observations",
      "/api/v1/knowledge-observations/{observationId}",
      "/api/v1/knowledge-observations/{observationId}/review",
      "/api/v1/knowledge-observations/{observationId}/materialize",
    ])
      expect(contract).toContain(`  ${path}:`);
  });
});
