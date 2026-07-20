import type { PrismaClient } from "@prisma/client";
import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";
import { resetAuthForTests, setRequestAuthenticatorForTests } from "@/server/composition";
import { createTestPrisma, resetDatabase } from "@test/db/integration-helpers";
import { TestAuthenticator } from "@test/adapters/test-auth";
import { call } from "@test/http/call";
import { GET as healthLive } from "../health/live/route";
import { GET as healthReady } from "../health/ready/route";
import { GET as getContentBySlug } from "./content/by-slug/[slug]/route";
import { POST as archiveContent } from "./content/[contentId]/archive/route";
import { POST as reviseContent } from "./content/[contentId]/revise/route";
import { POST as createContent } from "./content/route";
import { POST as publishContent } from "./content/[contentId]/publish/route";
import { GET as getDecision } from "./decisions/[decisionId]/route";
import { POST as proposeDecision } from "./decisions/route";
import { POST as attachAdvisory } from "./decisions/[decisionId]/advisory/route";
import { POST as decideDecision } from "./decisions/[decisionId]/decide/route";
import { GET as getEvaluation } from "./evaluations/[evaluationId]/route";
import { POST as recordEvaluation } from "./evaluations/route";
import { GET as getProject } from "./projects/[projectId]/route";
import { POST as activateProject } from "./projects/[projectId]/activate/route";
import { POST as archiveProject } from "./projects/[projectId]/archive/route";
import { POST as completeProject } from "./projects/[projectId]/complete/route";
import { GET as listProjectDecisions } from "./projects/[projectId]/decisions/route";
import { GET as listProjectEvaluations } from "./projects/[projectId]/evaluations/route";
import { GET as listProjects, POST as createProject } from "./projects/route";
import { GET as getRubric } from "./rubrics/[rubricId]/route";
import { POST as createRubric } from "./rubrics/route";

// Provider subjects (as a verified Supabase JWT would carry). The internal owner
// id is derived server-side and is NOT equal to these values.
const ACTOR = "subject-owner-a";
const OTHER = "subject-owner-b";

let prisma: PrismaClient;

beforeAll(() => {
  prisma = createTestPrisma();
  // Deterministic authenticator, injected ONLY via test composition.
  setRequestAuthenticatorForTests(new TestAuthenticator());
});
afterAll(async () => {
  resetAuthForTests();
  await prisma.$disconnect();
});
beforeEach(async () => {
  await resetDatabase(prisma);
});

async function makeProject(name = "Reel"): Promise<{ id: string; etag: string }> {
  const res = await call(createProject, { method: "POST", principal: ACTOR, json: { name } });
  expect(res.status).toBe(201);
  const id = (res.body as { id: string }).id;
  return { id, etag: res.headers.get("etag") ?? "" };
}

describe("authentication", () => {
  it("rejects an unauthenticated request (401 AUTHENTICATION_REQUIRED)", async () => {
    const res = await call(createProject, { method: "POST", json: { name: "X" } });
    expect(res.status).toBe(401);
    expect((res.body as { error: { code: string } }).error.code).toBe("AUTHENTICATION_REQUIRED");
    expect(res.headers.get("www-authenticate")).toBe("Bearer");
  });

  it("owner identity comes from the authenticated actor, not the body", async () => {
    // An "ownerId" in the body is an unknown field and is rejected by strict schema.
    const res = await call(createProject, {
      method: "POST",
      principal: ACTOR,
      json: { name: "X", ownerId: OTHER },
    });
    expect(res.status).toBe(400);
  });
});

