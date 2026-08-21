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
}

describe("prepared location application", () => {
  it("creates and lists a room without requiring a project", async () => {
    const preparedLocations = new Locations();
    const deps = {
      preparedLocations,
      ids: new SequentialIdGenerator(),
      clock: new FixedClock(new Date("2026-08-21T13:00:00.000Z")),
    };
    const owner = OwnerId.unsafe("usr_LOCATION001");
    const location = await createPreparedLocationForOwner(deps, { actorId: owner, name: "Studio A", inputKind: "GLB" });
    expect(preparedLocationView(location)).toEqual(expect.objectContaining({ name: "Studio A", status: "DRAFT", inputCount: 0 }));
    await expect(listPreparedLocationsForOwner(deps, owner)).resolves.toEqual([location]);
  });
});
