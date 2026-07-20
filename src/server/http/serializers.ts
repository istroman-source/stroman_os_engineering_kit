import type { ContentItemView } from "@/application/content";
import type { AnalysisView } from "@/application/creative";
import type { DecisionView } from "@/application/decision";
import type { EvaluationView, RubricView } from "@/application/evaluation";
import type { ProjectView } from "@/application/project";

/**
 * Explicit HTTP serializers. Views are converted to plain JSON-safe objects with
 * ISO-8601 UTC timestamps and stable field names. `lockVersion` is deliberately
 * omitted from bodies — it is exposed only as the ETag concurrency token.
 */
const iso = (date: Date): string => date.toISOString();

export function serializeProject(view: ProjectView) {
  return {
    id: view.id,
    name: view.name,
    status: view.status,
    createdAt: iso(view.createdAt),
    updatedAt: iso(view.updatedAt),
  };
}

export function serializeContent(view: ContentItemView) {
  return {
    id: view.id,
    type: view.type,
    slug: view.slug,
    title: view.title,
    status: view.status,
    version: view.version,
    createdAt: iso(view.createdAt),
    updatedAt: iso(view.updatedAt),
  };
}

export function serializeRubric(view: RubricView) {
  return {
    id: view.id,
    slug: view.slug,
    title: view.title,
    criteria: view.criteria.map((criterion) => ({
      id: criterion.id,
      name: criterion.name,
      weight: criterion.weight,
      anchors: {
        one: criterion.anchors.one,
        five: criterion.anchors.five,
        ten: criterion.anchors.ten,
      },
    })),
  };
}

export function serializeEvaluation(view: EvaluationView) {
  return {
    id: view.id,
    projectId: view.projectId,
    rubricId: view.rubricId,
    reviewerType: view.reviewerType,
    reviewerId: view.reviewerId,
    scores: view.scores.map((score) => ({
      criterionId: score.criterionId,
      score: score.score,
      justification: score.justification,
    })),
    createdAt: iso(view.createdAt),
  };
}

export function serializeDecision(view: DecisionView) {
  return {
    id: view.id,
    projectId: view.projectId,
    question: view.question,
    options: view.options.map((option) => ({
      id: option.id,
      label: option.label,
      rationale: option.rationale,
    })),
    advisory: view.advisory
      ? {
          recommendedOptionId: view.advisory.recommendedOptionId,
          rationale: view.advisory.rationale,
          confidence: view.advisory.confidence,
          evidence: view.advisory.evidence.map((entry) => ({
            sourceLabel: entry.sourceLabel,
            observation: entry.observation,
            relevance: entry.relevance,
          })),
        }
      : null,
    status: view.status,
    selectedOptionId: view.selectedOptionId,
    decidedBy: view.decidedBy,
    decisionRationale: view.decisionRationale,
    createdAt: iso(view.createdAt),
    decidedAt: view.decidedAt ? iso(view.decidedAt) : null,
  };
}

export function serializeAnalysis(view: AnalysisView) {
  const b = view.brief;
  return {
    brief: {
      id: b.id,
      projectId: b.projectId,
      title: b.title,
      client: b.client,
      projectType: b.projectType,
      creativeGoal: b.creativeGoal,
      targetAudience: b.targetAudience,
      desiredEmotion: b.desiredEmotion,
      context: b.context,
      createdAt: iso(b.createdAt),
      updatedAt: iso(b.updatedAt),
    },
    // The blueprint is pure JSON-safe data (strings/arrays) — passed through as-is.
    blueprint: view.blueprint,
  };
}
