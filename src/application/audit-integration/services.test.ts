import { describe, expect, it } from "vitest";
import { ExternalConnectionId } from "@/domain/audit-integration";
import { OwnerId, ProjectId, createProject, makeProjectName } from "@/domain/project";
import { registerExternalConnection, recordSyncResult } from ".";
import { InMemoryAuditIntegrationRepository } from "../../../test/adapters/in-memory-audit-integration-repository";
import { FixedClock, SequentialIdGenerator } from "../../../test/adapters/fakes";
import { InMemoryProjectRepository } from "../../../test/adapters/in-memory-repositories";

const OWNER = OwnerId.unsafe("usr_00000001");
const OTHER = OwnerId.unsafe("usr_00000002");
const PROJECT = ProjectId.unsafe("proj_00000001");
async function fixture() {
  const projects = new InMemoryProjectRepository();
  const name = makeProjectName("Film");
  if (!name.ok) throw name.error;
  await projects.insert(
    createProject({
      id: PROJECT,
      ownerId: OWNER,
      name: name.value,
      now: new Date("2026-01-01T00:00:00Z"),
    }),
  );
  return {
    deps: {
      projects,
      records: new InMemoryAuditIntegrationRepository(),
      ids: new SequentialIdGenerator(),
      clock: new FixedClock(new Date("2026-01-01T01:00:00Z")),
    },
  };
}
describe("audit and integration application", () => {
  it("atomically registers an owned connection and audit event", async () => {
    const { deps } = await fixture();
    const result = await registerExternalConnection(deps, {
      actorId: OWNER,
      projectId: PROJECT,
      provider: "nle",
      externalAccountId: "account",
      displayName: "Edit suite",
    });
    expect(result.ok).toBe(true);
    expect(deps.records.connections.size).toBe(1);
    expect(deps.records.events.size).toBe(1);
  });
  it("denies cross-owner registration without mutation", async () => {
    const { deps } = await fixture();
    const result = await registerExternalConnection(deps, {
      actorId: OTHER,
      projectId: PROJECT,
      provider: "nle",
      externalAccountId: "account",
      displayName: "No",
    });
    expect(result.ok).toBe(false);
    expect(deps.records.connections.size).toBe(0);
  });
  it("returns the original receipt for duplicate sync requests", async () => {
    const { deps } = await fixture();
    const connection = await registerExternalConnection(deps, {
      actorId: OWNER,
      projectId: PROJECT,
      provider: "nle",
      externalAccountId: "account",
      displayName: "Edit suite",
    });
    if (!connection.ok) throw connection.error;
    const input = {
      actorId: OWNER,
      projectId: PROJECT,
      connectionId: connection.value.id,
      requestKey: "same",
      status: "SUCCEEDED" as const,
      startedAt: new Date("2026-01-01T00:30:00Z"),
      identifiers: [
        { resourceType: "PROJECT", resourceId: PROJECT, externalId: "external-project" },
      ],
    };
    const first = await recordSyncResult(deps, input);
    const duplicate = await recordSyncResult(deps, input);
    expect(first.ok && duplicate.ok && duplicate.value.id).toBe(first.ok ? first.value.id : "");
    expect(deps.records.runs.size).toBe(1);
    expect(deps.records.identifiers.size).toBe(1);
    expect(deps.records.events.size).toBe(2);
  });
  it("rejects a cross-project connection reference", async () => {
    const { deps } = await fixture();
    const result = await recordSyncResult(deps, {
      actorId: OWNER,
      projectId: PROJECT,
      connectionId: ExternalConnectionId.unsafe("extcon_missing1"),
      requestKey: "x",
      status: "FAILED",
      failureCode: "UNAVAILABLE",
      startedAt: new Date("2026-01-01T00:30:00Z"),
      identifiers: [],
    });
    expect(result.ok).toBe(false);
  });
});
