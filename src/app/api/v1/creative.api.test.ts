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
  title: "Signature Dish Reel",
  client: "Jimmy's Famous Seafood",
  projectType: "Instagram reel",
  creativeGoal: "make viewers crave the crab cake",
  targetAudience: "Baltimore food lovers",
  desiredEmotion: "hungry",
  context: "20s vertical, fast cuts.",
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
      blueprint: { hookConcepts: unknown[]; interviewStrategy: unknown; masterPrompt: string };
    };
    expect(body.brief.title).toBe("Signature Dish Reel");
    expect(body.brief.projectId).toBe(projectId);
    expect(body.blueprint.hookConcepts).toHaveLength(3);
    expect(body.blueprint.interviewStrategy).toBeNull(); // reel → no interviews
    expect(body.blueprint.masterPrompt).toContain("hungry");

    const after = await call(getAnalysis, { principal: ACTOR, params: { projectId } });
    expect(after.status).toBe(200);
    expect((after.body as { brief: { title: string } }).brief.title).toBe("Signature Dish Reel");
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

  it("includes interview strategy for a documentary format", async () => {
    const projectId = await makeProject();
    const res = await call(analyzeProject, {
      method: "POST",
      principal: ACTOR,
      params: { projectId },
      json: { ...brief, projectType: "brand documentary with founder interview" },
    });
    expect(
      (res.body as { blueprint: { interviewStrategy: unknown[] } }).blueprint.interviewStrategy,
    ).not.toBeNull();
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

  it("rejects an incomplete brief (400)", async () => {
    const projectId = await makeProject();
    const res = await call(analyzeProject, {
      method: "POST",
      principal: ACTOR,
      params: { projectId },
      json: { title: "Only a title" },
    });
    expect(res.status).toBe(400);
  });
});
