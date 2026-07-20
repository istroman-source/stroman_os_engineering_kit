import type { Prisma } from "@prisma/client";
import { type Advisory, type Decision, type DecisionOption, DecisionId } from "@/domain/decision";
import { OwnerId, ProjectId } from "@/domain/project";
import { makeConfidence } from "@/domain/shared";
import { PersistenceMappingError } from "../errors";
import { orThrowMapping } from "./shared";

export type DecisionRow = Prisma.DecisionGetPayload<{
  include: { options: true; evidence: true };
}>;

function toAdvisory(row: DecisionRow): Advisory | null {
  if (row.advisoryRationale === null) return null;
  if (row.advisoryConfidence === null) {
    throw new PersistenceMappingError("decision.advisory has a rationale but no confidence");
  }
  const evidence = [...row.evidence]
    .sort((a, b) => a.position - b.position)
    .map((entry) => ({
      sourceLabel: entry.sourceLabel,
      observation: entry.observation,
      relevance: entry.relevance,
    }));
  return {
    recommendedOptionId: row.advisoryRecommendedOptionId,
    rationale: row.advisoryRationale,
    confidence: orThrowMapping(makeConfidence(row.advisoryConfidence), "advisory.confidence"),
    evidence,
  };
}

export function toDecision(row: DecisionRow): Decision {
  const options: DecisionOption[] = [...row.options]
    .sort((a, b) => a.position - b.position)
    .map((option) => ({ id: option.id, label: option.label, rationale: option.rationale }));

  return {
    id: orThrowMapping(DecisionId.parse(row.id), `decision.id="${row.id}"`),
    projectId: orThrowMapping(
      ProjectId.parse(row.projectId),
      `decision.projectId="${row.projectId}"`,
    ),
    question: row.question,
    options,
    advisory: toAdvisory(row),
    status: row.status,
    selectedOptionId: row.selectedOptionId,
    decidedBy:
      row.decidedBy === null
        ? null
        : orThrowMapping(OwnerId.parse(row.decidedBy), `decision.decidedBy="${row.decidedBy}"`),
    decisionRationale: row.decisionRationale,
    createdAt: row.createdAt,
    decidedAt: row.decidedAt,
    lockVersion: row.lockVersion,
  };
}

export function toDecisionFields(decision: Decision) {
  return {
    id: decision.id,
    projectId: decision.projectId,
    question: decision.question,
    status: decision.status,
    selectedOptionId: decision.selectedOptionId,
    decidedBy: decision.decidedBy,
    decisionRationale: decision.decisionRationale,
    advisoryRecommendedOptionId: decision.advisory?.recommendedOptionId ?? null,
    advisoryRationale: decision.advisory?.rationale ?? null,
    advisoryConfidence: decision.advisory?.confidence ?? null,
    createdAt: decision.createdAt,
    decidedAt: decision.decidedAt,
    lockVersion: decision.lockVersion,
  };
}

export function toDecisionOptionRows(decision: Decision) {
  return decision.options.map((option, index) => ({
    decisionId: decision.id,
    id: option.id,
    label: option.label,
    rationale: option.rationale,
    position: index,
  }));
}

export function toDecisionEvidenceRows(decision: Decision) {
  return (decision.advisory?.evidence ?? []).map((entry, index) => ({
    decisionId: decision.id,
    position: index,
    sourceLabel: entry.sourceLabel,
    observation: entry.observation,
    relevance: entry.relevance,
  }));
}
