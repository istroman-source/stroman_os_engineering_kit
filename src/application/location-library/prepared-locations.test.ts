import { describe, expect, it } from "vitest";
import type {
  PreparedLocation,
  PreparedLocationReconstructionJob,
  PreparedLocationReconstructionRepository,
  PreparedLocationRepository,
} from "@/domain/location-library";
import { OwnerId } from "@/domain/project";
import { FixedClock, SequentialIdGenerator } from "../../../test/adapters/fakes";
import {
  createPreparedLocationForOwner,
  listPreparedLocationsForOwner,
  preparedLocationView,
  startPreparedLocationReconstruction,
  uploadPreparedLocationPhotos,
} from "./prepared-locations";

class Locations implements PreparedLocationRepository {
  values: PreparedLocation[] = [];
  async findById(id: string) {
    return this.values.find((item) => item.id === id) ?? null;
  }
  async listByOwner(ownerId: OwnerId) {
    return this.values.filter((item) => item.ownerId === ownerId);
  }
  async insert(location: PreparedLocation) {
    this.values.push(location);
  }
  async update(location: PreparedLocation) {
    const index = this.values.findIndex((item) => item.id === location.id);
    if (index >= 0) this.values[index] = { ...location, inputs: this.values[index]!.inputs };
  }
  async addInput(_preparedLocationId: string, input: PreparedLocation["inputs"][number]) {
    const index = this.values.findIndex((item) => item.id === _preparedLocationId);
    if (index >= 0)
      this.values[index] = {
        ...this.values[index]!,
        inputs: [...this.values[index]!.inputs, input],
      };
  }
}

class Reconstructions implements PreparedLocationReconstructionRepository {
  values: PreparedLocationReconstructionJob[] = [];
  async findById(id: string) {
    return this.values.find((item) => item.id === id) ?? null;
  }
  async findLatestByLocation(locationId: string) {
    return this.values.filter((item) => item.preparedLocationId === locationId).at(-1) ?? null;
  }
  async insert(job: PreparedLocationReconstructionJob) {
    this.values.push(job);
  }
  async update(job: PreparedLocationReconstructionJob) {
    const index = this.values.findIndex((item) => item.id === job.id);
    if (index >= 0) this.values[index] = job;
  }
  async claimNextForWorker() {
    return null;
  }
}

describe("prepared location application", () => {
  it("creates and lists a room without requiring a project", async () => {
    const preparedLocations = new Locations();
    const preparedLocationReconstructions = new Reconstructions();
    const deps = {
      preparedLocations,
      preparedLocationReconstructions,
      ids: new SequentialIdGenerator(),
      clock: new FixedClock(new Date("2026-08-21T13:00:00.000Z")),
      sourceStorage: {
        put: async () => ({ leaseId: "lease" }),
        get: async () => new Uint8Array(),
        retain: async () => undefined,
        discard: async () => undefined,
      },
      locationGeometryInspector: {
        inferRoomScale: () => ({
          scaleMetersPerUnit: 1,
          sourceToCanonical: [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1] as const,
          bounds: { min: { x: 0, y: 0, z: 0 }, max: { x: 1, y: 1, z: 1 } },
        }),
      },
    };
    const owner = OwnerId.unsafe("usr_LOCATION001");
    const location = await createPreparedLocationForOwner(deps, {
      actorId: owner,
      name: "Studio A",
      inputKind: "GLB",
    });
    expect(preparedLocationView(location)).toEqual(
      expect.objectContaining({ name: "Studio A", status: "DRAFT", inputCount: 0 }),
    );
    await expect(listPreparedLocationsForOwner(deps, owner)).resolves.toEqual([location]);
  });

  it("preserves photo evidence once and queues it idempotently for the Mac worker", async () => {
    const preparedLocations = new Locations();
    const preparedLocationReconstructions = new Reconstructions();
    const deps = {
      preparedLocations,
      preparedLocationReconstructions,
      ids: new SequentialIdGenerator(),
      clock: new FixedClock(new Date("2026-08-22T13:00:00.000Z")),
      sourceStorage: {
        put: async () => ({ leaseId: "lease" }),
        get: async () => new Uint8Array(),
        retain: async () => undefined,
        discard: async () => undefined,
      },
      locationGeometryInspector: {
        inferRoomScale: () => ({
          scaleMetersPerUnit: 1,
          sourceToCanonical: [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1] as const,
          bounds: { min: { x: 0, y: 0, z: 0 }, max: { x: 1, y: 1, z: 1 } },
        }),
      },
    };
    const owner = OwnerId.unsafe("usr_LOCATION002");
    const location = await createPreparedLocationForOwner(deps, {
      actorId: owner,
      name: "Kitchen",
      inputKind: "PHOTOS",
    });
    const files = Array.from({ length: 20 }, (_, index) => ({
      fileName: `room-${index}.jpg`,
      contentType: "image/jpeg",
      bytes: new Uint8Array([index + 1]),
    }));
    await uploadPreparedLocationPhotos(deps, { actorId: owner, locationId: location.id, files });
    const first = await startPreparedLocationReconstruction(deps, {
      actorId: owner,
      locationId: location.id,
    });
    const second = await startPreparedLocationReconstruction(deps, {
      actorId: owner,
      locationId: location.id,
    });
    expect(first.id).toBe(second.id);
    expect(preparedLocationReconstructions.values).toHaveLength(1);
    expect((await preparedLocations.findById(location.id))?.status).toBe("PROCESSING");
  });
});