describe("projects", () => {
  it("creates, returns an ETag and request id, and retrieves", async () => {
    const res = await call(createProject, {
      method: "POST",
      principal: ACTOR,
      requestId: "req-abc-1",
      json: { name: "Signature Dish Reel" },
    });
    expect(res.status).toBe(201);
    expect(res.headers.get("etag")).toBe('"project:1"');
    expect(res.headers.get("x-request-id")).toBe("req-abc-1");
    expect(res.headers.get("cache-control")).toBe("no-store");
    const body = res.body as { id: string; status: string };
    expect(body.status).toBe("DRAFT");

    const got = await call(getProject, { principal: ACTOR, params: { projectId: body.id } });
    expect(got.status).toBe(200);
    expect(got.headers.get("etag")).toBe('"project:1"');
  });

  it("lists the owner's projects with per-item tokens", async () => {
    await makeProject("A");
    await makeProject("B");
    const res = await call(listProjects, { principal: ACTOR });
    expect(res.status).toBe(200);
    const items = (res.body as { items: { concurrencyToken: string }[] }).items;
    expect(items).toHaveLength(2);
    expect(items[0]?.concurrencyToken).toBe('"project:1"');
  });

  it("400 for a malformed id, 404 for an unknown id", async () => {
    expect(
      (await call(getProject, { principal: ACTOR, params: { projectId: "bad" } })).status,
    ).toBe(400);
    const unknown = await call(getProject, {
      principal: ACTOR,
      params: { projectId: "proj_ZZZZZZZZ" },
    });
    expect(unknown.status).toBe(404);
    expect((unknown.body as { error: { code: string } }).error.code).toBe("NOT_FOUND");
  });

  it("denies access to a non-owner (403)", async () => {
    const project = await makeProject();
    const res = await call(getProject, { principal: OTHER, params: { projectId: project.id } });
    expect(res.status).toBe(403);
  });
});

describe("optimistic concurrency", () => {
  it("428 without If-Match, 200 with the current token, 409 when stale", async () => {
    const project = await makeProject();

    const missing = await call(activateProject, {
      method: "POST",
      principal: ACTOR,
      params: { projectId: project.id },
    });
    expect(missing.status).toBe(428);

    const ok = await call(activateProject, {
      method: "POST",
      principal: ACTOR,
      params: { projectId: project.id },
      ifMatch: project.etag,
    });
    expect(ok.status).toBe(200);
    expect(ok.headers.get("etag")).toBe('"project:2"');

    const stale = await call(archiveProject, {
      method: "POST",
      principal: ACTOR,
      params: { projectId: project.id },
      ifMatch: project.etag, // now stale
    });
    expect(stale.status).toBe(409);
    expect((stale.body as { error: { code: string } }).error.code).toBe("CONCURRENCY_CONFLICT");
  });

  it("rejects a malformed token and a token for another resource type (400)", async () => {
    const project = await makeProject();
    const malformed = await call(activateProject, {
      method: "POST",
      principal: ACTOR,
      params: { projectId: project.id },
      ifMatch: "not-a-token",
    });
    expect(malformed.status).toBe(400);
    const wrongType = await call(activateProject, {
      method: "POST",
      principal: ACTOR,
      params: { projectId: project.id },
      ifMatch: '"content:1"',
    });
    expect(wrongType.status).toBe(400);
  });
});

describe("content", () => {
  it("enforces slug uniqueness (409) and round-trips publish concurrency", async () => {
    const first = await call(createContent, {
      method: "POST",
      principal: ACTOR,
      json: { type: "PLAYBOOK", slug: "brand-doc", title: "Brand Doc" },
    });
    expect(first.status).toBe(201);
    expect(first.headers.get("etag")).toBe('"content:1"');

    const dup = await call(createContent, {
      method: "POST",
      principal: ACTOR,
      json: { type: "PLAYBOOK", slug: "brand-doc", title: "Another" },
    });
    expect(dup.status).toBe(409);

    const contentId = (first.body as { id: string }).id;
    const published = await call(publishContent, {
      method: "POST",
      principal: ACTOR,
      params: { contentId },
      ifMatch: '"content:1"',
    });
    expect(published.status).toBe(200);
    expect(published.headers.get("etag")).toBe('"content:2"');

    const stale = await call(publishContent, {
      method: "POST",
      principal: ACTOR,
      params: { contentId },
      ifMatch: '"content:1"',
    });
    expect(stale.status).toBe(409);
  });
});

