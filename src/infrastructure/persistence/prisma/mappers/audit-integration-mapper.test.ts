import { describe, expect, it } from "vitest";
import { PersistenceMappingError } from "../errors";
import { toSyncRun } from "./audit-integration-mapper";

describe("audit integration persistence mapper", () => {
  it("rejects corrupt persisted identifiers and lifecycle shapes", () => {
    const valid = {
      id: "sync_00000001",
      connectionId: "extcon_00000001",
      ownerId: "usr_00000001",
      projectId: "proj_00000001",
      requestKey: "request",
      status: "SUCCEEDED" as const,
      failureCode: null,
      startedAt: new Date("2026-01-01T00:00:00Z"),
      completedAt: new Date("2026-01-01T00:01:00Z"),
    };
    expect(() => toSyncRun({ ...valid, connectionId: "wrong" })).toThrow(PersistenceMappingError);
    expect(() => toSyncRun({ ...valid, failureCode: "IMPOSSIBLE" })).toThrow(
      PersistenceMappingError,
    );
  });
});
