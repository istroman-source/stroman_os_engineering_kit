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
import { OptimisticConcurrencyError } from "@/lib/errors";
import { FixedClock, SequentialIdGenerator } from "../../../test/adapters/fakes";
import { InMemoryCreativeBriefRepository } from "../../../test/adapters/in-memory-creative-brief-repository";
import { InMemoryProjectRepository } from "../../../test/adapters/in-memory-repositories";
import {
  InMemorySourceImportRepository,
  InMemorySourceStorage,
} from "../../../test/adapters/in-memory-source-import";
import {
  failLocationReconstruction,
  refreshLocationReconstruction,
  retryLocationReconstruction,
  stageLocationReconstructionPhoto,
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
    const stored = this.values.get(job.id);
    if (!stored || stored.lockVersion !== job.lockVersion) {
      throw new OptimisticConcurrencyError();
    }
    this.values.set(job.id, { ...job, lockVersion: job.lockVersion + 1 });
  }
  async claimNextForWorker() {
    return null;
  }
}

class Provider implements LocationReconstructionProvider {
  key = "test-photo-provider";
  readonly starts: Parameters<LocationReconstructionProvider["start"]>[0][] = [];
  statusCalls = 0;
  async start(input: Parameters<LocationReconstructionProvider["start"]>[0]) {
    this.starts.push(input);
    return { providerJobId: "provider-room-1" };
  }
  async status() {
    this.statusCalls += 1;
    return { status: "SUCCEEDED" as const, phase: null, percent: 100 };
  }
  async downloadGlb() {
    return {
      bytes: new Uint8Array([1, 2, 3, 4]),
      fileName: "room.glb",
      sourceToCanonicalBasis: [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1] as const,
      metersPerSourceUnit: null,
    };
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
        sourceToCanonical: [0.026, 0, 0, 0, 0, 0.026, 0, 0, 0, 0, 0.026, 0, 0, 0, 0, 1] as const,
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

async function stagePhotos(deps: ReturnType<typeof fixture>, photos = capturePhotos()) {
  const uploads = [];
  for (const photo of photos) {
    uploads.push(
      await stageLocationReconstructionPhoto(deps, {
        actorId: OWNER,
        projectId: PROJECT,
        ...photo,
      }),
    );
  }
  return uploads.map(({ uploadId }) => uploadId);
}

describe("photo-to-space reconstruction", () => {
  it("preserves source evidence and creates an estimated-scale immutable environment", async () => {
    const deps = fixture();
    develop(deps);
    const uploadIds = await stagePhotos(deps);

    const started = await startLocationReconstruction(deps, {
      actorId: OWNER,
      projectId: PROJECT,
      name: "Actual office",
      uploadIds,
    });
    expect(started).toMatchObject({ status: "PROCESSING", phase: "QUEUED", photoCount: 20 });

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
    const uploadIds = await stagePhotos(deps, photos);

    await expect(
      startLocationReconstruction(deps, {
        actorId: OWNER,
        projectId: PROJECT,
        name: "Actual office",
        uploadIds,
      }),
    ).rejects.toThrow(/duplicate photos/i);
    expect(deps.sourceImports.receipts).toHaveProperty("size", 19);
    expect(deps.locationReconstructions.values).toHaveProperty("size", 0);
  });

  it("recovers a provider submission interrupted beyond its hard timeout", async () => {
    const deps = fixture();
    develop(deps);
    const uploadIds = await stagePhotos(deps);
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
        uploadIds,
      }),
    ).resolves.toMatchObject({ name: "Retry room", status: "PROCESSING" });
    expect(deps.locationReconstructions.values.get(stale.id)).toMatchObject({
      status: "FAILED",
      failureCode: "SUBMISSION_INTERRUPTED",
    });
  });

  it("hands a legacy provider job to the owned worker exactly once without another upload", async () => {
    const deps = fixture();
    develop(deps);
    await stagePhotos(deps);
    const receipts = await deps.sourceImports.listByProject(PROJECT);
    const legacy: LocationReconstructionJob = {
      id: "lrec_LEGACYROOM1",
      ownerId: OWNER,
      projectId: PROJECT,
      name: "Existing office",
      providerKey: "kiri-photo-v1",
      providerJobId: "retired-provider-job",
      status: "PROCESSING",
      photos: receipts.map((receipt) => ({
        mediaAssetId: receipt.mediaAssetId!,
        fileName: receipt.sourceName,
        contentType: receipt.contentType as "image/jpeg",
        byteSize: receipt.byteSize,
        contentHash: receipt.contentHash,
        storageKey: receipt.storageKey,
      })),
      environmentId: null,
      failureCode: null,
      createdAt: new Date("2026-08-20T11:00:00.000Z"),
      updatedAt: new Date("2026-08-20T11:00:00.000Z"),
      completedAt: null,
      lockVersion: 1,
    };
    deps.locationReconstructions.values.set(legacy.id, legacy);
    deps.locationReconstructionProvider.key = "stroman-owned-v1";

    await expect(
      refreshLocationReconstruction(deps, {
        actorId: OWNER,
        projectId: PROJECT,
        jobId: legacy.id,
      }),
    ).resolves.toMatchObject({ status: "PROCESSING", phase: "QUEUED", photoCount: 20 });

    expect(deps.locationReconstructionProvider.statusCalls).toBe(0);
    expect(deps.locationReconstructionProvider.starts).toHaveLength(1);
    expect(deps.locationReconstructionProvider.starts[0]).toMatchObject({
      name: "Existing office",
      idempotencyKey: "legacy-location:lrec_LEGACYROOM1",
    });
    expect(deps.locationReconstructions.values.get(legacy.id)).toMatchObject({
      providerKey: "stroman-owned-v1",
      providerJobId: "provider-room-1",
      status: "PROCESSING",
    });
    expect(deps.sourceImports.receipts).toHaveProperty("size", 20);
  });

