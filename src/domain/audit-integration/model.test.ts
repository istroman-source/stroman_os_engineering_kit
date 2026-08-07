import { describe, expect, it } from "vitest";
import { OwnerId, ProjectId } from "../project";
import { AuditEventId, ExternalConnectionId, SyncRunId, createSyncRun } from ".";

describe("audit and integration domain", () => {
  const base = {
    id: SyncRunId.unsafe("sync_00000001"),
    connectionId: ExternalConnectionId.unsafe("extcon_00000001"),
    ownerId: OwnerId.unsafe("usr_00000001"),
    projectId: ProjectId.unsafe("proj_00000001"),
    requestKey: "request-1",
    startedAt: new Date("2026-01-01T00:00:00Z"),
    completedAt: new Date("2026-01-01T00:01:00Z"),
  } as const;
  it("enforces terminal failure shape and time ordering", () => {
    expect(createSyncRun({ ...base, status: "FAILED", failureCode: null }).ok).toBe(false);
    expect(createSyncRun({ ...base, status: "SUCCEEDED", failureCode: "TIMEOUT" }).ok).toBe(false);
    expect(
      createSyncRun({ ...base, status: "SUCCEEDED", failureCode: null, completedAt: new Date(0) })
        .ok,
    ).toBe(false);
    expect(createSyncRun({ ...base, status: "FAILED", failureCode: "TIMEOUT" }).ok).toBe(true);
  });
  it("uses distinct prefixed identifiers", () => {
    expect(AuditEventId.parse("audit_00000001").ok).toBe(true);
    expect(AuditEventId.parse("sync_00000001").ok).toBe(false);
  });
});
