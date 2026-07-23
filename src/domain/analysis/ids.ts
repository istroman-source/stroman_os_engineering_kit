import { type Brand, defineId } from "@/domain/shared";

export type AnalysisRunId = Brand<string, "AnalysisRunId">;
export const AnalysisRunId = defineId<"AnalysisRunId">("AnalysisRunId", "anrun");

export type AnalysisOutputId = Brand<string, "AnalysisOutputId">;
export const AnalysisOutputId = defineId<"AnalysisOutputId">("AnalysisOutputId", "anout");

export type AnalysisRecommendationId = Brand<string, "AnalysisRecommendationId">;
export const AnalysisRecommendationId = defineId<"AnalysisRecommendationId">(
  "AnalysisRecommendationId",
  "anrec",
);
