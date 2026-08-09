import type {
  AuditEvent,
  AuditIntegrationRepository,
  ExternalConnection,
  ExternalConnectionId,
  ExternalIdentifier,
  SyncRun,
} from "@/domain/audit-integration";
import type { ProjectId } from "@/domain/project";
import { ConflictError } from "@/lib/errors";

const ordered = <T extends { id: string }>(values: T[], at: (value: T) => Date) =>
  values.sort((a, b) => at(a).getTime() - at(b).getTime() || a.id.localeCompare(b.id));

export class InMemoryAuditIntegrationRepository implements AuditIntegrationRepository {
  readonly connections = new Map<string, ExternalConnection>();
  readonly events = new Map<string, AuditEvent>();
  readonly runs = new Map<string, SyncRun>();
  readonly identifiers = new Map<string, ExternalIdentifier>();
  failNext = false;
  private guard() {
    if (this.failNext) {
      this.failNext = false;
      throw new Error("in-memory repository failure");
    }
  }
  async findConnectionById(id: ExternalConnectionId) {
    this.guard();
    return this.connections.get(id) ?? null;
  }
  async listConnections(projectId: ProjectId) {
    this.guard();
    return ordered(
      [...this.connections.values()].filter((value) => value.projectId === projectId),
      (value) => value.createdAt,
    );
  }
  async listAuditEvents(projectId: ProjectId) {
    this.guard();
    return ordered(
      [...this.events.values()].filter((value) => value.projectId === projectId),
      (value) => value.occurredAt,
    );
  }
  async findSyncRunByRequest(connectionId: ExternalConnectionId, requestKey: string) {
    this.guard();
    return (
      [...this.runs.values()].find(
        (value) => value.connectionId === connectionId && value.requestKey === requestKey,
      ) ?? null
    );
  }
  async listSyncRuns(connectionId: ExternalConnectionId) {
    this.guard();
    return ordered(
      [...this.runs.values()].filter((value) => value.connectionId === connectionId),
      (value) => value.completedAt,
    );
  }
  async listExternalIdentifiers(connectionId: ExternalConnectionId) {
    this.guard();
    return ordered(
      [...this.identifiers.values()].filter((value) => value.connectionId === connectionId),
      (value) => value.createdAt,
    );
  }
  async insertConnection(value: ExternalConnection, event: AuditEvent) {
    this.guard();
    if (this.connections.has(value.id) || this.events.has(event.id)) throw new ConflictError();
    if (
      [...this.connections.values()].some(
        (current) =>
          current.projectId === value.projectId &&
          current.provider === value.provider &&
          current.externalAccountId === value.externalAccountId,
      )
    )
      throw new ConflictError();
    this.connections.set(value.id, value);
    this.events.set(event.id, event);
  }
  async insertSyncResult(input: {
    run: SyncRun;
    identifiers: readonly ExternalIdentifier[];
    event: AuditEvent;
  }) {
    this.guard();
    const survivor = await this.findSyncRunByRequest(input.run.connectionId, input.run.requestKey);
    if (survivor) return survivor;
    const internal = new Set<string>();
    const external = new Set<string>();
    for (const identifier of [...this.identifiers.values(), ...input.identifiers]) {
      const internalKey = `${identifier.connectionId}:${identifier.resourceType}:${identifier.resourceId}`;
      const externalKey = `${identifier.connectionId}:${identifier.externalId}`;
      if (internal.has(internalKey) || external.has(externalKey)) throw new ConflictError();
      internal.add(internalKey);
      external.add(externalKey);
    }
    if (
      this.runs.has(input.run.id) ||
      this.events.has(input.event.id) ||
      input.identifiers.some((value) => this.identifiers.has(value.id))
    )
      throw new ConflictError();
    this.runs.set(input.run.id, input.run);
    input.identifiers.forEach((value) => this.identifiers.set(value.id, value));
    this.events.set(input.event.id, input.event);
    return input.run;
  }
}
