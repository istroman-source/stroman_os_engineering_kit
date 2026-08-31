import { err, ok, type Result } from "@/lib/result";
import type { AnalysisRepository, AnalysisRun } from "@/domain/analysis";
import type { CreativeBriefRepository } from "@/domain/creative";
import type { DecisionRepository } from "@/domain/decision";
import type { OwnerId, ProjectId, ProjectRepository } from "@/domain/project";
import type { SourceImportRepository } from "@/domain/source-import";
import { attempt } from "@/application/shared/attempt";
import { ensureOwner } from "@/application/shared/authorization";
import {
  NotAuthorizedError,
  NotFoundError,
  type RepositoryError,
} from "@/application/shared/errors";
import { toDecisionView, type DecisionView } from "@/application/decision";

export interface ProjectReviewView {
  readonly project: { readonly id: string; readonly name: string; readonly status: string };
  readonly readiness: "EMPTY" | "NEEDS_ATTENTION" | "READY";
  readonly intent: null | {
    readonly title: string;
    readonly creativeGoal: string;
    readonly targetAudience: string;
    readonly desiredEmotion: string;
    readonly currentDirection: string | null;
    readonly version: number;
    readonly updatedAt: Date;
  };
  readonly sources: {
    readonly total: number;
    readonly completed: number;
    readonly needsAttention: number;
    readonly kinds: readonly string[];
  };
  readonly evidence: ReadonlyArray<{
    readonly id: string;
    readonly sourceKind: AnalysisRun["sourceKind"];
    readonly kind: string;
    readonly content: string;
    readonly confidence: number | null;
    readonly evidenceReferenceIds: readonly string[];
  }>;
  readonly recommendations: ReadonlyArray<{
    readonly id: string;
    readonly title: string;
    readonly rationale: string;
    readonly confidence: number;
    readonly evidenceReferenceIds: readonly string[];
    readonly decisionId: string | null;
  }>;
  readonly decisions: readonly DecisionView[];
  readonly decisionSummary: {
    readonly accepted: number;
    readonly rejected: number;
    readonly deferred: number;
    readonly unresolved: number;
  };
  readonly conflicts: readonly string[];
  readonly missingCoverage: readonly string[];
  readonly unresolvedActions: readonly string[];
}

export interface GetProjectReviewDeps {
  readonly projects: ProjectRepository;
  readonly creativeBriefs: CreativeBriefRepository;
  readonly analyses: AnalysisRepository;
  readonly decisions: DecisionRepository;
  readonly sourceImports: SourceImportRepository;
}

function latestCompletedRuns(runs: readonly AnalysisRun[]): readonly AnalysisRun[] {
  const completed = runs.filter((run) => run.status === "COMPLETED");
  const typed = completed.filter((run) => run.sourceKind !== "LEGACY");
  const candidates = typed.length > 0 ? typed : completed;
  const selected = new Map<AnalysisRun["sourceKind"], AnalysisRun>();
  for (const run of [...candidates].sort((a, b) => b.version - a.version)) {
    if (!selected.has(run.sourceKind)) selected.set(run.sourceKind, run);
  }
  return [...selected.values()].sort((a, b) => a.version - b.version);
}

function selectedMeaning(decision: DecisionView): "ACCEPTED" | "REJECTED" | "DEFERRED" | null {
  if (decision.status !== "DECIDED") return null;
  if (decision.selectedOptionId === "reject") return "REJECTED";
  if (decision.selectedOptionId === "defer") return "DEFERRED";
  return "ACCEPTED";
}

