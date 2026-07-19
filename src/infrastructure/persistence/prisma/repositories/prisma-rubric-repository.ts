import type { PrismaClient } from "@prisma/client";
import type { Rubric, RubricId, RubricRepository } from "@/domain/evaluation";
import { translatePrismaError } from "../errors";
import { toRubric, toRubricCriteriaRows, toRubricFields } from "../mappers/rubric-mapper";

/**
 * PostgreSQL/Prisma adapter for the Rubric repository. Rubrics are append-only, so
 * only `insert` is supported: the root and its criteria are created atomically in a
 * transaction, and a duplicate id is rejected by the primary key.
 */
export class PrismaRubricRepository implements RubricRepository {
  constructor(private readonly db: PrismaClient) {}

  async findById(id: RubricId): Promise<Rubric | null> {
    try {
      const row = await this.db.rubric.findUnique({ where: { id }, include: { criteria: true } });
      return row ? toRubric(row) : null;
    } catch (error) {
      throw translatePrismaError(error);
    }
  }

  async insert(rubric: Rubric): Promise<void> {
    const fields = toRubricFields(rubric);
    const criteria = toRubricCriteriaRows(rubric);
    try {
      await this.db.$transaction(async (tx) => {
        await tx.rubric.create({ data: fields });
        if (criteria.length > 0) {
          await tx.rubricCriterion.createMany({ data: criteria });
        }
      });
    } catch (error) {
      throw translatePrismaError(error);
    }
  }
}
