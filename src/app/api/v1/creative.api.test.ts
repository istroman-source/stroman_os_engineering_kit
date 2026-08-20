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
import { POST as uploadLocation } from "./projects/[projectId]/location-environments/route";
import { GET as getLocationGeometry } from "./projects/[projectId]/location-environments/[environmentId]/geometry/route";
import { POST as saveLocationShot } from "./projects/[projectId]/location-shots/route";
import { GET as getLocationShot } from "./projects/[projectId]/location-shots/[mediaAssetId]/route";
import { instructionAtDeskShotPlanning } from "@/domain/creative";

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

function testLocationGlb(): Uint8Array {
  const document = JSON.stringify({
    asset: { version: "2.0" },
    scene: 0,
    scenes: [{ nodes: [0] }],
    nodes: [{ mesh: 0 }],
    meshes: [{ primitives: [{ attributes: { POSITION: 0 } }] }],
    accessors: [{ type: "VEC3", min: [-3, 0, -4], max: [3, 2.8, 4] }],
  });
  const padding = (4 - (new TextEncoder().encode(document).byteLength % 4)) % 4;
  const json = new TextEncoder().encode(document + " ".repeat(padding));
  const bytes = new Uint8Array(20 + json.byteLength);
  const view = new DataView(bytes.buffer);
  view.setUint32(0, 0x46546c67, true);
  view.setUint32(4, 2, true);
  view.setUint32(8, bytes.byteLength, true);
  view.setUint32(12, json.byteLength, true);
  view.setUint32(16, 0x4e4f534a, true);
  bytes.set(json, 20);
  return bytes;
}

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

  it("round-trips the exact versioned spatial shot through the authenticated API", async () => {
    const projectId = await makeProject();
    await call(analyzeProject, {
      method: "POST",
      principal: ACTOR,
      params: { projectId },
      json: brief,
    });
    const shotPlanning = instructionAtDeskShotPlanning();
    const planned = await call(updatePlanning, {
      method: "POST",
      principal: ACTOR,
      params: { projectId },
      json: { shotPlanning },
    });

    expect(planned.status).toBe(200);
    expect(planned.body).toMatchObject({
      brief: {
        planningContext: {
          shotPlanning: {
            activeShot: {
              title: "Instruction at the Desk",
              camera: { focalLengthMm: 35, aspectRatio: "16:9" },
              geometryConfidence: "ESTIMATED",
            },
          },
        },
      },
    });
    const reloaded = await call(getAnalysis, { principal: ACTOR, params: { projectId } });
    expect(reloaded.status).toBe(200);
    expect(
      (reloaded.body as { brief: { planningContext: { shotPlanning: unknown } } }).brief
        .planningContext.shotPlanning,
    ).toEqual(shotPlanning);
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

  it("persists, privately serves, and exactly saves a real-location camera frame", async () => {
    const projectId = await makeProject();
    await call(analyzeProject, {
      method: "POST",
      principal: ACTOR,
      params: { projectId },
      json: brief,
    });
    const glb = testLocationGlb();
    const upload = new FormData();
    upload.append(
      "file",
      new File([glb.buffer as ArrayBuffer], "office.glb", { type: "model/gltf-binary" }),
    );
    upload.append("name", "Observed office");
    upload.append("sourceKind", "PHONE_SCAN");
    upload.append("unit", "METERS");
    upload.append("metricScale", "true");
    const imported = await call(uploadLocation, {
      method: "POST",
      principal: ACTOR,
      params: { projectId },
      body: upload,
      headers: { "content-length": String(glb.byteLength + 4096) },
    });
    expect(imported.status).toBe(200);
    const locationWorkspace = (
      imported.body as {
        brief: { planningContext: { locationWorkspace: Record<string, unknown> } };
      }
    ).brief.planningContext.locationWorkspace as {
      environment: { id: string; scaleConfidence: string };
      compositions: { horizontal: { orientation: { x: number; y: number; z: number; w: number } } };
    };
    expect(locationWorkspace.environment.scaleConfidence).toBe("OBSERVED");
    expect(locationWorkspace.compositions.horizontal.orientation).not.toEqual({
      x: 0,
      y: 0,
      z: 0,
      w: 1,
    });

    const geometry = await getLocationGeometry(
      new Request("http://localhost/api", { headers: { "x-test-principal": ACTOR } }),
      { params: Promise.resolve({ projectId, environmentId: locationWorkspace.environment.id }) },
    );
    expect(geometry.status).toBe(200);
    expect(geometry.headers.get("content-type")).toBe("model/gltf-binary");
    expect(new Uint8Array(await geometry.arrayBuffer())).toEqual(glb);
    const geometryDenied = await getLocationGeometry(
      new Request("http://localhost/api", { headers: { "x-test-principal": OTHER } }),
      { params: Promise.resolve({ projectId, environmentId: locationWorkspace.environment.id }) },
    );
    expect(geometryDenied.status).toBe(404);

    const png = new Uint8Array([137, 80, 78, 71, 13, 10, 26, 10, 1, 2, 3]);
    const shot = new FormData();
    shot.append(
      "frame",
      new File([png.buffer as ArrayBuffer], "exact-frame.png", { type: "image/png" }),
    );
    shot.append("workspace", JSON.stringify(locationWorkspace));
    shot.append("title", "Exact office frame");
    shot.append("width", "960");
    shot.append("height", "540");
    shot.append("technicalSummary", "35 mm · 16:9 · observed office");
    shot.append("shootingInstructions", "Camera at the saved mark, aimed at the desk.");
    shot.append("includesUnknownSpace", "false");
    const saved = await call(saveLocationShot, {
      method: "POST",
      principal: ACTOR,
      params: { projectId },
      body: shot,
      headers: { "content-length": "8192" },
    });
    expect(saved.status).toBe(200);
    const savedWorkspace = (
      saved.body as {
        brief: {
          planningContext: {
            locationWorkspace: {
              savedShots: { storyboardFrame: { mediaAssetId: string; width: number } }[];
            };
          };
        };
      }
    ).brief.planningContext.locationWorkspace;
    expect(savedWorkspace.savedShots[0]).toMatchObject({
      storyboardFrame: { width: 960 },
    });
    const mediaAssetId = savedWorkspace.savedShots[0]!.storyboardFrame.mediaAssetId;
    const frame = await getLocationShot(
      new Request("http://localhost/api", { headers: { "x-test-principal": ACTOR } }),
      { params: Promise.resolve({ projectId, mediaAssetId }) },
    );
    expect(frame.status).toBe(200);
    expect(frame.headers.get("content-type")).toBe("image/png");
    expect(new Uint8Array(await frame.arrayBuffer())).toEqual(png);
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

  it("rejects an invalid scout batch before importing any earlier valid file", async () => {
    const projectId = await makeProject();
    await call(analyzeProject, {
      method: "POST",
      principal: ACTOR,
      params: { projectId },
      json: brief,
    });
    const form = new FormData();
    form.append("files", new File([new Uint8Array([1, 2, 3])], "valid.png", { type: "image/png" }));
    form.append(
      "files",
      new File([new Uint8Array([4, 5, 6])], "invalid.txt", { type: "text/plain" }),
    );
    const uploaded = await call(uploadScoutPhotos, {
      method: "POST",
      principal: ACTOR,
      params: { projectId },
      body: form,
      headers: { "content-length": "4096" },
    });
    expect(uploaded.status).toBe(400);
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