describe("decisions", () => {
  async function makeDecision(): Promise<{ id: string; etag: string; projectId: string }> {
    const project = await makeProject("Decision Project");
    const res = await call(proposeDecision, {
      method: "POST",
      principal: ACTOR,
      json: {
        projectId: project.id,
        question: "Which opening?",
        options: [
          { id: "a", label: "Cold open" },
          { id: "b", label: "Interview open" },
        ],
      },
    });
    expect(res.status).toBe(201);
    return {
      id: (res.body as { id: string }).id,
      etag: res.headers.get("etag") ?? "",
      projectId: project.id,
    };
  }

  it("advisory never decides; only a human decide finalizes; stale finalize is rejected", async () => {
    const decision = await makeDecision();
    expect(decision.etag).toBe('"decision:1"');

    const advised = await call(attachAdvisory, {
      method: "POST",
      principal: ACTOR,
      params: { decisionId: decision.id },
      ifMatch: decision.etag,
      json: {
        recommendedOptionId: "a",
        rationale: "AI likes A",
        confidence: 0.9,
        evidence: [
          {
            sourceLabel: "Client brief",
            observation: "Fast hook wanted",
            relevance: "Cold open is faster",
          },
        ],
      },
    });
    expect(advised.status).toBe(200);
    const advisedBody = advised.body as {
      status: string;
      selectedOptionId: string | null;
      advisory: {
        evidence: Array<{ sourceLabel: string; observation: string; relevance: string }>;
      };
    };
    expect(advisedBody.status).toBe("PROPOSED");
    expect(advisedBody.selectedOptionId).toBeNull();
    // Supporting evidence round-trips through the advisory contract.
    expect(advisedBody.advisory.evidence).toHaveLength(1);
    expect(advisedBody.advisory.evidence[0]?.sourceLabel).toBe("Client brief");

    const decided = await call(decideDecision, {
      method: "POST",
      principal: ACTOR,
      params: { decisionId: decision.id },
      ifMatch: advised.headers.get("etag") ?? "",
      json: { selectedOptionId: "b", rationale: "Interview open sets stakes faster" },
    });
    expect(decided.status).toBe(200);
    const decidedBody = decided.body as {
      status: string;
      selectedOptionId: string;
      decidedBy: string;
    };
    expect(decidedBody.status).toBe("DECIDED");
    expect(decidedBody.selectedOptionId).toBe("b");
    // decidedBy is the server-derived internal owner id (never the provider subject).
    expect(decidedBody.decidedBy).toMatch(/^usr_/);
    expect(decidedBody.decidedBy).not.toBe(ACTOR);

    // A duplicate finalization with the old token cannot overwrite the decision.
    const stale = await call(decideDecision, {
      method: "POST",
      principal: ACTOR,
      params: { decisionId: decision.id },
      ifMatch: decision.etag,
      json: { selectedOptionId: "a", rationale: "changed my mind" },
    });
    expect(stale.status).toBe(409);
  });
});

describe("rubrics and evaluations", () => {
  it("creates a rubric and records an evaluation against a project", async () => {
    const project = await makeProject("Eval Project");
    const rubricRes = await call(createRubric, {
      method: "POST",
      principal: ACTOR,
      json: {
        slug: "story-quality",
        title: "Story Quality",
        criteria: [
          { name: "Clarity", weight: 1, anchors: { one: "poor", five: "ok", ten: "great" } },
        ],
      },
    });
    expect(rubricRes.status).toBe(201);
    const rubric = rubricRes.body as { id: string; criteria: { id: string }[] };

    const evalRes = await call(recordEvaluation, {
      method: "POST",
      principal: ACTOR,
      json: {
        projectId: project.id,
        rubricId: rubric.id,
        reviewerType: "HUMAN",
        scores: [
          { criterionId: rubric.criteria[0]?.id, score: 8, justification: "clear structure" },
        ],
      },
    });
    expect(evalRes.status).toBe(201);
    expect((evalRes.body as { scores: unknown[] }).scores).toHaveLength(1);
  });
});

