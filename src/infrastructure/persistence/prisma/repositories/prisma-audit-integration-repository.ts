import type { PrismaClient } from "@prisma/client";
import type { AuditIntegrationRepository, ExternalConnectionId } from "@/domain/audit-integration";
import type { ProjectId } from "@/domain/project";
import { ConflictError } from "@/lib/errors";
import { translatePrismaError } from "../errors";
import {
  auditData,
  connectionData,
  identifierData,
  syncData,
  toAuditEvent,
  toExternalConnection,
  toExternalIdentifier,
  toSyncRun,
} from "../mappers/audit-integration-mapper";

export class PrismaAuditIntegrationRepository implements AuditIntegrationRepository {
  constructor(private readonly db: PrismaClient) {}
  async findConnectionById(id: ExternalConnectionId) {
    const row = await this.db.externalConnection.findUnique({ where: { id } }).catch((e) => {
      throw translatePrismaError(e);
    });
    return row ? toExternalConnection(row) : null;
  }
  async listConnections(projectId: ProjectId) {
    try {
      return (
        await this.db.externalConnection.findMany({
          where: { projectId },
          orderBy: [{ createdAt: "asc" }, { id: "asc" }],
        })
      ).map(toExternalConnection);
    } catch (error) {
      throw translatePrismaError(error);
    }
  }
  async listAuditEvents(projectId: ProjectId) {
    try {
      return (
        await this.db.auditEvent.findMany({
          where: { projectId },
          orderBy: [{ occurredAt: "asc" }, { id: "asc" }],
        })
      ).map(toAuditEvent);
    } catch (error) {
      throw translatePrismaError(error);
    }
  }
  async findSyncRunByRequest(connectionId: ExternalConnectionId, requestKey: string) {
    try {
      const row = await this.db.integrationSyncRun.findUnique({
        where: { connectionId_requestKey: { connectionId, requestKey } },
      });
      return row ? toSyncRun(row) : null;
    } catch (error) {
      throw translatePrismaError(error);
    }
  }
  async listSyncRuns(connectionId: ExternalConnectionId) {
    try {
      return (
        await this.db.integrationSyncRun.findMany({
          where: { connectionId },
          orderBy: [{ completedAt: "asc" }, { id: "asc" }],
        })
      ).map(toSyncRun);
    } catch (error) {
      throw translatePrismaError(error);
    }
  }
  async listExternalIdentifiers(connectionId: ExternalConnectionId) {
    try {
      return (
        await this.db.externalIdentifier.findMany({
          where: { connectionId },
          orderBy: [{ createdAt: "asc" }, { id: "asc" }],
        })
      ).map(toExternalIdentifier);
    } catch (error) {
      throw translatePrismaError(error);
    }
  }
  async insertConnection(
    value: Parameters<AuditIntegrationRepository["insertConnection"]>[0],
    event: Parameters<AuditIntegrationRepository["insertConnection"]>[1],
  ) {
    try {
      await this.db.$transaction([
        this.db.externalConnection.create({ data: connectionData(value) }),
        this.db.auditEvent.create({ data: auditData(event) }),
      ]);
    } catch (error) {
      throw translatePrismaError(error);
    }
  }
  async insertSyncResult(input: Parameters<AuditIntegrationRepository["insertSyncResult"]>[0]) {
    try {
      await this.db.$transaction(async (tx) => {
        await tx.integrationSyncRun.create({ data: syncData(input.run) });
        if (input.identifiers.length)
          await tx.externalIdentifier.createMany({ data: input.identifiers.map(identifierData) });
        await tx.auditEvent.create({ data: auditData(input.event) });
      });
      return input.run;
    } catch (error) {
      const translated = translatePrismaError(error);
      if (translated instanceof ConflictError) {
        const survivor = await this.findSyncRunByRequest(
          input.run.connectionId,
          input.run.requestKey,
        );
        if (survivor) return survivor;
      }
      throw translated;
    }
  }
}
