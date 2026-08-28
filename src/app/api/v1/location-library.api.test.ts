import type { PrismaClient } from "@prisma/client";
import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";
import { resetAuthForTests, setRequestAuthenticatorForTests } from "@/server/composition";
import { TestAuthenticator } from "@test/adapters/test-auth";
import { createTestPrisma, resetDatabase } from "@test/db/integration-helpers";
import { call } from "@test/http/call";
import { GET as listLocations, POST as createLocation } from "./locations/route";
import { GET as getLocation, PATCH as renameLocation } from "./locations/[locationId]/route";
import { POST as uploadLocationGlb } from "./locations/[locationId]/glb/route";
import { POST as uploadLocationPhotos } from "./locations/[locationId]/photos/route";
import { GET as getLocationGeometry } from "./locations/[locationId]/geometry/route";

const ACTOR = "subject-location-owner";
const OTHER = "subject-location-other";

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

function roomGlb(): Uint8Array {
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

async function makeLocation(principal: string, inputKind: "GLB" | "PHOTOS" = "GLB") {
  const response = await call(createLocation, {
    method: "POST",
    principal,
    json: { name: "Studio kitchen", inputKind },
  });
  expect(response.status).toBe(201);
  return (response.body as { location: { id: string } }).location.id;
}

describe("Prepared location library (real HTTP + PostgreSQL)", () => {
  it("lists, opens, and renames only the authenticated owner's room", async () => {
    const locationId = await makeLocation(ACTOR);
    await makeLocation(OTHER);

    const listed = await call(listLocations, { principal: ACTOR });
    expect(listed.status).toBe(200);
    expect((listed.body as { items: unknown[] }).items).toHaveLength(1);

    const opened = await call(getLocation, { principal: ACTOR, params: { locationId } });
    expect(opened.status).toBe(200);
    expect(opened.body).toMatchObject({
      location: { id: locationId, name: "Studio kitchen", status: "DRAFT" },
    });

    const renamed = await call(renameLocation, {
      method: "PATCH",
      principal: ACTOR,
      params: { locationId },
      json: { name: "North studio kitchen" },
    });
    expect(renamed.status).toBe(200);
    expect(renamed.body).toMatchObject({ location: { name: "North studio kitchen" } });

    const hidden = await call(getLocation, { principal: OTHER, params: { locationId } });
    expect(hidden.status).toBe(404);
    const hiddenMutation = await call(renameLocation, {
      method: "PATCH",
      principal: OTHER,
      params: { locationId },
      json: { name: "Stolen room" },
    });
    expect(hiddenMutation.status).toBe(404);
  });

  it("serves the exact ready geometry privately without leaking storage metadata", async () => {
    const locationId = await makeLocation(ACTOR);
    const glb = roomGlb();
    const form = new FormData();
    form.append(
      "file",
      new File([glb.buffer as ArrayBuffer], "studio.glb", { type: "model/gltf-binary" }),
    );
    const uploaded = await call(uploadLocationGlb, {
      method: "POST",
      principal: ACTOR,
      params: { locationId },
      body: form,
    });
    expect(uploaded.status).toBe(202);

    const detail = await call(getLocation, { principal: ACTOR, params: { locationId } });
    expect(detail.status).toBe(200);
    expect(detail.body).toMatchObject({
      location: {
        id: locationId,
        status: "READY",
        environment: { source: "GLB", scaleConfidence: "ESTIMATED" },
      },
    });
    const serialized = JSON.stringify(detail.body);
    expect(serialized).not.toContain("storageKey");
    expect(serialized).not.toContain("contentHash");

    const geometry = await getLocationGeometry(
      new Request("http://localhost/api", { headers: { "x-test-principal": ACTOR } }),
      { params: Promise.resolve({ locationId }) },
    );
    expect(geometry.status).toBe(200);
    expect(geometry.headers.get("content-type")).toBe("model/gltf-binary");
    expect(geometry.headers.get("cache-control")).toBe("private, no-store");
    expect(new Uint8Array(await geometry.arrayBuffer())).toEqual(glb);

    const denied = await getLocationGeometry(
      new Request("http://localhost/api", { headers: { "x-test-principal": OTHER } }),
      { params: Promise.resolve({ locationId }) },
    );
    expect(denied.status).toBe(404);
  });

  it("requires authentication for detail and geometry", async () => {
    const locationId = await makeLocation(ACTOR);
    expect((await call(getLocation, { params: { locationId } })).status).toBe(401);
    const geometry = await getLocationGeometry(new Request("http://localhost/api"), {
      params: Promise.resolve({ locationId }),
    });
    expect(geometry.status).toBe(401);
  });

  it("rejects an oversized multipart room-photo request before parsing it", async () => {
    const locationId = await makeLocation(ACTOR, "PHOTOS");
    const form = new FormData();
    form.append("files", new File(["small"], "room.jpg", { type: "image/jpeg" }));
    const accepted = await call(uploadLocationPhotos, {
      method: "POST",
      principal: ACTOR,
      params: { locationId },
      body: form,
    });
    expect(accepted.status).toBe(202);
    expect(accepted.body).toMatchObject({ location: { status: "DRAFT", inputCount: 1 } });

    const oversizedForm = new FormData();
    oversizedForm.append("files", new File(["small"], "room.jpg", { type: "image/jpeg" }));
    const response = await call(uploadLocationPhotos, {
      method: "POST",
      principal: ACTOR,
      params: { locationId },
      body: oversizedForm,
      headers: { "content-length": String(10 * 1024 * 1024) },
    });
    expect(response.status).toBe(422);
  });
});
