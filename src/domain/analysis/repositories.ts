import type { ProjectId } from "@/domain/project";
import type { AnalysisOutput, AnalysisRecommendation } from "./analysis-result";
import type { AnalysisRun, AnalysisRunStatus } from "./analysis-run";
import type { AnalysisRunId } from "./ids";

export interface AnalysisRepository {
  findRunById(id: AnalysisRunId): Promise<AnalysisRun | null>;
  listRunsByProject(projectId: ProjectId): Promise<readonly AnalysisRun[]>;
  listOutputsByRun(runId: AnalysisRunId): Promise<readonly AnalysisOutput[]>;
  listRecommendationsByRun(runId: AnalysisRunId): Promise<readonly AnalysisRecommendation[]>;
  insertRun(run: AnalysisRun): Promise<void>;
  updateRun(run: AnalysisRun, expectedStatus: AnalysisRunStatus): Promise<void>;
  saveResult(
    run: AnalysisRun,
    outputs: readonly AnalysisOutput[],
    recommendations: readonly AnalysisRecommendation[],
  ): Promise<void>;
}
