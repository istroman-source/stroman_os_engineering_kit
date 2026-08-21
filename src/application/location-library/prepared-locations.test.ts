import { describe, expect, it } from "vitest";
import type { PreparedLocation, PreparedLocationRepository } from "@/domain/location-library";
import { OwnerId } from "@/domain/project";
import { FixedClock, SequentialIdGenerator } from "../../../test/adapters/fakes";
import { createPreparedLocationForOwner, listPreparedLocationsForOwner, preparedLocationView } from "./prepared-locations";

class Locations implements PreparedLocationRepository {
  values: PreparedLocation[] = [];
  async findById(id: string) { return this.values.find((item) => item.id === id) ?? null; }
  async listByOwner(ownerId: OwnerId) { return this.values.filter((item) => item.ownerId === ownerId); }
  async insert(location: PreparedLocation) { this.values.push(location); }
  async update(location: PreparedLocation) {
    const index = this.values.findIndex((item) => item.id === location.id);
    if (index >= 0) this.values[index] = location;
  }
  async addInput(_preparedLocationId: string, input: PreparedLocation["inputs"][number]) {
    const index = this.values.findIndex((item) => item.id === _preparedLocationId);
    if (index >= 0) this.values[index] = { ...this.values[index]!, inputs: [...this.values[index]!.inputs, input] };
  }
}

describe("prepared location application", () => {
  it("creates and lists a room without requiring a project", async () => {
    const preparedLocations = new Locations();
    const deps = {
      preparedLocations,
      ids: new SequentialIdGenerator(),
      clock: new FixedClock(new Date("2026-08-21T13:00:00.000Z")),
      sourceStorage: { put: async () => ({ leaseId: "lease" }), get: async () => new Uint8Array(), retain: async () => undefined, discard: async () => undefined },
      locationGeometryInspector: { inferRoomScale: () => ({ scaleMetersPerUnit: 1, sourceToCanonical: [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1] as const, bounds: { min: { x: 0, y: 0, z: 0 }, max: { x: 1, y: 1, z: 1 } } }) },
    };
    const owner = OwnerId.unsafe("usr_LOCATION001");
    const location = await createPreparedLocationForOwner(deps, { actorId: owner, name: "Studio A", inputKind: "GLB" });
    expect(preparedLocationView(location)).toEqual(expect.objectContaining({ name: "Studio A", status: "DRAFT", inputCount: 0 }));
    await expect(listPreparedLocationsForOwner(deps, owner)).resolves.toEqual([location]);
  });
});
