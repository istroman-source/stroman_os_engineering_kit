import type {
  AuditEvent as AuditEventRow,
  ExternalConnection as ConnectionRow,
  ExternalIdentifier as IdentifierRow,
  IntegrationSyncRun as SyncRow,
} from "@prisma/client";
import {
  AuditEventId,
  ExternalConnectionId,
  ExternalIdentifierId,
  SyncRunId,
  createAuditEvent,
  createExternalConnection,
  createExternalIdentifier,
  createSyncRun,
  type AuditEvent,
  type ExternalConnection,
  type ExternalIdentifier,
  type SyncRun,
} from "@/domain/audit-integration";
import { OwnerId, ProjectId } from "@/domain/project";
import { orThrowMapping } from "./shared";

const ids = (row: { ownerId: string; projectId: string }) => ({
  ownerId: orThrowMapping(OwnerId.parse(row.ownerId), `ownerId="${row.ownerId}"`),
  projectId: orThrowMapping(ProjectId.parse(row.projectId), `projectId="${row.projectId}"`),
});
export const toAuditEvent = (row: AuditEventRow): AuditEvent =>
  orThrowMapping(
    createAuditEvent({
      id: orThrowMapping(AuditEventId.parse(row.id), `auditEvent.id="${row.id}"`),
      ...ids(row),
      actorId: orThrowMapping(OwnerId.parse(row.actorId), `auditEvent.actorId="${row.actorId}"`),
      action: row.action,
      subjectType: row.subjectType,
      subjectId: row.subjectId,
      occurredAt: row.occurredAt,
    }),
    `auditEvent="${row.id}"`,
  );
export const toExternalConnection = (row: ConnectionRow): ExternalConnection =>
  orThrowMapping(
    createExternalConnection({
      id: orThrowMapping(ExternalConnectionId.parse(row.id), `connection.id="${row.id}"`),
      ...ids(row),
      provider: row.provider,
      externalAccountId: row.externalAccountId,
      displayName: row.displayName,
      createdAt: row.createdAt,
    }),
    `connection="${row.id}"`,
  );
export const toSyncRun = (row: SyncRow): SyncRun =>
  orThrowMapping(
    createSyncRun({
      id: orThrowMapping(SyncRunId.parse(row.id), `syncRun.id="${row.id}"`),
      connectionId: orThrowMapping(
        ExternalConnectionId.parse(row.connectionId),
        `syncRun.connectionId="${row.connectionId}"`,
      ),
      ...ids(row),
      requestKey: row.requestKey,
      status: row.status,
      failureCode: row.failureCode,
      startedAt: row.startedAt,
      completedAt: row.completedAt,
    }),
    `syncRun="${row.id}"`,
  );
export const toExternalIdentifier = (row: IdentifierRow): ExternalIdentifier =>
  orThrowMapping(
    createExternalIdentifier({
      id: orThrowMapping(ExternalIdentifierId.parse(row.id), `externalIdentifier.id="${row.id}"`),
      syncRunId: orThrowMapping(
        SyncRunId.parse(row.syncRunId),
        `externalIdentifier.syncRunId="${row.syncRunId}"`,
      ),
      connectionId: orThrowMapping(
        ExternalConnectionId.parse(row.connectionId),
        `externalIdentifier.connectionId="${row.connectionId}"`,
      ),
      ...ids(row),
      resourceType: row.resourceType,
      resourceId: row.resourceId,
      externalId: row.externalId,
      createdAt: row.createdAt,
    }),
    `externalIdentifier="${row.id}"`,
  );

export const auditData = (v: AuditEvent) => ({ ...v });
export const connectionData = (v: ExternalConnection) => ({ ...v });
export const syncData = (v: SyncRun) => ({ ...v });
export const identifierData = (v: ExternalIdentifier) => ({ ...v });
