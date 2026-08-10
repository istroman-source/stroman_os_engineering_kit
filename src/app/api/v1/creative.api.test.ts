import type { PrismaClient } from "@prisma/client";
import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";
import { resetAuthForTests, setRequestAuthenticatorForTests } from "@/server/composition";
import { createTestPrisma, resetDatabase } from "@test/db/integration-helpers";
import { TestAuthenticator } from "@test/adapters/test-auth";
import { call } from "@test/http/call";
import { POST as createProject } from "./projects/route";
import { GET as getAnalysis, POST as analyzeProject } from "./projects/[projectId]/analysis/route";

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
beforeEach(async () => {
  await resetDatabase(prisma);
});

async function makeProject(principal = ACTOR): Promise<string> {
  const res = await call(createProject, { method: "POST", principal, json: { name: "Reel" } });
  expect(res.status).toBe(201);
  return (res.body as { id: string }).id;
}

const brief = {
  title: "Morning routine of an everyday mom who eats Jimmy's Famous Meals",
  client: "Jimmy's Famous Meals",
  projectType: "Commercial",
  creativeGoal: "Conversion",
  targetAudience: "Parents who need convenience",
  desiredEmotion: "Understood, relatable, sentimental",
  context:
    "An everyday mother and her eight-month-old baby. Do not show the baby's face. Hands and feet are allowed.",
};

describe("Analyze Project (real HTTP + PostgreSQL)", () => {
  it("404 before analysis; analyzes into a blueprint; then GET returns it", async () => {
    const projectId = await makeProject();

    const before = await call(getAnalysis, { principal: ACTOR, params: { projectId } });
    expect(before.status).toBe(404);

    const analyzed = await call(analyzeProject, {
      method: "POST",
      principal: ACTOR,
      params: { projectId },
      json: brief,
    });
    expect(analyzed.status).toBe(200);
    const body = analyzed.body as {
      brief: { title: string; projectId: string };
      blueprint: {
        hookConcepts: unknown[];
        interviewStrategy: unknown;
        development: { directionDecision: { title: string } };
      };
    };
    expect(body.brief.title).toContain("Jimmy's Famous Meals");
    expect(body.brief.projectId).toBe(projectId);
    expect(body.blueprint.hookConcepts).toHaveLength(3);
    expect(body.blueprint.interviewStrategy).toBeNull();
    expect(body.blueprint).not.toHaveProperty("masterPrompt");
    expect(body.blueprint.development.directionDecision.title).toBe("The first quiet bite");

    const after = await call(getAnalysis, { principal: ACTOR, params: { projectId } });
    expect(after.status).toBe(200);
    expect((after.body as { brief: { title: string } }).brief.title).toContain(
      "Jimmy's Famous Meals",
    );
  });

  it("re-analysis replaces the brief (one brief per project)", async () => {
    const projectId = await makeProject();
    await call(analyzeProject, {
      method: "POST",
      principal: ACTOR,
      params: { projectId },
      json: brief,
    });
    const again = await call(analyzeProject, {
      method: "POST",
      principal: ACTOR,
      params: { projectId },
      json: { ...brief, desiredEmotion: "nostalgic" },
    });
    expect(again.status).toBe(200);
    expect((again.body as { brief: { desiredEmotion: string } }).brief.desiredEmotion).toBe(
      "nostalgic",
    );
    expect(await prisma.creativeBrief.count()).toBe(1);
  });

  it("fails closed for an unsupported deterministic documentary draft", async () => {
    const projectId = await makeProject();
    const res = await call(analyzeProject, {
      method: "POST",
      principal: ACTOR,
      params: { projectId },
      json: { ...brief, projectType: "brand documentary with founder interview" },
    });
    expect(res.status).toBe(503);
    expect(await prisma.creativeBrief.count()).toBe(0);
  });

  it("denies analyzing or viewing another owner's project (403)", async () => {
    const projectId = await makeProject(ACTOR);
    const post = await call(analyzeProject, {
      method: "POST",
      principal: OTHER,
      params: { projectId },
      json: brief,
    });
    expect(post.status).toBe(403);
    await call(analyzeProject, {
      method: "POST",
      principal: ACTOR,
      params: { projectId },
      json: brief,
    });
    const get = await call(getAnalysis, { principal: OTHER, params: { projectId } });
    expect(get.status).toBe(403);
  });

  it("rejects an unverified title-only fallback and a missing title", async () => {
    const projectId = await makeProject();
    const ideaOnly = await call(analyzeProject, {
      method: "POST",
      principal: ACTOR,
      params: { projectId },
      json: {
        title: "A baker teaches his daughter the family recipe before selling the bakery",
      },
    });
    expect(ideaOnly.status).toBe(503);
    expect(await prisma.creativeBrief.count()).toBe(0);

    const invalid = await call(analyzeProject, {
      method: "POST",
      principal: ACTOR,
      params: { projectId },
      json: { title: "" },
    });
    expect(invalid.status).toBe(400);
  });
});