  it("atomically retries a failed job from preserved source evidence without another browser upload", async () => {
    const deps = fixture();
    develop(deps);
    await stagePhotos(deps);
    const receipts = await deps.sourceImports.listByProject(PROJECT);
    const failed: LocationReconstructionJob = {
      id: "lrec_FAILEDROOM1",
      ownerId: OWNER,
      projectId: PROJECT,
      name: "Existing office",
      providerKey: "stroman-owned-v1",
      providerJobId: "failed-worker-job",
      status: "FAILED",
      photos: receipts.map((receipt) => ({
        mediaAssetId: receipt.mediaAssetId!,
        fileName: receipt.sourceName,
        contentType: receipt.contentType as "image/jpeg",
        byteSize: receipt.byteSize,
        contentHash: receipt.contentHash,
        storageKey: receipt.storageKey,
      })),
      environmentId: null,
      failureCode: "RECONSTRUCTION_FAILED",
      createdAt: new Date("2026-08-20T11:00:00.000Z"),
      updatedAt: new Date("2026-08-20T11:20:00.000Z"),
      completedAt: new Date("2026-08-20T11:20:00.000Z"),
      lockVersion: 1,
    };
    deps.locationReconstructions.values.set(failed.id, failed);

    const results = await Promise.allSettled([
      retryLocationReconstruction(deps, { actorId: OWNER, projectId: PROJECT, jobId: failed.id }),
      retryLocationReconstruction(deps, { actorId: OWNER, projectId: PROJECT, jobId: failed.id }),
    ]);

    expect(results.filter((result) => result.status === "fulfilled")).toHaveLength(1);
    expect(results.filter((result) => result.status === "rejected")).toHaveLength(1);
    expect(deps.locationReconstructionProvider.starts).toHaveLength(1);
    expect(deps.locationReconstructionProvider.starts[0]).toMatchObject({
      name: "Existing office",
      idempotencyKey: "retry-location:lrec_FAILEDROOM1:2",
    });
    expect(deps.locationReconstructions.values.get(failed.id)).toMatchObject({
      status: "PROCESSING",
      providerJobId: "provider-room-1",
    });
    expect(deps.sourceImports.receipts).toHaveProperty("size", 20);
  });

  it("rejects non-terminal and incomplete retry requests before starting the worker", async () => {
    const deps = fixture();
    develop(deps);
    const base: LocationReconstructionJob = {
      id: "lrec_NONRETRY01",
      ownerId: OWNER,
      projectId: PROJECT,
      name: "Office",
      providerKey: "stroman-owned-v1",
      providerJobId: "provider-job",
      status: "SUCCEEDED",
      photos: [],
      environmentId: "env_ROOM000001",
      failureCode: null,
      createdAt: new Date("2026-08-20T11:00:00.000Z"),
      updatedAt: new Date("2026-08-20T11:20:00.000Z"),
      completedAt: new Date("2026-08-20T11:20:00.000Z"),
      lockVersion: 1,
    };
    deps.locationReconstructions.values.set(base.id, base);

    await expect(
      retryLocationReconstruction(deps, { actorId: OWNER, projectId: PROJECT, jobId: base.id }),
    ).rejects.toThrow(/only a failed/i);

    deps.locationReconstructions.values.set(base.id, {
      ...base,
      status: "FAILED",
      environmentId: null,
      failureCode: "RECONSTRUCTION_FAILED",
    });
    await expect(
      retryLocationReconstruction(deps, { actorId: OWNER, projectId: PROJECT, jobId: base.id }),
    ).rejects.toThrow(/no longer complete enough/i);
    expect(deps.locationReconstructionProvider.starts).toHaveLength(0);
  });

  it("records a terminal connected-Mac failure so the existing project retry remains available", async () => {
    const deps = fixture();
    develop(deps);
    const job: LocationReconstructionJob = {
      id: "lrec_MACFAIL001",
      ownerId: OWNER,
      projectId: PROJECT,
      name: "Kitchen",
      providerKey: "stroman-pull-v1",
      providerJobId: "local-pull-job",
      status: "PROCESSING",
      photos: [],
      environmentId: null,
      failureCode: null,
      workerLeaseId: "lease-1",
      workerLeaseExpiresAt: new Date("2026-08-20T12:15:00.000Z"),
      createdAt: new Date("2026-08-20T12:00:00.000Z"),
      updatedAt: new Date("2026-08-20T12:00:00.000Z"),
      completedAt: null,
      lockVersion: 1,
    };
    deps.locationReconstructions.values.set(job.id, job);
    const view = await failLocationReconstruction(deps, {
      job,
      failureCode: "LOCAL_RECONSTRUCTION_FAILED",
    });
    expect(view).toMatchObject({ status: "FAILED", failureCode: "LOCAL_RECONSTRUCTION_FAILED" });
    expect(deps.locationReconstructions.values.get(job.id)).toMatchObject({
      status: "FAILED",
      workerLeaseId: null,
      workerLeaseExpiresAt: null,
    });
  });
});
