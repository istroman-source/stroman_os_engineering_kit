import type { PrismaClient } from "@prisma/client";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";
import { resetAuthForTests, setRequestAuthenticatorForTests } from "@/server/composition";
import { createTestPrisma, resetDatabase } from "@test/db/integration-helpers";
import { TestAuthenticator } from "@test/adapters/test-auth";
import { call } from "@test/http/call";
import { POST as createProject } from "./projects/route";
import { GET as getAnalysis, POST as analyzeProject } from "./projects/[projectId]/analysis/route";
import { POST as updatePlanning } from "./projects/[projectId]/planning/route";
import { POST as uploadScoutPhotos } from "./projects/[projectId]/scout-photos/route";
import { GET as getScoutPhoto } from "./projects/[projectId]/scout-photos/[mediaAssetId]/route";

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

  it("persists stage and production reality without rerunning creative intent", async () => {
    const projectId = await makeProject();
    await call(analyzeProject, {
      method: "POST",
      principal: ACTOR,
      params: { projectId },
      json: brief,
    });
    const planned = await call(updatePlanning, {
      method: "POST",
      principal: ACTOR,
      params: { projectId },
      json: {
        stage: "PRE_PRODUCTION",
        production: { crew: "solo operator", support: "tripod only" },
      },
    });
    expect(planned.status).toBe(200);
    expect(planned.body).toMatchObject({
      brief: { planningContext: { stage: "PRE_PRODUCTION" } },
      blueprint: {
        development: {
          directionDecision: { title: "The first quiet bite" },
          visualPlan: {
            stage: "PRE_PRODUCTION",
            productionReality: { crew: "solo operator", support: "tripod only" },
          },
        },
      },
    });
  });

  it("imports two scout photos, grounds the plan, and serves only the owned image", async () => {
    const projectId = await makeProject();
    await call(analyzeProject, {
      method: "POST",
      principal: ACTOR,
      params: { projectId },
      json: brief,
    });
    const threshold = readFileSync(resolve("public/evaluations/scout-kitchen/threshold-angle.png"));
    const reverse = readFileSync(resolve("public/evaluations/scout-kitchen/reverse-angle.png"));
    const form = new FormData();
    form.append("files", new File([threshold], "threshold-angle.png", { type: "image/png" }));
    form.append("files", new File([reverse], "reverse-angle.png", { type: "image/png" }));
    const uploaded = await call(uploadScoutPhotos, {
      method: "POST",
      principal: ACTOR,
      params: { projectId },
      body: form,
      headers: { "content-length": String(threshold.byteLength + reverse.byteLength + 4096) },
    });
    expect(uploaded.status).toBe(200);
    const result = uploaded.body as {
      brief: { planningContext: { scoutPhotos: { mediaAssetId: string }[] } };
      blueprint: { development: { visualPlan: { location: { mode: string; claims: unknown[] } } } };
    };
    expect(result.brief.planningContext.scoutPhotos).toHaveLength(2);
    expect(result.blueprint.development.visualPlan.location).toMatchObject({
      mode: "PHOTO_ANCHORED",
      claims: expect.arrayContaining([expect.objectContaining({ state: "VISIBLE_FACT" })]),
    });
    const mediaAssetId = result.brief.planningContext.scoutPhotos[0]!.mediaAssetId;
    const owned = await getScoutPhoto(
      new Request("http://localhost/api", { headers: { "x-test-principal": ACTOR } }),
      { params: Promise.resolve({ projectId, mediaAssetId }) },
    );
    expect(owned.status).toBe(200);
    expect(owned.headers.get("content-type")).toBe("image/png");
    expect((await owned.arrayBuffer()).byteLength).toBe(threshold.byteLength);
    const denied = await getScoutPhoto(
      new Request("http://localhost/api", { headers: { "x-test-principal": OTHER } }),
      { params: Promise.resolve({ projectId, mediaAssetId }) },
    );
    expect(denied.status).toBe(404);
  });

  it("stores an arbitrary scout image as geometry-pending without inventing layout", async () => {
    const projectId = await makeProject();
    await call(analyzeProject, {
      method: "POST",
      principal: ACTOR,
      params: { projectId },
      json: brief,
    });
    const bytes = new Uint8Array([137, 80, 78, 71, 13, 10, 26, 10, 1, 2, 3]);
    const form = new FormData();
    form.append("files", new File([bytes], "real-scout.png", { type: "image/png" }));
    const uploaded = await call(uploadScoutPhotos, {
      method: "POST",
      principal: ACTOR,
      params: { projectId },
      body: form,
      headers: { "content-length": "4096" },
    });
    expect(uploaded.status).toBe(200);
    expect(uploaded.body).toMatchObject({
      brief: { planningContext: { scoutPhotos: [{ fileName: "real-scout.png" }] } },
      blueprint: {
        development: {
          visualPlan: {
            location: {
              mode: "PHOTO_INPUT_PENDING",
              claims: [
                {
                  state: "VISIBLE_FACT",
                  label: "Scout image set received",
                  evidencePhotoIds: expect.any(Array),
                },
              ],
            },
          },
        },
      },
    });
    expect(JSON.stringify(uploaded.body)).not.toMatch(/window over sink|reverse camera lane/i);
  });

  it("rejects scout input before development without retaining an orphaned import", async () => {
    const projectId = await makeProject();
    const form = new FormData();
    form.append("files", new File([new Uint8Array([1, 2, 3])], "early.png", { type: "image/png" }));
    const uploaded = await call(uploadScoutPhotos, {
      method: "POST",
      principal: ACTOR,
      params: { projectId },
      body: form,
      headers: { "content-length": "4096" },
    });
    expect(uploaded.status).toBe(404);
    expect(await prisma.sourceImport.count()).toBe(0);
    expect(await prisma.mediaAsset.count()).toBe(0);
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
