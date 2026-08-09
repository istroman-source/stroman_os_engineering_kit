import {
  AuditEventId,
  ExternalConnectionId,
  ExternalIdentifierId,
  SyncRunId,
  createAuditEvent,
  createExternalConnection,
  createExternalIdentifier,
  createSyncRun,
  type AuditIntegrationRepository,
  type ExternalConnection,
  type ExternalIdentifier,
  type SyncRun,
  type SyncRunStatus,
} from "@/domain/audit-integration";
import type { OwnerId, ProjectId, ProjectRepository } from "@/domain/project";
import type { DomainError } from "@/domain/shared";
import { err, ok, type Result } from "@/lib/result";
import { attempt } from "../shared/attempt";
import { ensureOwner } from "../shared/authorization";
import type { Clock } from "../shared/clock";
import { NotAuthorizedError, NotFoundError, RepositoryError } from "../shared/errors";
import type { IdGenerator } from "../shared/id-generator";

export interface AuditIntegrationDeps {
  projects: ProjectRepository;
  records: AuditIntegrationRepository;
  ids: IdGenerator;
  clock: Clock;
}
type Failure = DomainError | NotFoundError | NotAuthorizedError | RepositoryError;
type ConnectionView = Omit<ExternalConnection, "ownerId">;
type SyncRunView = Omit<SyncRun, "ownerId">;
type IdentifierView = Omit<ExternalIdentifier, "ownerId">;
const connectionView = ({ ownerId, ...value }: ExternalConnection): ConnectionView => {
  void ownerId;
  return value;
};
const syncView = ({ ownerId, ...value }: SyncRun): SyncRunView => {
  void ownerId;
  return value;
};
const identifierView = ({ ownerId, ...value }: ExternalIdentifier): IdentifierView => {
  void ownerId;
  return value;
};

async function ownedProject(
  deps: AuditIntegrationDeps,
  actorId: OwnerId,
  projectId: ProjectId,
  action: string,
): Promise<Result<void, NotFoundError | NotAuthorizedError | RepositoryError>> {
  const loaded = await attempt("project.findById", () => deps.projects.findById(projectId));
  if (!loaded.ok) return loaded;
  if (!loaded.value) return err(new NotFoundError("Project", projectId));
  const owned = ensureOwner(actorId, loaded.value.ownerId, action);
  return owned.ok ? ok(undefined) : owned;
}

export async function registerExternalConnection(
  deps: AuditIntegrationDeps,
  input: {
    actorId: OwnerId;
    projectId: ProjectId;
    provider: string;
    externalAccountId: string;
    displayName: string;
  },
): Promise<Result<ConnectionView, Failure>> {
  const owned = await ownedProject(deps, input.actorId, input.projectId, "integration.register");
  if (!owned.ok) return owned;
  const now = deps.clock.now();
  const connection = createExternalConnection({
    id: ExternalConnectionId.unsafe(deps.ids.generate(ExternalConnectionId.prefix)),
    ownerId: input.actorId,
    projectId: input.projectId,
    provider: input.provider,
    externalAccountId: input.externalAccountId,
    displayName: input.displayName,
    createdAt: now,
  });
  if (!connection.ok) return connection;
  const event = createAuditEvent({
    id: AuditEventId.unsafe(deps.ids.generate(AuditEventId.prefix)),
    ownerId: input.actorId,
    projectId: input.projectId,
    actorId: input.actorId,
    action: "INTEGRATION_CONNECTION_REGISTERED",
    subjectType: "EXTERNAL_CONNECTION",
    subjectId: connection.value.id,
    occurredAt: now,
  });
  if (!event.ok) return event;
  const saved = await attempt("integration.insertConnection", () =>
    deps.records.insertConnection(connection.value, event.value),
  );
  return saved.ok ? ok(connectionView(connection.value)) : saved;
}

