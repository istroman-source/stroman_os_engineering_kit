import type { PrismaClient } from "@prisma/client";
import { NotFoundError, OptimisticConcurrencyError } from "@/lib/errors";
import type { OwnerId } from "@/domain/project";
import type {
  AcquisitionRun,
  AcquisitionRunId,
  AcquisitionRunRepository,
  KnowledgeObservation,
  KnowledgeObservationId,
  KnowledgeObservationRepository,
  KnowledgeReview,
  KnowledgeReviewId,
  KnowledgeReviewRepository,
  KnowledgeSource,
  KnowledgeSourceId,
  KnowledgeSourceRepository,
  SourceDocument,
  SourceDocumentId,
  SourceDocumentRepository,
} from "@/domain/knowledge-acquisition";
import { translatePrismaError } from "../errors";
import {
  toAcquisitionRun,
  toAcquisitionRunFields,
  toKnowledgeObservation,
  toKnowledgeObservationFields,
  toKnowledgeReview,
  toKnowledgeReviewFields,
  toKnowledgeSource,
  toKnowledgeSourceFields,
  toSourceDocument,
  toSourceDocumentFields,
} from "../mappers/knowledge-acquisition-mappers";

export class PrismaKnowledgeSourceRepository implements KnowledgeSourceRepository {
  constructor(private readonly db: PrismaClient) {}
  async insert(v: KnowledgeSource) {
    try {
      await this.db.knowledgeSource.create({ data: toKnowledgeSourceFields(v) });
    } catch (e) {
      throw translatePrismaError(e);
    }
  }
  async findById(id: KnowledgeSourceId) {
    try {
      const r = await this.db.knowledgeSource.findUnique({ where: { id } });
      return r ? toKnowledgeSource(r) : null;
    } catch (e) {
      throw translatePrismaError(e);
    }
  }
  async listByOwner(ownerId: OwnerId) {
    try {
      return (
        await this.db.knowledgeSource.findMany({
          where: { ownerId },
          orderBy: { createdAt: "asc" },
        })
      ).map(toKnowledgeSource);
    } catch (e) {
      throw translatePrismaError(e);
    }
  }
  async update(v: KnowledgeSource) {
    const { id, lockVersion, ...data } = toKnowledgeSourceFields(v);
    void lockVersion;
    try {
      const r = await this.db.knowledgeSource.updateMany({
        where: { id, lockVersion: v.lockVersion - 1 },
        data: { ...data, lockVersion: v.lockVersion },
      });
      if (!r.count) {
        const exists = await this.db.knowledgeSource.findUnique({
          where: { id },
          select: { id: true },
        });
        throw exists ? new OptimisticConcurrencyError() : new NotFoundError();
      }
    } catch (e) {
      if (e instanceof NotFoundError || e instanceof OptimisticConcurrencyError) throw e;
      throw translatePrismaError(e);
    }
  }
}
export class PrismaSourceDocumentRepository implements SourceDocumentRepository {
  constructor(private readonly db: PrismaClient) {}
  async insert(v: SourceDocument) {
    try {
      await this.db.sourceDocument.create({ data: toSourceDocumentFields(v) });
    } catch (e) {
      throw translatePrismaError(e);
    }
  }
  async findById(id: SourceDocumentId) {
    try {
      const r = await this.db.sourceDocument.findUnique({ where: { id } });
      return r ? toSourceDocument(r) : null;
    } catch (e) {
      throw translatePrismaError(e);
    }
  }
  async listBySource(knowledgeSourceId: KnowledgeSourceId) {
    try {
      return (
        await this.db.sourceDocument.findMany({
          where: { knowledgeSourceId },
          orderBy: { createdAt: "asc" },
        })
      ).map(toSourceDocument);
    } catch (e) {
      throw translatePrismaError(e);
    }
  }
  async findBySourceAndHash(knowledgeSourceId: KnowledgeSourceId, contentHash: string) {
    try {
      const r = await this.db.sourceDocument.findUnique({
        where: { knowledgeSourceId_contentHash: { knowledgeSourceId, contentHash } },
      });
      return r ? toSourceDocument(r) : null;
    } catch (e) {
      throw translatePrismaError(e);
    }
  }
}
export class PrismaAcquisitionRunRepository implements AcquisitionRunRepository {
  constructor(private readonly db: PrismaClient) {}
  async insert(v: AcquisitionRun) {
    try {
      await this.db.acquisitionRun.create({ data: toAcquisitionRunFields(v) });
    } catch (e) {
      throw translatePrismaError(e);
    }
  }
  async findById(id: AcquisitionRunId) {
    try {
      const r = await this.db.acquisitionRun.findUnique({ where: { id } });
      return r ? toAcquisitionRun(r) : null;
    } catch (e) {
      throw translatePrismaError(e);
    }
  }
  async listBySource(knowledgeSourceId: KnowledgeSourceId) {
    try {
      return (
        await this.db.acquisitionRun.findMany({
          where: { knowledgeSourceId },
          orderBy: { createdAt: "asc" },
        })
      ).map(toAcquisitionRun);
    } catch (e) {
      throw translatePrismaError(e);
    }
  }
  async update(v: AcquisitionRun) {
    const { id, lockVersion, ...data } = toAcquisitionRunFields(v);
    void lockVersion;
    try {
      const r = await this.db.acquisitionRun.updateMany({
        where: { id, lockVersion: v.lockVersion - 1 },
        data: { ...data, lockVersion: v.lockVersion },
      });
      if (!r.count) {
        const exists = await this.db.acquisitionRun.findUnique({
          where: { id },
          select: { id: true },
        });
        throw exists ? new OptimisticConcurrencyError() : new NotFoundError();
      }
    } catch (e) {
      if (e instanceof NotFoundError || e instanceof OptimisticConcurrencyError) throw e;
      throw translatePrismaError(e);
    }
  }
}
export class PrismaKnowledgeObservationRepository implements KnowledgeObservationRepository {
  constructor(private readonly db: PrismaClient) {}
  async insert(v: KnowledgeObservation) {
    try {
      await this.db.knowledgeObservation.create({ data: toKnowledgeObservationFields(v) });
    } catch (e) {
      throw translatePrismaError(e);
    }
  }
  async findById(id: KnowledgeObservationId) {
    try {
      const r = await this.db.knowledgeObservation.findUnique({ where: { id } });
      return r ? toKnowledgeObservation(r) : null;
    } catch (e) {
      throw translatePrismaError(e);
    }
  }
  async listByDocument(sourceDocumentId: SourceDocumentId) {
    try {
      return (
        await this.db.knowledgeObservation.findMany({
          where: { sourceDocumentId },
          orderBy: { createdAt: "asc" },
        })
      ).map(toKnowledgeObservation);
    } catch (e) {
      throw translatePrismaError(e);
    }
  }
  async listByRun(acquisitionRunId: AcquisitionRunId) {
    try {
      return (
        await this.db.knowledgeObservation.findMany({
          where: { acquisitionRunId },
          orderBy: { createdAt: "asc" },
        })
      ).map(toKnowledgeObservation);
    } catch (e) {
      throw translatePrismaError(e);
    }
  }
  async applyReview(observation: KnowledgeObservation, review: KnowledgeReview) {
    try {
      await this.db.$transaction(async (tx) => {
        const r = await tx.knowledgeObservation.updateMany({
          where: { id: observation.id, lockVersion: observation.lockVersion - 1 },
          data: { status: observation.status, lockVersion: observation.lockVersion },
        });
        if (!r.count) {
          const exists = await tx.knowledgeObservation.findUnique({
            where: { id: observation.id },
            select: { id: true },
          });
          throw exists ? new OptimisticConcurrencyError() : new NotFoundError();
        }
        await tx.knowledgeReview.create({ data: toKnowledgeReviewFields(review) });
      });
    } catch (e) {
      if (e instanceof NotFoundError || e instanceof OptimisticConcurrencyError) throw e;
      throw translatePrismaError(e);
    }
  }
}
export class PrismaKnowledgeReviewRepository implements KnowledgeReviewRepository {
  constructor(private readonly db: PrismaClient) {}
  async findById(id: KnowledgeReviewId) {
    try {
      const r = await this.db.knowledgeReview.findUnique({ where: { id } });
      return r ? toKnowledgeReview(r) : null;
    } catch (e) {
      throw translatePrismaError(e);
    }
  }
  async findByObservation(knowledgeObservationId: KnowledgeObservationId) {
    try {
      const r = await this.db.knowledgeReview.findUnique({ where: { knowledgeObservationId } });
      return r ? toKnowledgeReview(r) : null;
    } catch (e) {
      throw translatePrismaError(e);
    }
  }
}
