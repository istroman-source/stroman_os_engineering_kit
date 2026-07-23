import { err, ok } from "@/lib/result";
import {
  AnalysisOutputId,
  AnalysisRecommendationId,
  AnalysisRunId,
  completeAnalysisRun as completeRun,
  createAnalysisOutput,
  createAnalysisRecommendation,
  createAnalysisRun as makeRun,
  failAnalysisRun as failRun,
  startAnalysisRun as startRun,
  type AnalysisOutputKind,
  type AnalysisRepository,
} from "@/domain/analysis";
import type { DecisionId, DecisionRepository } from "@/domain/decision";
import type { EvidenceReferenceId, EvidenceReferenceRepository } from "@/domain/evidence";
import type { OwnerId, ProjectId, ProjectRepository } from "@/domain/project";
import { InvalidValueError } from "@/domain/shared";
import type { Clock, IdGenerator } from "../shared";
import { attempt, attemptUpdate } from "../shared/attempt";
import { ensureOwner } from "../shared/authorization";
import { NotFoundError } from "../shared/errors";
import { loadOwnedProject } from "../media-transcript/media-transcript-access";
import {
  toAnalysisOutputView,
  toAnalysisRecommendationView,
  toAnalysisRunView,
} from "./analysis-view";

async function loadOwnedRun(
  repository: AnalysisRepository,
  actorId: OwnerId,
  id: AnalysisRunId,
  action: string,
) {
  const loaded = await attempt("analysisRun.findById", () => repository.findRunById(id));
  if (!loaded.ok) return loaded;
  if (!loaded.value) return err(new NotFoundError("AnalysisRun", id));
  const owned = ensureOwner(actorId, loaded.value.ownerId, action);
  return owned.ok ? ok(loaded.value) : owned;
}

export async function createAnalysisRun(
  deps: {
    projects: ProjectRepository;
    analyses: AnalysisRepository;
    ids: IdGenerator;
    clock: Clock;
  },
  input: { actorId: OwnerId; projectId: ProjectId },
) {
  const project = await loadOwnedProject(
    deps.projects,
    input.actorId,
    input.projectId,
    "analysisRun.create",
  );
  if (!project.ok) return project;
  const listed = await attempt("analysisRun.listByProject", () =>
    deps.analyses.listRunsByProject(input.projectId),
  );
  if (!listed.ok) return listed;
  const made = makeRun({
    id: AnalysisRunId.unsafe(deps.ids.generate(AnalysisRunId.prefix)),
    ownerId: input.actorId,
    projectId: input.projectId,
    version: Math.max(0, ...listed.value.map((run) => run.version)) + 1,
    now: deps.clock.now(),
  });
  if (!made.ok) return made;
  const saved = await attempt("analysisRun.insert", () => deps.analyses.insertRun(made.value));
  return saved.ok ? ok(toAnalysisRunView(made.value)) : saved;
}

export async function startAnalysisRun(
  deps: { analyses: AnalysisRepository; clock: Clock },
  input: { actorId: OwnerId; analysisRunId: AnalysisRunId },
) {
  const loaded = await loadOwnedRun(
    deps.analyses,
    input.actorId,
    input.analysisRunId,
    "analysisRun.start",
  );
  if (!loaded.ok) return loaded;
  const next = startRun(loaded.value, deps.clock.now());
  if (!next.ok) return next;
  const saved = await attemptUpdate("analysisRun.update", () =>
    deps.analyses.updateRun(next.value, "PENDING"),
  );
  return saved.ok ? ok(toAnalysisRunView(next.value)) : saved;
}

export async function failAnalysisRun(
  deps: { analyses: AnalysisRepository; clock: Clock },
  input: { actorId: OwnerId; analysisRunId: AnalysisRunId; reason: string },
) {
  const loaded = await loadOwnedRun(
    deps.analyses,
    input.actorId,
    input.analysisRunId,
    "analysisRun.fail",
  );
  if (!loaded.ok) return loaded;
  const next = failRun(loaded.value, input.reason, deps.clock.now());
  if (!next.ok) return next;
  const saved = await attemptUpdate("analysisRun.update", () =>
    deps.analyses.updateRun(next.value, "RUNNING"),
  );
  return saved.ok ? ok(toAnalysisRunView(next.value)) : saved;
}

