import { err, ok, type Result } from "@/lib/result";
import type { OwnerId, ProjectId } from "../project";
import {
  type Brand,
  type DomainError,
  InvalidValueError,
  defineId,
  validateBoundedText,
} from "../shared";

export type AuditEventId = Brand<string, "AuditEventId">;
export const AuditEventId = defineId<"AuditEventId">("AuditEventId", "audit");
export type ExternalConnectionId = Brand<string, "ExternalConnectionId">;
export const ExternalConnectionId = defineId<"ExternalConnectionId">(
  "ExternalConnectionId",
  "extcon",
);
export type SyncRunId = Brand<string, "SyncRunId">;
export const SyncRunId = defineId<"SyncRunId">("SyncRunId", "sync");
export type ExternalIdentifierId = Brand<string, "ExternalIdentifierId">;
export const ExternalIdentifierId = defineId<"ExternalIdentifierId">(
  "ExternalIdentifierId",
  "extid",
);

export interface AuditEvent {
  readonly id: AuditEventId;
  readonly ownerId: OwnerId;
  readonly projectId: ProjectId;
  readonly actorId: OwnerId;
  readonly action: string;
  readonly subjectType: string;
  readonly subjectId: string;
  readonly occurredAt: Date;
}
export interface ExternalConnection {
  readonly id: ExternalConnectionId;
  readonly ownerId: OwnerId;
  readonly projectId: ProjectId;
  readonly provider: string;
  readonly externalAccountId: string;
  readonly displayName: string;
  readonly createdAt: Date;
}
export type SyncRunStatus = "SUCCEEDED" | "FAILED";
export interface SyncRun {
  readonly id: SyncRunId;
  readonly connectionId: ExternalConnectionId;
  readonly ownerId: OwnerId;
  readonly projectId: ProjectId;
  readonly requestKey: string;
  readonly status: SyncRunStatus;
  readonly failureCode: string | null;
  readonly startedAt: Date;
  readonly completedAt: Date;
}
export interface ExternalIdentifier {
  readonly id: ExternalIdentifierId;
  readonly syncRunId: SyncRunId;
  readonly connectionId: ExternalConnectionId;
  readonly ownerId: OwnerId;
  readonly projectId: ProjectId;
  readonly resourceType: string;
  readonly resourceId: string;
  readonly externalId: string;
  readonly createdAt: Date;
}

const text = (value: string, label: string, max: number) =>
  validateBoundedText(value, { label, max });

export function createAuditEvent(input: AuditEvent): Result<AuditEvent, DomainError> {
  const action = text(input.action, "Audit action", 120);
  if (!action.ok) return action;
  const subjectType = text(input.subjectType, "Audit subject type", 80);
  if (!subjectType.ok) return subjectType;
  const subjectId = text(input.subjectId, "Audit subject id", 200);
  return subjectId.ok
    ? ok({
        ...input,
        action: action.value,
        subjectType: subjectType.value,
        subjectId: subjectId.value,
      })
    : subjectId;
}

export function createExternalConnection(
  input: ExternalConnection,
): Result<ExternalConnection, DomainError> {
  const provider = text(input.provider, "Integration provider", 80);
  if (!provider.ok) return provider;
  const externalAccountId = text(input.externalAccountId, "External account id", 200);
  if (!externalAccountId.ok) return externalAccountId;
  const displayName = text(input.displayName, "Connection name", 160);
  return displayName.ok
    ? ok({
        ...input,
        provider: provider.value,
        externalAccountId: externalAccountId.value,
        displayName: displayName.value,
      })
    : displayName;
}

export function createSyncRun(input: SyncRun): Result<SyncRun, DomainError> {
  const requestKey = text(input.requestKey, "Sync request key", 200);
  if (!requestKey.ok) return requestKey;
  if (input.completedAt < input.startedAt)
    return err(new InvalidValueError("Sync completion cannot precede start"));
  if ((input.status === "FAILED") !== (input.failureCode !== null))
    return err(new InvalidValueError("Failed syncs require exactly one failure code"));
  if (input.failureCode !== null) {
    const failure = text(input.failureCode, "Sync failure code", 80);
    if (!failure.ok) return failure;
  }
  return ok({ ...input, requestKey: requestKey.value });
}

export function createExternalIdentifier(
  input: ExternalIdentifier,
): Result<ExternalIdentifier, DomainError> {
  const resourceType = text(input.resourceType, "Resource type", 80);
  if (!resourceType.ok) return resourceType;
  const resourceId = text(input.resourceId, "Resource id", 200);
  if (!resourceId.ok) return resourceId;
  const externalId = text(input.externalId, "External id", 300);
  return externalId.ok
    ? ok({
        ...input,
        resourceType: resourceType.value,
        resourceId: resourceId.value,
        externalId: externalId.value,
      })
    : externalId;
}
