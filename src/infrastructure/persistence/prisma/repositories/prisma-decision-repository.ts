import type { PrismaClient } from "@prisma/client";
import { NotFoundError, OptimisticConcurrencyError } from "@/lib/errors";
import type { Decision, DecisionId, DecisionRepository } from "@/domain/decision";
import type { ProjectId } from "@/domain/project";
import { translatePrismaError } from "../errors";
import {
  toDecision,
  toDecisionEvidenceRows,
  toDecisionFields,
  toDecisionOptionRows,
} from "../mappers/decision-mapper";

/**
 * PostgreSQL/Prisma adapter for the Decision repository.
 * - insert: creates the decision root and its options atomically.
 * - update: compare-and-swap on lockVersion of the root row (advisory attach /
 *   human finalization). Options are immutable after proposal, so update touches
 *   only the root. A stale write (e.g. duplicate finalization) is rejected as an
 *   OptimisticConcurrencyError; a missing row as NotFound. Human-authority and
 *   advisory fields are separate columns, so advisory can never become the decision.
 */
export class PrismaDecisionRepository implements DecisionRepository {
  constructor(private readonly db: PrismaClient) {}

  async findById(id: DecisionId): Promise<Decision | null> {
    try {
      const row = await this.db.decision.findUnique({
        where: { id },
        include: { options: true, evidence: true },
      });
      return row ? toDecision(row) : null;
    } catch (error) {
      throw translatePrismaError(error);
    }
  }

  async listByProject(projectId: ProjectId): Promise<readonly Decision[]> {
    try {
      const rows = await this.db.decision.findMany({
        where: { projectId },
        include: { options: true, evidence: true },
        orderBy: { createdAt: "asc" },
      });
      return rows.map(toDecision);
    } catch (error) {
      throw translatePrismaError(error);
    }
  }

  async insert(decision: Decision): Promise<void> {
    const fields = toDecisionFields(decision);
    const options = toDecisionOptionRows(decision);
    const evidence = toDecisionEvidenceRows(decision);
    try {
      await this.db.$transaction(async (tx) => {
        await tx.decision.create({ data: fields });
        if (options.length > 0) {
          await tx.decisionOption.createMany({ data: options });
        }
        if (evidence.length > 0) {
          await tx.decisionEvidence.createMany({ data: evidence });
        }
      });
    } catch (error) {
      throw translatePrismaError(error);
    }
  }

  async update(decision: Decision): Promise<void> {
    const { id, lockVersion, ...rest } = toDecisionFields(decision);
    const evidence = toDecisionEvidenceRows(decision);
    // Root compare-and-swap plus advisory-evidence sync happen in one transaction
    // so a decision and its supporting evidence can never diverge. `updated`
    // distinguishes a stale/missing write (no rows changed) from a real update.
    let updated = false;
    try {
      await this.db.$transaction(async (tx) => {
        const result = await tx.decision.updateMany({
          where: { id, lockVersion },
          data: { ...rest, lockVersion: { increment: 1 } },
        });
        if (result.count === 0) return;
        updated = true;
        await tx.decisionEvidence.deleteMany({ where: { decisionId: id } });
        if (evidence.length > 0) {
          await tx.decisionEvidence.createMany({ data: evidence });
        }
      });
    } catch (error) {
      throw translatePrismaError(error);
    }
    if (!updated) {
      throw (await this.exists(id)) ? new OptimisticConcurrencyError() : new NotFoundError();
    }
  }

  private async exists(id: string): Promise<boolean> {
    try {
      const row = await this.db.decision.findUnique({ where: { id }, select: { id: true } });
      return row !== null;
    } catch (error) {
      throw translatePrismaError(error);
    }
  }
}
