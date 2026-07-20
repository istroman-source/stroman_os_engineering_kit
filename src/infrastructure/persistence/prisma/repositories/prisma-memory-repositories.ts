import type { PrismaClient } from "@prisma/client";
import type { OwnerId } from "@/domain/project";
import type {
  Entity,
  EntityId,
  EntityRepository,
  Insight,
  InsightId,
  InsightRepository,
  MemoryId,
  MemoryRecord,
  MemoryRepository,
  Relationship,
  RelationshipId,
  RelationshipRepository,
  Source,
  SourceId,
  SourceRepository,
} from "@/domain/memory";
import { translatePrismaError } from "../errors";
import {
  toEntity,
  toEntityFields,
  toInsight,
  toInsightFields,
  toInsightMemoryRows,
  toMemory,
  toMemoryFields,
  toRelationship,
  toRelationshipFields,
  toSource,
  toSourceFields,
} from "../mappers/memory-mappers";

export class PrismaEntityRepository implements EntityRepository {
  constructor(private readonly db: PrismaClient) {}
  async insert(entity: Entity): Promise<void> {
    try {
      await this.db.entity.create({ data: toEntityFields(entity) });
    } catch (error) {
      throw translatePrismaError(error);
    }
  }
  async findById(id: EntityId): Promise<Entity | null> {
    try {
      const row = await this.db.entity.findUnique({ where: { id } });
      return row ? toEntity(row) : null;
    } catch (error) {
      throw translatePrismaError(error);
    }
  }
  async listByOwner(ownerId: OwnerId): Promise<readonly Entity[]> {
    try {
      const rows = await this.db.entity.findMany({
        where: { ownerId },
        orderBy: { createdAt: "asc" },
      });
      return rows.map(toEntity);
    } catch (error) {
      throw translatePrismaError(error);
    }
  }
  async delete(id: EntityId): Promise<void> {
    try {
      await this.db.entity.delete({ where: { id } });
    } catch (error) {
      throw translatePrismaError(error);
    }
  }
}

export class PrismaSourceRepository implements SourceRepository {
  constructor(private readonly db: PrismaClient) {}
  async insert(source: Source): Promise<void> {
    try {
      await this.db.source.create({ data: toSourceFields(source) });
    } catch (error) {
      throw translatePrismaError(error);
    }
  }
  async findById(id: SourceId): Promise<Source | null> {
    try {
      const row = await this.db.source.findUnique({ where: { id } });
      return row ? toSource(row) : null;
    } catch (error) {
      throw translatePrismaError(error);
    }
  }
  async listByOwner(ownerId: OwnerId): Promise<readonly Source[]> {
    try {
      const rows = await this.db.source.findMany({
        where: { ownerId },
        orderBy: { createdAt: "asc" },
      });
      return rows.map(toSource);
    } catch (error) {
      throw translatePrismaError(error);
    }
  }
  async delete(id: SourceId): Promise<void> {
    try {
      await this.db.source.delete({ where: { id } });
    } catch (error) {
      throw translatePrismaError(error);
    }
  }
}

export class PrismaMemoryRepository implements MemoryRepository {
  constructor(private readonly db: PrismaClient) {}
  async insert(memory: MemoryRecord): Promise<void> {
    try {
      await this.db.memory.create({ data: toMemoryFields(memory) });
    } catch (error) {
      throw translatePrismaError(error);
    }
  }
  async findById(id: MemoryId): Promise<MemoryRecord | null> {
    try {
      const row = await this.db.memory.findUnique({ where: { id } });
      return row ? toMemory(row) : null;
    } catch (error) {
      throw translatePrismaError(error);
    }
  }
  async listByEntity(entityId: EntityId): Promise<readonly MemoryRecord[]> {
    try {
      const rows = await this.db.memory.findMany({
        where: { entityId },
        orderBy: { createdAt: "asc" },
      });
      return rows.map(toMemory);
    } catch (error) {
      throw translatePrismaError(error);
    }
  }
  async listBySource(sourceId: SourceId): Promise<readonly MemoryRecord[]> {
    try {
      const rows = await this.db.memory.findMany({
        where: { sourceId },
        orderBy: { createdAt: "asc" },
      });
      return rows.map(toMemory);
    } catch (error) {
      throw translatePrismaError(error);
    }
  }
  async delete(id: MemoryId): Promise<void> {
    try {
      await this.db.memory.delete({ where: { id } });
    } catch (error) {
      throw translatePrismaError(error);
    }
  }
}

export class PrismaRelationshipRepository implements RelationshipRepository {
  constructor(private readonly db: PrismaClient) {}
  async insert(relationship: Relationship): Promise<void> {
    try {
      await this.db.relationship.create({ data: toRelationshipFields(relationship) });
    } catch (error) {
      throw translatePrismaError(error);
    }
  }
  async findById(id: RelationshipId): Promise<Relationship | null> {
    try {
      const row = await this.db.relationship.findUnique({ where: { id } });
      return row ? toRelationship(row) : null;
    } catch (error) {
      throw translatePrismaError(error);
    }
  }
  async listByEntity(entityId: EntityId): Promise<readonly Relationship[]> {
    try {
      const rows = await this.db.relationship.findMany({
        where: { OR: [{ fromEntityId: entityId }, { toEntityId: entityId }] },
        orderBy: { createdAt: "asc" },
      });
      return rows.map(toRelationship);
    } catch (error) {
      throw translatePrismaError(error);
    }
  }
  async delete(id: RelationshipId): Promise<void> {
    try {
      await this.db.relationship.delete({ where: { id } });
    } catch (error) {
      throw translatePrismaError(error);
    }
  }
}

export class PrismaInsightRepository implements InsightRepository {
  constructor(private readonly db: PrismaClient) {}
  async insert(insight: Insight): Promise<void> {
    try {
      await this.db.$transaction(async (tx) => {
        await tx.insight.create({ data: toInsightFields(insight) });
        await tx.insightMemory.createMany({ data: toInsightMemoryRows(insight) });
      });
    } catch (error) {
      throw translatePrismaError(error);
    }
  }
  async findById(id: InsightId): Promise<Insight | null> {
    try {
      const row = await this.db.insight.findUnique({ where: { id }, include: { memories: true } });
      return row ? toInsight(row) : null;
    } catch (error) {
      throw translatePrismaError(error);
    }
  }
  async listByMemory(memoryId: MemoryId): Promise<readonly Insight[]> {
    return this.listByMemoryIds([memoryId]);
  }
  async listByMemoryIds(memoryIds: readonly MemoryId[]): Promise<readonly Insight[]> {
    if (memoryIds.length === 0) return [];
    try {
      const rows = await this.db.insight.findMany({
        where: { memories: { some: { memoryId: { in: [...memoryIds] } } } },
        include: { memories: true },
        orderBy: { createdAt: "asc" },
      });
      return rows.map(toInsight);
    } catch (error) {
      throw translatePrismaError(error);
    }
  }
  async delete(id: InsightId): Promise<void> {
    try {
      await this.db.insight.delete({ where: { id } });
    } catch (error) {
      throw translatePrismaError(error);
    }
  }
}
