import type { PrismaClient } from "@prisma/client";
import { NotFoundError, OptimisticConcurrencyError } from "@/lib/errors";
import type { ContentItem, ContentItemId, ContentRepository } from "@/domain/content";
import type { Slug } from "@/domain/shared";
import { translatePrismaError } from "../errors";
import { toContentFields, toContentItem } from "../mappers/content-mapper";

/**
 * PostgreSQL/Prisma adapter for the Content repository.
 * - insert: create only; slug uniqueness is enforced by the database (a violation
 *   surfaces as a CONFLICT that the create use case maps to its expected failure).
 * - update: compare-and-swap on lockVersion (missing → NotFound; mismatch → conflict).
 */
export class PrismaContentRepository implements ContentRepository {
  constructor(private readonly db: PrismaClient) {}

  async findById(id: ContentItemId): Promise<ContentItem | null> {
    try {
      const row = await this.db.contentItem.findUnique({ where: { id } });
      return row ? toContentItem(row) : null;
    } catch (error) {
      throw translatePrismaError(error);
    }
  }

  async findBySlug(slug: Slug): Promise<ContentItem | null> {
    try {
      const row = await this.db.contentItem.findUnique({ where: { slug } });
      return row ? toContentItem(row) : null;
    } catch (error) {
      throw translatePrismaError(error);
    }
  }

  async existsBySlug(slug: Slug): Promise<boolean> {
    try {
      const count = await this.db.contentItem.count({ where: { slug } });
      return count > 0;
    } catch (error) {
      throw translatePrismaError(error);
    }
  }

  async insert(item: ContentItem): Promise<void> {
    try {
      await this.db.contentItem.create({ data: toContentFields(item) });
    } catch (error) {
      throw translatePrismaError(error);
    }
  }

  async update(item: ContentItem): Promise<void> {
    const { id, lockVersion, ...rest } = toContentFields(item);
    let count: number;
    try {
      const result = await this.db.contentItem.updateMany({
        where: { id, lockVersion },
        data: { ...rest, lockVersion: { increment: 1 } },
      });
      count = result.count;
    } catch (error) {
      throw translatePrismaError(error);
    }
    if (count === 0) {
      throw (await this.exists(id)) ? new OptimisticConcurrencyError() : new NotFoundError();
    }
  }

  private async exists(id: string): Promise<boolean> {
    try {
      const row = await this.db.contentItem.findUnique({ where: { id }, select: { id: true } });
      return row !== null;
    } catch (error) {
      throw translatePrismaError(error);
    }
  }
}