describe("request handling", () => {
  it("returns 400 for validation failure with field details", async () => {
    const res = await call(createProject, { method: "POST", principal: ACTOR, json: {} });
    expect(res.status).toBe(400);
    const body = res.body as { error: { code: string; fields?: unknown[]; requestId: string } };
    expect(body.error.code).toBe("VALIDATION_FAILED");
    expect(Array.isArray(body.error.fields)).toBe(true);
    expect(typeof body.error.requestId).toBe("string");
  });

  it("returns 400 for malformed JSON and 415 for the wrong media type", async () => {
    const malformed = await call(createProject, {
      method: "POST",
      principal: ACTOR,
      rawBody: "{not json",
    });
    expect(malformed.status).toBe(400);
    expect((malformed.body as { error: { code: string } }).error.code).toBe("MALFORMED_JSON");

    const wrongType = await call(createProject, {
      method: "POST",
      principal: ACTOR,
      rawBody: "{}",
      contentType: "text/plain",
    });
    expect(wrongType.status).toBe(415);
  });

  it("never leaks infrastructure detail in errors", async () => {
    const res = await call(getProject, {
      principal: ACTOR,
      params: { projectId: "proj_ZZZZZZZZ" },
    });
    const serialized = JSON.stringify(res.body).toLowerCase();
    expect(serialized).not.toContain("prisma");
    expect(serialized).not.toContain("select");
    expect(serialized).not.toContain("stack");
    expect(serialized).not.toContain("postgres");
  });
});

describe("read routes coverage (real HTTP + PostgreSQL)", () => {
  it("GET content by slug", async () => {
    await call(createContent, {
      method: "POST",
      principal: ACTOR,
      json: { type: "PLAYBOOK", slug: "how-to-reel", title: "How To Reel" },
    });
    const res = await call(getContentBySlug, { principal: ACTOR, params: { slug: "how-to-reel" } });
    expect(res.status).toBe(200);
    expect((res.body as { slug: string }).slug).toBe("how-to-reel");
    expect(res.headers.get("etag")).toBe('"content:1"');
    expect(res.headers.get("cache-control")).toBe("no-store");
  });

  async function seedEvaluation(): Promise<{ evaluationId: string; projectId: string }> {
    const project = await makeProject("Eval Read Project");
    const rubricRes = await call(createRubric, {
      method: "POST",
      principal: ACTOR,
      json: {
        slug: "read-quality",
        title: "Read Quality",
        criteria: [{ name: "Clarity", weight: 1, anchors: { one: "p", five: "o", ten: "g" } }],
      },
    });
    const rubric = rubricRes.body as { id: string; criteria: { id: string }[] };
    const evalRes = await call(recordEvaluation, {
      method: "POST",
      principal: ACTOR,
      json: {
        projectId: project.id,
        rubricId: rubric.id,
        reviewerType: "HUMAN",
        scores: [{ criterionId: rubric.criteria[0]?.id, score: 7, justification: "ok" }],
      },
    });
    return { evaluationId: (evalRes.body as { id: string }).id, projectId: project.id };
  }

  it("GET evaluation by id, and list evaluations by project (owner-scoped)", async () => {
    const { evaluationId, projectId } = await seedEvaluation();

    const one = await call(getEvaluation, { principal: ACTOR, params: { evaluationId } });
    expect(one.status).toBe(200);
    expect((one.body as { id: string }).id).toBe(evaluationId);
    expect(one.headers.get("x-request-id")).toBeTruthy();

    const list = await call(listProjectEvaluations, { principal: ACTOR, params: { projectId } });
    expect(list.status).toBe(200);
    expect((list.body as { items: unknown[] }).items).toHaveLength(1);

    // Ownership: another actor cannot list this project's evaluations.
    const denied = await call(listProjectEvaluations, { principal: OTHER, params: { projectId } });
    expect(denied.status).toBe(403);
  });

  it("GET decision by id, and list decisions by project (owner-scoped, item tokens)", async () => {
    const project = await makeProject("Decision Read Project");
    const proposed = await call(proposeDecision, {
      method: "POST",
      principal: ACTOR,
      json: {
        projectId: project.id,
        question: "Which?",
        options: [
          { id: "a", label: "A" },
          { id: "b", label: "B" },
        ],
      },
    });
    const decisionId = (proposed.body as { id: string }).id;

    const one = await call(getDecision, { principal: ACTOR, params: { decisionId } });
    expect(one.status).toBe(200);
    expect(one.headers.get("etag")).toBe('"decision:1"');

    const list = await call(listProjectDecisions, {
      principal: ACTOR,
      params: { projectId: project.id },
    });
    expect(list.status).toBe(200);
    const items = (list.body as { items: { concurrencyToken: string }[] }).items;
    expect(items).toHaveLength(1);
    expect(items[0]?.concurrencyToken).toBe('"decision:1"');

    const denied = await call(listProjectDecisions, {
      principal: OTHER,
      params: { projectId: project.id },
    });
    expect(denied.status).toBe(403);
  });

  it("health endpoints respond (live without a DB, ready with one)", async () => {
    const live = await healthLive();
    expect(live.status).toBe(200);
    expect((await live.json()).status).toBe("ok");

    const ready = await healthReady();
    expect(ready.status).toBe(200);
    expect((await ready.json()).status).toBe("ready");
  });
});

