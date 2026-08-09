import type { ProjectId } from "../project";
import type { AuditEvent, ExternalConnection, ExternalIdentifier, SyncRun } from "./model";
import type { ExternalConnectionId } from "./model";

export interface AuditIntegrationRepository {
  findConnectionById(id: ExternalConnectionId): Promise<ExternalConnection | null>;
  listConnections(projectId: ProjectId): Promise<readonly ExternalConnection[]>;
  listAuditEvents(projectId: ProjectId): Promise<readonly AuditEvent[]>;
  findSyncRunByRequest(
    connectionId: ExternalConnectionId,
    requestKey: string,
  ): Promise<SyncRun | null>;
  listSyncRuns(connectionId: ExternalConnectionId): Promise<readonly SyncRun[]>;
  listExternalIdentifiers(
    connectionId: ExternalConnectionId,
  ): Promise<readonly ExternalIdentifier[]>;
  insertConnection(value: ExternalConnection, event: AuditEvent): Promise<void>;
  insertSyncResult(input: {
    run: SyncRun;
    identifiers: readonly ExternalIdentifier[];
    event: AuditEvent;
  }): Promise<SyncRun>;
}