export interface ExternalIdentifierInput {
  resourceType: string;
  resourceId: string;
  externalId: string;
}
export async function recordSyncResult(
  deps: AuditIntegrationDeps,
  input: {
    actorId: OwnerId;
    projectId: ProjectId;
    connectionId: ExternalConnectionId;
    requestKey: string;
    status: SyncRunStatus;
    failureCode?: string | null;
    startedAt: Date;
    identifiers: readonly ExternalIdentifierInput[];
  },
): Promise<Result<SyncRunView, Failure>> {
  const owned = await ownedProject(deps, input.actorId, input.projectId, "integration.sync.record");
  if (!owned.ok) return owned;
  const loaded = await attempt("integration.findConnectionById", () =>
    deps.records.findConnectionById(input.connectionId),
  );
  if (!loaded.ok) return loaded;
  if (!loaded.value) return err(new NotFoundError("ExternalConnection", input.connectionId));
  if (loaded.value.ownerId !== input.actorId || loaded.value.projectId !== input.projectId)
    return err(new NotAuthorizedError("integration.sync.record"));
  const existing = await attempt("integration.findSyncRunByRequest", () =>
    deps.records.findSyncRunByRequest(input.connectionId, input.requestKey.trim()),
  );
  if (!existing.ok) return existing;
  if (existing.value) return ok(syncView(existing.value));
  const now = deps.clock.now();
  const run = createSyncRun({
    id: SyncRunId.unsafe(deps.ids.generate(SyncRunId.prefix)),
    connectionId: input.connectionId,
    ownerId: input.actorId,
    projectId: input.projectId,
    requestKey: input.requestKey,
    status: input.status,
    failureCode: input.failureCode ?? null,
    startedAt: input.startedAt,
    completedAt: now,
  });
  if (!run.ok) return run;
  const identifiers: ExternalIdentifier[] = [];
  for (const value of input.identifiers) {
    const identifier = createExternalIdentifier({
      id: ExternalIdentifierId.unsafe(deps.ids.generate(ExternalIdentifierId.prefix)),
      syncRunId: run.value.id,
      connectionId: input.connectionId,
      ownerId: input.actorId,
      projectId: input.projectId,
      ...value,
      createdAt: now,
    });
    if (!identifier.ok) return identifier;
    identifiers.push(identifier.value);
  }
  const event = createAuditEvent({
    id: AuditEventId.unsafe(deps.ids.generate(AuditEventId.prefix)),
    ownerId: input.actorId,
    projectId: input.projectId,
    actorId: input.actorId,
    action: `INTEGRATION_SYNC_${input.status}`,
    subjectType: "SYNC_RUN",
    subjectId: run.value.id,
    occurredAt: now,
  });
  if (!event.ok) return event;
  const saved = await attempt("integration.insertSyncResult", () =>
    deps.records.insertSyncResult({ run: run.value, identifiers, event: event.value }),
  );
  return saved.ok ? ok(syncView(saved.value)) : saved;
}

export async function listIntegrationHistory(
  deps: AuditIntegrationDeps,
  input: { actorId: OwnerId; projectId: ProjectId; connectionId: ExternalConnectionId },
): Promise<
  Result<{ runs: readonly SyncRunView[]; identifiers: readonly IdentifierView[] }, Failure>
> {
  const owned = await ownedProject(
    deps,
    input.actorId,
    input.projectId,
    "integration.history.list",
  );
  if (!owned.ok) return owned;
  const connection = await attempt("integration.findConnectionById", () =>
    deps.records.findConnectionById(input.connectionId),
  );
  if (!connection.ok) return connection;
  if (!connection.value) return err(new NotFoundError("ExternalConnection", input.connectionId));
  if (connection.value.ownerId !== input.actorId || connection.value.projectId !== input.projectId)
    return err(new NotAuthorizedError("integration.history.list"));
  const loaded = await attempt("integration.history", async () => ({
    runs: await deps.records.listSyncRuns(input.connectionId),
    identifiers: await deps.records.listExternalIdentifiers(input.connectionId),
  }));
  return loaded.ok
    ? ok({
        runs: loaded.value.runs.map(syncView),
        identifiers: loaded.value.identifiers.map(identifierView),
      })
    : loaded;
}
