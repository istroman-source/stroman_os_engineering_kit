import type {
  AnalysisOutput as AnalysisOutputRow,
  AnalysisOutputEvidence,
  AnalysisRecommendation as AnalysisRecommendationRow,
  AnalysisRecommendationEvidence,
  AnalysisRun as AnalysisRunRow,
  Prisma,
} from "@prisma/client";
import {
  AnalysisOutputId,
  AnalysisRecommendationId,
  AnalysisRunId,
  createAnalysisOutput,
  createAnalysisRecommendation,
  rehydrateAnalysisRun,
  type AnalysisOutput,
  type AnalysisRecommendation,
  type AnalysisRun,
} from "@/domain/analysis";
import { DecisionId } from "@/domain/decision";
import { EvidenceReferenceId } from "@/domain/evidence";
import { OwnerId, ProjectId } from "@/domain/project";
import { orThrowMapping } from "./shared";

export function toAnalysisRun(row: AnalysisRunRow): AnalysisRun {
  return orThrowMapping(
    rehydrateAnalysisRun({
      id: orThrowMapping(AnalysisRunId.parse(row.id), "analysisRun.id"),
      ownerId: orThrowMapping(OwnerId.parse(row.ownerId), "analysisRun.ownerId"),
      projectId: orThrowMapping(ProjectId.parse(row.projectId), "analysisRun.projectId"),
      version: row.version,
      status: row.status,
      failureReason: row.failureReason,
      now: row.createdAt,
      startedAt: row.startedAt,
      completedAt: row.completedAt,
    }),
    "analysisRun.lifecycle",
  );
}

export function toAnalysisRunFields(value: AnalysisRun): Prisma.AnalysisRunUncheckedCreateInput {
  return {
    id: value.id,
    ownerId: value.ownerId,
    projectId: value.projectId,
    version: value.version,
    status: value.status,
    failureReason: value.failureReason,
    createdAt: value.createdAt,
    startedAt: value.startedAt,
    completedAt: value.completedAt,
  };
}

export type AnalysisOutputRowWithEvidence = AnalysisOutputRow & {
  evidence: AnalysisOutputEvidence[];
};

export function toAnalysisOutput(row: AnalysisOutputRowWithEvidence): AnalysisOutput {
  return orThrowMapping(
    createAnalysisOutput({
      id: orThrowMapping(AnalysisOutputId.parse(row.id), "analysisOutput.id"),
      analysisRunId: orThrowMapping(
        AnalysisRunId.parse(row.analysisRunId),
        "analysisOutput.analysisRunId",
      ),
      kind: row.kind,
      content: row.content,
      confidence: row.confidence,
      evidenceReferenceIds: [...row.evidence]
        .sort((a, b) => a.position - b.position)
        .map((item) =>
          orThrowMapping(
            EvidenceReferenceId.parse(item.evidenceReferenceId),
            "analysisOutput.evidenceReferenceId",
          ),
        ),
      now: row.createdAt,
    }),
    "analysisOutput",
  );
}

export function toAnalysisOutputFields(
  value: AnalysisOutput,
): Prisma.AnalysisOutputUncheckedCreateInput {
  return {
    id: value.id,
    analysisRunId: value.analysisRunId,
    kind: value.kind,
    content: value.content,
    confidence: value.confidence,
    createdAt: value.createdAt,
  };
}

export function toAnalysisOutputEvidenceRows(
  value: AnalysisOutput,
): Prisma.AnalysisOutputEvidenceCreateManyInput[] {
  return value.evidenceReferenceIds.map((evidenceReferenceId, position) => ({
    analysisOutputId: value.id,
    evidenceReferenceId,
    position,
  }));
}

export type AnalysisRecommendationRowWithEvidence = AnalysisRecommendationRow & {
  evidence: AnalysisRecommendationEvidence[];
};

export function toAnalysisRecommendation(
  row: AnalysisRecommendationRowWithEvidence,
): AnalysisRecommendation {
  return orThrowMapping(
    createAnalysisRecommendation({
      id: orThrowMapping(AnalysisRecommendationId.parse(row.id), "analysisRecommendation.id"),
      analysisRunId: orThrowMapping(
        AnalysisRunId.parse(row.analysisRunId),
        "analysisRecommendation.analysisRunId",
      ),
      title: row.title,
      rationale: row.rationale,
      confidence: row.confidence,
      evidenceReferenceIds: [...row.evidence]
        .sort((a, b) => a.position - b.position)
        .map((item) =>
          orThrowMapping(
            EvidenceReferenceId.parse(item.evidenceReferenceId),
            "analysisRecommendation.evidenceReferenceId",
          ),
        ),
      decisionId:
        row.decisionId === null
          ? null
          : orThrowMapping(DecisionId.parse(row.decisionId), "analysisRecommendation.decisionId"),
      now: row.createdAt,
    }),
    "analysisRecommendation",
  );
}

export function toAnalysisRecommendationFields(
  value: AnalysisRecommendation,
): Prisma.AnalysisRecommendationUncheckedCreateInput {
  return {
    id: value.id,
    analysisRunId: value.analysisRunId,
    title: value.title,
    rationale: value.rationale,
    confidence: value.confidence,
    decisionId: value.decisionId,
    createdAt: value.createdAt,
  };
}

export function toAnalysisRecommendationEvidenceRows(
  value: AnalysisRecommendation,
): Prisma.AnalysisRecommendationEvidenceCreateManyInput[] {
  return value.evidenceReferenceIds.map((evidenceReferenceId, position) => ({
    analysisRecommendationId: value.id,
    evidenceReferenceId,
    position,
  }));
}
