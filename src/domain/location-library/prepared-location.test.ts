import { describe, expect, it } from "vitest";
import { OwnerId } from "@/domain/project";
import { createPreparedLocation } from "./prepared-location";

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
