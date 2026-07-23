import type { PrismaClient } from "@prisma/client";
import type {
  AnalysisOutput,
  AnalysisRecommendation,
  AnalysisRepository,
  AnalysisRun,
  AnalysisRunId,
  AnalysisRunStatus,
} from "@/domain/analysis";
import type { ProjectId } from "@/domain/project";
import { OptimisticConcurrencyError } from "@/lib/errors";
import { translatePrismaError } from "../errors";
import {
  toAnalysisOutput,
  toAnalysisOutputEvidenceRows,
  toAnalysisOutputFields,
  toAnalysisRecommendation,
  toAnalysisRecommendationEvidenceRows,
  toAnalysisRecommendationFields,
  toAnalysisRun,
  toAnalysisRunFields,
} from "../mappers/analysis-mappers";

const evidence = { evidence: true } as const;

export class PrismaAnalysisRepository implements AnalysisRepository {
  constructor(private readonly db: PrismaClient) {}

  async findRunById(id: AnalysisRunId): Promise<AnalysisRun | null> {
    try {
      const row = await this.db.analysisRun.findUnique({ where: { id } });
      return row ? toAnalysisRun(row) : null;
    } catch (error) {
      throw translatePrismaError(error);
    }
  }

  async listRunsByProject(projectId: ProjectId): Promise<readonly AnalysisRun[]> {
    try {
      const rows = await this.db.analysisRun.findMany({
        where: { projectId },
        orderBy: [{ version: "asc" }],
      });
      return rows.map(toAnalysisRun);
    } catch (error) {
      throw translatePrismaError(error);
    }
  }

  async listOutputsByRun(runId: AnalysisRunId): Promise<readonly AnalysisOutput[]> {
    try {
      const rows = await this.db.analysisOutput.findMany({
        where: { analysisRunId: runId },
        include: evidence,
        orderBy: [{ createdAt: "asc" }, { id: "asc" }],
      });
      return rows.map(toAnalysisOutput);
    } catch (error) {
      throw translatePrismaError(error);
    }
  }

  async listRecommendationsByRun(runId: AnalysisRunId): Promise<readonly AnalysisRecommendation[]> {
    try {
      const rows = await this.db.analysisRecommendation.findMany({
        where: { analysisRunId: runId },
        include: evidence,
        orderBy: [{ createdAt: "asc" }, { id: "asc" }],
      });
      return rows.map(toAnalysisRecommendation);
    } catch (error) {
      throw translatePrismaError(error);
    }
  }

  async insertRun(run: AnalysisRun): Promise<void> {
    try {
      await this.db.analysisRun.create({ data: toAnalysisRunFields(run) });
    } catch (error) {
      throw translatePrismaError(error);
    }
  }

  async updateRun(run: AnalysisRun, expectedStatus: AnalysisRunStatus): Promise<void> {
    try {
      const updated = await this.db.analysisRun.updateMany({
        where: { id: run.id, status: expectedStatus },
        data: toAnalysisRunFields(run),
      });
      if (updated.count !== 1)
        throw new OptimisticConcurrencyError("Analysis run changed concurrently");
    } catch (error) {
      throw translatePrismaError(error);
    }
  }

  async saveResult(
    run: AnalysisRun,
    outputs: readonly AnalysisOutput[],
    recommendations: readonly AnalysisRecommendation[],
  ): Promise<void> {
    try {
      await this.db.$transaction(async (tx) => {
        const updated = await tx.analysisRun.updateMany({
          where: { id: run.id, status: "RUNNING" },
          data: toAnalysisRunFields(run),
        });
        if (updated.count !== 1)
          throw new OptimisticConcurrencyError("Analysis run changed concurrently");
        for (const output of outputs) {
          await tx.analysisOutput.create({ data: toAnalysisOutputFields(output) });
          const rows = toAnalysisOutputEvidenceRows(output);
          if (rows.length) await tx.analysisOutputEvidence.createMany({ data: rows });
        }
        for (const recommendation of recommendations) {
          await tx.analysisRecommendation.create({
            data: toAnalysisRecommendationFields(recommendation),
          });
          const rows = toAnalysisRecommendationEvidenceRows(recommendation);
          if (rows.length) await tx.analysisRecommendationEvidence.createMany({ data: rows });
        }
      });
    } catch (error) {
      throw translatePrismaError(error);
    }
  }
}