export async function getProjectReview(
  deps: GetProjectReviewDeps,
  input: { actorId: OwnerId; projectId: ProjectId },
): Promise<Result<ProjectReviewView, NotFoundError | NotAuthorizedError | RepositoryError>> {
  const projectLoad = await attempt("project.findById", () =>
    deps.projects.findById(input.projectId),
  );
  if (!projectLoad.ok) return projectLoad;
  if (!projectLoad.value) return err(new NotFoundError("Project", input.projectId));
  const owned = ensureOwner(input.actorId, projectLoad.value.ownerId, "project.review");
  if (!owned.ok) return owned;

  const briefLoad = await attempt("creativeBrief.findByProject", () =>
    deps.creativeBriefs.findByProject(input.projectId),
  );
  if (!briefLoad.ok) return briefLoad;
  const runLoad = await attempt("analysisRun.listByProject", () =>
    deps.analyses.listRunsByProject(input.projectId),
  );
  if (!runLoad.ok) return runLoad;
  const decisionLoad = await attempt("decision.listByProject", () =>
    deps.decisions.listByProject(input.projectId),
  );
  if (!decisionLoad.ok) return decisionLoad;
  const importLoad = await attempt("sourceImport.listByProject", () =>
    deps.sourceImports.listByProject(input.projectId),
  );
  if (!importLoad.ok) return importLoad;

  const selectedRuns = latestCompletedRuns(runLoad.value);
  const evidence: ProjectReviewView["evidence"] extends ReadonlyArray<infer T> ? T[] : never = [];
  const recommendations: ProjectReviewView["recommendations"] extends ReadonlyArray<infer T>
    ? T[]
    : never = [];
  const decisions = decisionLoad.value.map(toDecisionView);
  for (const run of selectedRuns) {
    const outputLoad = await attempt("analysisOutput.list", () =>
      deps.analyses.listOutputsByRun(run.id),
    );
    if (!outputLoad.ok) return outputLoad;
    const recommendationLoad = await attempt("analysisRecommendation.list", () =>
      deps.analyses.listRecommendationsByRun(run.id),
    );
    if (!recommendationLoad.ok) return recommendationLoad;
    evidence.push(
      ...outputLoad.value.map((output) => ({
        id: output.id as string,
        sourceKind: run.sourceKind,
        kind: output.kind,
        content: output.content,
        confidence: output.confidence,
        evidenceReferenceIds: output.evidenceReferenceIds as readonly string[],
      })),
    );
    recommendations.push(
      ...recommendationLoad.value.map((recommendation) => ({
        id: recommendation.id as string,
        title: recommendation.title,
        rationale: recommendation.rationale,
        confidence: recommendation.confidence,
        evidenceReferenceIds: recommendation.evidenceReferenceIds as readonly string[],
        decisionId:
          (recommendation.decisionId as string | null) ??
          (decisions.find((decision) => decision.context.artifactId === recommendation.id)?.id as
            string | undefined) ??
          null,
      })),
    );
  }

  const meanings = decisions.map(selectedMeaning);
  const unresolved = decisions.filter((decision) => decision.status === "PROPOSED");
  const conflicts = decisions
    .filter((decision) => decision.context.needsReview)
    .map(
      (decision) =>
        `${decision.question}: ${decision.context.reviewReason ?? "Upstream project context changed."}`,
    );
  const missingCoverage: string[] = [];
  if (!briefLoad.value) missingCoverage.push("Project intent has not been developed yet.");
  if (importLoad.value.every((source) => source.status !== "COMPLETED"))
    missingCoverage.push("No completed footage, transcript, or reference source is available.");
  if (selectedRuns.length === 0) missingCoverage.push("No completed source analysis is available.");
  if (evidence.length > 0 && evidence.every((item) => item.evidenceReferenceIds.length === 0))
    missingCoverage.push("Current analysis has no inspectable source references.");

  const unresolvedActions = [
    ...unresolved.map((decision) => `Decide: ${decision.question}`),
    ...recommendations
      .filter((recommendation) => recommendation.decisionId === null)
      .map((recommendation) => `Review recommendation: ${recommendation.title}`),
  ];
  const isEmpty =
    !briefLoad.value &&
    importLoad.value.length === 0 &&
    decisions.length === 0 &&
    evidence.length === 0;
  const readiness = isEmpty
    ? "EMPTY"
    : conflicts.length > 0 || missingCoverage.length > 0 || unresolvedActions.length > 0
      ? "NEEDS_ATTENTION"
      : "READY";
  const brief = briefLoad.value;

  return ok({
    project: {
      id: projectLoad.value.id,
      name: projectLoad.value.name,
      status: projectLoad.value.status,
    },
    readiness,
    intent: brief
      ? {
          title: brief.title,
          creativeGoal: brief.creativeGoal,
          targetAudience: brief.targetAudience,
          desiredEmotion: brief.desiredEmotion,
          currentDirection: brief.blueprint?.development.directionDecision.title ?? null,
          version: brief.lockVersion,
          updatedAt: brief.updatedAt,
        }
      : null,
    sources: {
      total: importLoad.value.length,
      completed: importLoad.value.filter((source) => source.status === "COMPLETED").length,
      needsAttention: importLoad.value.filter(
        (source) => source.status === "RETRYABLE_FAILURE" || source.status === "TERMINAL_FAILURE",
      ).length,
      kinds: [...new Set(importLoad.value.map((source) => source.sourceKind))],
    },
    evidence,
    recommendations,
    decisions,
    decisionSummary: {
      accepted: meanings.filter((meaning) => meaning === "ACCEPTED").length,
      rejected: meanings.filter((meaning) => meaning === "REJECTED").length,
      deferred: meanings.filter((meaning) => meaning === "DEFERRED").length,
      unresolved: unresolved.length,
    },
    conflicts,
    missingCoverage,
    unresolvedActions,
  });
}
