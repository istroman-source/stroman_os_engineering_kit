import { describe, expect, it } from "vitest";
import { OwnerId } from "@/domain/project";
import { createPreparedLocation } from "./prepared-location";
import { assessLocationGeometry } from "./location-readiness";

describe("createPreparedLocation", () => {
  it("creates a durable owner-scoped location before any project exists", () => {
    const created = createPreparedLocation({
      id: "loc_LIBRARY001",
      ownerId: OwnerId.unsafe("usr_LIBRARY001"),
      name: "  Downtown kitchen  ",
      inputKind: "PHOTOS",
      now: new Date("2026-08-21T13:00:00.000Z"),
    });
    expect(created).toMatchObject({
      ok: true,
      value: { name: "Downtown kitchen", status: "DRAFT", inputs: [], environment: null },
    });
  });

  it("rejects an unnamed room before any upload starts", () => {
    expect(
      createPreparedLocation({
        id: "loc_LIBRARY002",
        ownerId: OwnerId.unsafe("usr_LIBRARY001"),
        name: " ",
        inputKind: "GLB",
        now: new Date(),
      }).ok,
    ).toBe(false);
  });
});

describe("assessLocationGeometry", () => {
  it("keeps a plausible room explicitly estimated and lists spatial unknowns", () => {
    const result = assessLocationGeometry(
      { min: { x: 0, y: 0, z: 0 }, max: { x: 5, y: 2.8, z: 4 } },
      "PHOTOS",
    );

    expect(result.usability).toBe("SHOOTABLE_ESTIMATE");
    expect(result.observedConstraints[0]).toContain("5.0m wide × 2.8m high × 4.0m deep");
    expect(result.unknowns.join(" ")).toMatch(/doors.*windows.*obstacles/i);
    expect(result.noGoAreas.join(" ")).toMatch(/outside the recovered mesh/i);
    expect(result.correctiveAction).toBeNull();
  });

  it("withholds distorted geometry and asks for actionable source coverage", () => {
    const result = assessLocationGeometry(
      { min: { x: 0, y: 0, z: 0 }, max: { x: 70, y: 2.8, z: 2 } },
      "PHOTOS",
    );

    expect(result.usability).toBe("REVIEW_REQUIRED");
    expect(result.issues.join(" ")).toMatch(/stretched.*distorted/i);
    expect(result.correctiveAction).toMatch(/overlapping photos.*floor.*ceiling.*corners/i);
  });

  it("reports canonical reconstructed bounds without applying source scale twice", () => {
    const result = assessLocationGeometry(
      { min: { x: -1.5, y: 0, z: -1.6 }, max: { x: 1.5, y: 2.6, z: 1.6 } },
      "PHOTOS",
    );

    expect(result.observedConstraints[0]).toContain("3.0m wide × 2.6m high × 3.2m deep");
  });
});