export interface AnalysisOutputInput {
  kind: AnalysisOutputKind;
  content: string;
  confidence?: number | null;
  evidenceReferenceIds?: readonly EvidenceReferenceId[];
}
export interface AnalysisRecommendationInput {
  title: string;
  rationale: string;
  confidence: number;
  evidenceReferenceIds?: readonly EvidenceReferenceId[];
  decisionId?: DecisionId | null;
}

export async function completeAnalysisRun(
  deps: {
    analyses: AnalysisRepository;
    evidenceReferences: EvidenceReferenceRepository;
    decisions: DecisionRepository;
    ids: IdGenerator;
    clock: Clock;
  },
  input: {
    actorId: OwnerId;
    analysisRunId: AnalysisRunId;
    outputs: readonly AnalysisOutputInput[];
    recommendations: readonly AnalysisRecommendationInput[];
  },
) {
  const loaded = await loadOwnedRun(
    deps.analyses,
    input.actorId,
    input.analysisRunId,
    "analysisRun.complete",
  );
  if (!loaded.ok) return loaded;
  const evidenceIds = [
    ...new Set([
      ...input.outputs.flatMap((v) => v.evidenceReferenceIds ?? []),
      ...input.recommendations.flatMap((v) => v.evidenceReferenceIds ?? []),
    ]),
  ];
  for (const id of evidenceIds) {
    const found = await attempt("evidenceReference.findById", () =>
      deps.evidenceReferences.findById(id),
    );
    if (!found.ok) return found;
    if (!found.value) return err(new NotFoundError("EvidenceReference", id));
    const owned = ensureOwner(input.actorId, found.value.ownerId, "analysisRun.complete");
    if (!owned.ok) return owned;
    if (found.value.projectId !== loaded.value.projectId)
      return err(new InvalidValueError("Evidence must belong to the analysis project"));
  }
  for (const item of input.recommendations) {
    if (!item.decisionId) continue;
    const found = await attempt("decision.findById", () =>
      deps.decisions.findById(item.decisionId!),
    );
    if (!found.ok) return found;
    if (!found.value) return err(new NotFoundError("Decision", item.decisionId));
    if (found.value.projectId !== loaded.value.projectId)
      return err(new InvalidValueError("Decision must belong to the analysis project"));
  }
  const now = deps.clock.now();
  const outputs = input.outputs.map((item) =>
    createAnalysisOutput({
      ...item,
      id: AnalysisOutputId.unsafe(deps.ids.generate(AnalysisOutputId.prefix)),
      analysisRunId: loaded.value.id,
      now,
    }),
  );
  const recommendations = input.recommendations.map((item) =>
    createAnalysisRecommendation({
      ...item,
      id: AnalysisRecommendationId.unsafe(deps.ids.generate(AnalysisRecommendationId.prefix)),
      analysisRunId: loaded.value.id,
      now,
    }),
  );
  const invalid = [...outputs, ...recommendations].find((value) => !value.ok);
  if (invalid && !invalid.ok) return invalid;
  const completed = completeRun(loaded.value, now);
  if (!completed.ok) return completed;
  const outputValues = outputs.map((value) => {
    if (!value.ok) throw value.error;
    return value.value;
  });
  const recommendationValues = recommendations.map((value) => {
    if (!value.ok) throw value.error;
    return value.value;
  });
  const saved = await attemptUpdate("analysisRun.saveResult", () =>
    deps.analyses.saveResult(completed.value, outputValues, recommendationValues),
  );
  return saved.ok
    ? ok({
        run: toAnalysisRunView(completed.value),
        outputs: outputValues.map(toAnalysisOutputView),
        recommendations: recommendationValues.map(toAnalysisRecommendationView),
      })
    : saved;
}

export async function getAnalysisRun(
  deps: { analyses: AnalysisRepository },
  input: { actorId: OwnerId; analysisRunId: AnalysisRunId },
) {
  const loaded = await loadOwnedRun(
    deps.analyses,
    input.actorId,
    input.analysisRunId,
    "analysisRun.read",
  );
  if (!loaded.ok) return loaded;
  const [outputs, recommendations] = await Promise.all([
    attempt("analysisOutput.list", () => deps.analyses.listOutputsByRun(loaded.value.id)),
    attempt("analysisRecommendation.list", () =>
      deps.analyses.listRecommendationsByRun(loaded.value.id),
    ),
  ]);
  if (!outputs.ok) return outputs;
  if (!recommendations.ok) return recommendations;
  return ok({
    run: toAnalysisRunView(loaded.value),
    outputs: outputs.value.map(toAnalysisOutputView),
    recommendations: recommendations.value.map(toAnalysisRecommendationView),
  });
}
