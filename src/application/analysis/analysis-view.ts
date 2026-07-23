import type { AnalysisOutput, AnalysisRecommendation, AnalysisRun } from "@/domain/analysis";

export interface AnalysisRunView {
  readonly id: string;
  readonly projectId: string;
  readonly version: number;
  readonly status: AnalysisRun["status"];
  readonly failureReason: string | null;
  readonly createdAt: Date;
  readonly startedAt: Date | null;
  readonly completedAt: Date | null;
}

export const toAnalysisRunView = (run: AnalysisRun): AnalysisRunView => ({
  id: run.id,
  projectId: run.projectId,
  version: run.version,
  status: run.status,
  failureReason: run.failureReason,
  createdAt: run.createdAt,
  startedAt: run.startedAt,
  completedAt: run.completedAt,
});

export const toAnalysisOutputView = (value: AnalysisOutput) => ({ ...value });
export const toAnalysisRecommendationView = (value: AnalysisRecommendation) => ({ ...value });