describe("remaining lifecycle route wiring (real HTTP + PostgreSQL)", () => {
  it("completes a project (activate → complete)", async () => {
    const project = await makeProject("Complete Me");
    const activated = await call(activateProject, {
      method: "POST",
      principal: ACTOR,
      params: { projectId: project.id },
      ifMatch: project.etag,
    });
    const completed = await call(completeProject, {
      method: "POST",
      principal: ACTOR,
      params: { projectId: project.id },
      ifMatch: activated.headers.get("etag") ?? "",
    });
    expect(completed.status).toBe(200);
    expect((completed.body as { status: string }).status).toBe("COMPLETED");
  });

  it("archives a DRAFT project", async () => {
    const project = await makeProject("Archive Me");
    const res = await call(archiveProject, {
      method: "POST",
      principal: ACTOR,
      params: { projectId: project.id },
      ifMatch: project.etag,
    });
    expect(res.status).toBe(200);
    expect((res.body as { status: string }).status).toBe("ARCHIVED");
    expect(res.headers.get("etag")).toBe('"project:2"');
  });

  async function makeContent(slug: string): Promise<{ id: string; etag: string }> {
    const res = await call(createContent, {
      method: "POST",
      principal: ACTOR,
      json: { type: "PLAYBOOK", slug, title: "T" },
    });
    return { id: (res.body as { id: string }).id, etag: res.headers.get("etag") ?? "" };
  }

  it("revises content (version increments, returns to DRAFT)", async () => {
    const content = await makeContent("revise-me");
    const res = await call(reviseContent, {
      method: "POST",
      principal: ACTOR,
      params: { contentId: content.id },
      ifMatch: content.etag,
    });
    expect(res.status).toBe(200);
    const body = res.body as { version: number; status: string };
    expect(body.version).toBe(2);
    expect(body.status).toBe("DRAFT");
  });

  it("archives content", async () => {
    const content = await makeContent("archive-content");
    const res = await call(archiveContent, {
      method: "POST",
      principal: ACTOR,
      params: { contentId: content.id },
      ifMatch: content.etag,
    });
    expect(res.status).toBe(200);
    expect((res.body as { status: string }).status).toBe("ARCHIVED");
  });

  it("gets a rubric by id", async () => {
    const created = await call(createRubric, {
      method: "POST",
      principal: ACTOR,
      json: {
        slug: "get-rubric",
        title: "Get Rubric",
        criteria: [{ name: "C", weight: 2, anchors: { one: "a", five: "b", ten: "c" } }],
      },
    });
    const rubricId = (created.body as { id: string }).id;
    const res = await call(getRubric, { principal: ACTOR, params: { rubricId } });
    expect(res.status).toBe(200);
    expect((res.body as { id: string }).id).toBe(rubricId);
    expect((res.body as { criteria: unknown[] }).criteria).toHaveLength(1);
  });
});
