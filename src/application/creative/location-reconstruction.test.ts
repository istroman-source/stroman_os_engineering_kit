import { describe, expect, it } from "vitest";
import {
  attachCreativeBlueprint,
  CreativeBriefId,
  createCreativeBrief,
  generateBlueprint,
  generateDevelopmentBlueprint,
  type LocationReconstructionJob,
  type LocationReconstructionProvider,
  type LocationReconstructionRepository,
} from "@/domain/creative";
import { createProject, makeProjectName, OwnerId, ProjectId } from "@/domain/project";
import { FixedClock, SequentialIdGenerator } from "../../../test/adapters/fakes";
import { InMemoryCreativeBriefRepository } from "../../../test/adapters/in-memory-creative-brief-repository";
import { InMemoryProjectRepository } from "../../../test/adapters/in-memory-repositories";
import {
  InMemorySourceImportRepository,
  InMemorySourceStorage,
} from "../../../test/adapters/in-memory-source-import";
import {
  refreshLocationReconstruction,
  startLocationReconstruction,
} from "./location-reconstruction";

const OWNER = OwnerId.unsafe("usr_RECONOWNER1");
const PROJECT = ProjectId.unsafe("proj_RECONROOM1");

class Jobs implements LocationReconstructionRepository {
  readonly values = new Map<string, LocationReconstructionJob>();
  async findById(id: string) {
    return this.values.get(id) ?? null;
  }
  async findLatestByProject(projectId: ProjectId) {
    return [...this.values.values()].filter((job) => job.projectId === projectId).at(-1) ?? null;
  }
  async insert(job: LocationReconstructionJob) {
    this.values.set(job.id, job);
  }
  async update(job: LocationReconstructionJob) {
    this.values.set(job.id, { ...job, lockVersion: job.lockVersion + 1 });
  }
}

class Provider implements LocationReconstructionProvider {
  readonly key = "test-photo-provider";
  async start() {
    return { providerJobId: "provider-room-1" };
  }
  async status() {
    return "SUCCEEDED" as const;
  }
  async downloadGlb() {
    return { bytes: new Uint8Array([1, 2, 3, 4]), fileName: "room.glb" };
  }
}

function fixture() {
  const projects = new InMemoryProjectRepository();
  const projectName = makeProjectName("Photo room");
  if (!projectName.ok) throw projectName.error;
  projects.seed(
    createProject({
      id: PROJECT,
      ownerId: OWNER,
      name: projectName.value,
      now: new Date("2026-08-20"),
    }),
  );
  return {
    projects,
    creativeBriefs: new InMemoryCreativeBriefRepository(),
    locationReconstructions: new Jobs(),
    locationReconstructionProvider: new Provider(),
    locationGeometryInspector: {
      inferRoomScale: () => ({
        scaleMetersPerUnit: 0.026,
        bounds: { min: { x: -4, y: 0, z: -5 }, max: { x: 4, y: 2.6, z: 5 } },
      }),
    },
    sourceImports: new InMemorySourceImportRepository(),
    sourceStorage: new InMemorySourceStorage(),
    ids: new SequentialIdGenerator(),
    clock: new FixedClock(new Date("2026-08-20T12:00:00.000Z")),
  };
}

const fields = {
  title: "Morning routine of an everyday mom who eats Jimmy's Famous Meals",
  client: "Jimmy's Famous Meals",
  projectType: "Commercial",
  creativeGoal: "Conversion",
  targetAudience: "Parents who need convenience",
  desiredEmotion: "Understood, relatable, sentimental",
  context:
    "An everyday mother and her eight-month-old baby. Do not show the baby's face. Hands and feet are allowed.",
};

function develop(deps: ReturnType<typeof fixture>) {
  const made = createCreativeBrief({
    id: CreativeBriefId.unsafe("brief_RECONROOM1"),
    projectId: PROJECT,
    now: new Date("2026-08-20T12:00:00.000Z"),
    ...fields,
  });
  if (!made.ok) throw made.error;
  const development = generateDevelopmentBlueprint(made.value);
  deps.creativeBriefs.insert(
    attachCreativeBlueprint(made.value, generateBlueprint(made.value, development), "test-hosted"),
  );
}

function capturePhotos() {
  return Array.from({ length: 20 }, (_, index) => ({
    fileName: `angle-${index + 1}.jpg`,
    contentType: "image/jpeg" as const,
    bytes: new Uint8Array([0xff, 0xd8, 0xff, index]),
  }));
}

describe("photo-to-space reconstruction", () => {
  it("preserves source evidence and creates an estimated-scale immutable environment", async () => {
    const deps = fixture();
    develop(deps);

    const started = await startLocationReconstruction(deps, {
      actorId: OWNER,
      projectId: PROJECT,
      name: "Actual office",
      photos: capturePhotos(),
    });
    expect(started).toMatchObject({ status: "PROCESSING", photoCount: 20 });

    const completed = await refreshLocationReconstruction(deps, {
      actorId: OWNER,
      projectId: PROJECT,
      jobId: started.id,
    });
    expect(completed).toMatchObject({ status: "SUCCEEDED", environmentId: expect.any(String) });
    const brief = await deps.creativeBriefs.findByProject(PROJECT);
    const environment = brief?.planningContext.locationWorkspace?.environment;
    expect(environment).toMatchObject({
      name: "Actual office",
      sourceKind: "PHOTOGRAMMETRY",
      scaleConfidence: "ESTIMATED",
      scaleMetersPerUnit: 0.026,
      reconstructionId: started.id,
    });
    expect(environment?.sourcePhotos).toHaveLength(20);
    expect(deps.sourceImports.receipts).toHaveProperty("size", 21);
  });

  it("rejects duplicate views before preserving or submitting anything", async () => {
    const deps = fixture();
    develop(deps);
    const photos = capturePhotos();
    photos[19] = { ...photos[0]!, fileName: "duplicate.jpg" };

    await expect(
      startLocationReconstruction(deps, {
        actorId: OWNER,
        projectId: PROJECT,
        name: "Actual office",
        photos,
      }),
    ).rejects.toThrow(/duplicate photos/i);
    expect(deps.sourceImports.receipts).toHaveProperty("size", 0);
    expect(deps.locationReconstructions.values).toHaveProperty("size", 0);
  });

  it("recovers a provider submission interrupted beyond its hard timeout", async () => {
    const deps = fixture();
    develop(deps);
    const stale: LocationReconstructionJob = {
      id: "lrec_INTERRUPTED1",
      ownerId: OWNER,
      projectId: PROJECT,
      name: "Interrupted room",
      providerKey: "test-photo-provider",
      providerJobId: null,
      status: "SUBMITTING",
      photos: [],
      environmentId: null,
      failureCode: null,
      createdAt: new Date("2026-08-20T11:40:00.000Z"),
      updatedAt: new Date("2026-08-20T11:48:00.000Z"),
      completedAt: null,
      lockVersion: 1,
    };
    deps.locationReconstructions.values.set(stale.id, stale);

    await expect(
      startLocationReconstruction(deps, {
        actorId: OWNER,
        projectId: PROJECT,
        name: "Retry room",
        photos: capturePhotos(),
      }),
    ).resolves.toMatchObject({ name: "Retry room", status: "PROCESSING" });
    expect(deps.locationReconstructions.values.get(stale.id)).toMatchObject({
      status: "FAILED",
      failureCode: "SUBMISSION_INTERRUPTED",
    });
  });
});
