import { afterAll, beforeEach, describe, expect, it } from "vitest";
import {
  AuditEventId,
  ExternalConnectionId,
  ExternalIdentifierId,
  SyncRunId,
  type AuditEvent,
  type ExternalConnection,
  type ExternalIdentifier,
  type SyncRun,
} from "@/domain/audit-integration";
import { OwnerId, ProjectId, makeProjectName, createProject } from "@/domain/project";
import { ConflictError } from "@/lib/errors";
import { createTestPrisma, resetDatabase } from "@test/db/integration-helpers";
import { PrismaProjectRepository } from "./prisma-project-repository";
import { PrismaAuditIntegrationRepository } from "./prisma-audit-integration-repository";

const db = createTestPrisma();
const repository = new PrismaAuditIntegrationRepository(db);
const OWNER = OwnerId.unsafe("usr_00000001");
const PROJECT = ProjectId.unsafe("proj_00000001");
const at = new Date("2026-01-01T00:00:00Z");

async function seedProject() {
  const name = makeProjectName("Film");
  if (!name.ok) throw name.error;
  await new PrismaProjectRepository(db).insert(
    createProject({ id: PROJECT, ownerId: OWNER, name: name.value, now: at }),
  );
}
const connection = (id = "extcon_00000001"): ExternalConnection => ({
  id: ExternalConnectionId.unsafe(id),
  ownerId: OWNER,
  projectId: PROJECT,
  provider: "NLE",
  externalAccountId: "account",
  displayName: "Edit suite",
  createdAt: at,
});
const event = (id: string, subjectId: string, action = "REGISTERED"): AuditEvent => ({
  id: AuditEventId.unsafe(id),
  ownerId: OWNER,
  projectId: PROJECT,
  actorId: OWNER,
  action,
  subjectType: "INTEGRATION",
  subjectId,
  occurredAt: at,
});
const run = (id: string, requestKey: string): SyncRun => ({
  id: SyncRunId.unsafe(id),
  connectionId: ExternalConnectionId.unsafe("extcon_00000001"),
  ownerId: OWNER,
  projectId: PROJECT,
  requestKey,
  status: "SUCCEEDED",
  failureCode: null,
  startedAt: at,
  completedAt: new Date(at.getTime() + 1000),
});
const identifier = (id: string, syncRunId: SyncRunId): ExternalIdentifier => ({
  id: ExternalIdentifierId.unsafe(id),
  syncRunId,
  connectionId: ExternalConnectionId.unsafe("extcon_00000001"),
  ownerId: OWNER,
  projectId: PROJECT,
  resourceType: "PROJECT",
  resourceId: PROJECT,
  externalId: "external-project",
  createdAt: new Date(at.getTime() + 1000),
});

describe("Prisma audit integration repository", () => {
  beforeEach(async () => {
    await resetDatabase(db);
    await seedProject();
  });
  afterAll(async () => {
    await db.$disconnect();
  });

  it("persists connection and audit atomically with deterministic lists", async () => {
    const value = connection();
    await repository.insertConnection(value, event("audit_00000001", value.id));
    expect(await repository.listConnections(PROJECT)).toEqual([value]);
    expect((await repository.listAuditEvents(PROJECT)).map((item) => item.id)).toEqual([
      "audit_00000001",
    ]);
  });

  it("returns one original receipt for concurrent idempotent sync writes", async () => {
    const value = connection();
    await repository.insertConnection(value, event("audit_00000001", value.id));
    const first = run("sync_00000001", "same-request");
    const second = run("sync_00000002", "same-request");
    const results = await Promise.all([
      repository.insertSyncResult({
        run: first,
        identifiers: [identifier("extid_00000001", first.id)],
        event: event("audit_00000002", first.id, "SYNCED"),
      }),
      repository.insertSyncResult({
        run: second,
        identifiers: [identifier("extid_00000002", second.id)],
        event: event("audit_00000003", second.id, "SYNCED"),
      }),
    ]);
    expect(new Set(results.map((value) => value.id)).size).toBe(1);
    expect(results[0]?.id).toBe(
      (await repository.findSyncRunByRequest(value.id, "same-request"))?.id,
    );
    expect(await db.integrationSyncRun.count()).toBe(1);
    expect(await db.externalIdentifier.count()).toBe(1);
    expect(await db.auditEvent.count()).toBe(2);
  });

  it("rolls back the run and audit when an external identifier conflicts", async () => {
    const value = connection();
    await repository.insertConnection(value, event("audit_00000001", value.id));
    const first = run("sync_00000001", "first");
    await repository.insertSyncResult({
      run: first,
      identifiers: [identifier("extid_00000001", first.id)],
      event: event("audit_00000002", first.id),
    });
    const second = run("sync_00000002", "second");
    await expect(
      repository.insertSyncResult({
        run: second,
        identifiers: [identifier("extid_00000002", second.id)],
        event: event("audit_00000003", second.id),
      }),
    ).rejects.toBeInstanceOf(ConflictError);
    expect(await db.integrationSyncRun.count()).toBe(1);
    expect(await db.auditEvent.count()).toBe(2);
  });

  it("enforces owner/project alignment in PostgreSQL", async () => {
    await expect(
      db.externalConnection.create({ data: { ...connection(), ownerId: "usr_99999999" } }),
    ).rejects.toThrow();
  });
});
