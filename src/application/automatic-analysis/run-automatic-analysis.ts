import { err, ok } from "@/lib/result";
import {
  completeAnalysisRun,
  createAnalysisRun,
  failAnalysisRun,
  startAnalysisRun,
  getAnalysisRun,
} from "@/application/analysis";
import type { Clock, IdGenerator } from "@/application/shared";
import { attempt } from "@/application/shared/attempt";
import { NotFoundError } from "@/application/shared/errors";
import {
  EvidenceReferenceId,
  createEvidenceReference,
  type EvidenceReference,
  type EvidenceReferenceRepository,
} from "@/domain/evidence";
import type { TranscriptDocumentRepository, TranscriptSegmentId } from "@/domain/media-transcript";
import type { OwnerId, ProjectId, ProjectRepository } from "@/domain/project";
import { InvalidValueError } from "@/domain/shared";
import type {
  AnalysisRepository,
  AnalysisSourceSegment,
  GroundedAnalysisDraft,
  GroundedEditorialAnalyzer,
} from "@/domain/analysis";
import type { DecisionRepository } from "@/domain/decision";

export interface AutomaticAnalysisDependencies {
  readonly projects: ProjectRepository;
  readonly transcripts: TranscriptDocumentRepository;
  readonly evidenceReferences: EvidenceReferenceRepository;
  readonly analyses: AnalysisRepository;
  readonly decisions: DecisionRepository;
  readonly analyzer: GroundedEditorialAnalyzer;
  readonly ids: IdGenerator;
  readonly clock: Clock;
}

function segmentKey(id: TranscriptSegmentId): string {
  return id;
}

function validateGrounding(draft: GroundedAnalysisDraft, available: ReadonlySet<string>) {
  const claims = [...draft.outputs, ...draft.recommendations];
  if (claims.length === 0) {
    return err(new InvalidValueError("Analysis produced no grounded claims"));
  }
  for (const claim of claims) {
    if (claim.sourceSegmentIds.length === 0) {
      return err(new InvalidValueError("Every analysis claim must cite transcript evidence"));
    }
    if (claim.sourceSegmentIds.some((id) => !available.has(segmentKey(id)))) {
      return err(new InvalidValueError("Analysis cited a transcript segment outside the project"));
    }
  }
  return ok(draft);
}

async function ensureEvidence(
  deps: AutomaticAnalysisDependencies,
  input: { actorId: OwnerId; projectId: ProjectId },
  segments: readonly AnalysisSourceSegment[],
) {
  const loaded = await attempt("evidenceReference.listByProject", () =>
    deps.evidenceReferences.listByProject(input.projectId),
  );
  if (!loaded.ok) return loaded;
  const bySegment = new Map<string, EvidenceReference>();
  for (const item of loaded.value) {
    if (item.provenance.kind === "TRANSCRIPT_SEGMENT") {
      bySegment.set(segmentKey(item.provenance.transcriptSegmentId), item);
    }
  }
  const transcriptById = new Map(
    (await deps.transcripts.listByProject(input.projectId)).map((document) => [
      document.id,
      document,
    ]),
  );
  for (const segment of segments) {
    if (bySegment.has(segmentKey(segment.transcriptSegmentId))) continue;
    const transcript = transcriptById.get(segment.transcriptDocumentId);
    if (!transcript)
      return err(new NotFoundError("TranscriptDocument", segment.transcriptDocumentId));
    const evidence = createEvidenceReference({
      id: EvidenceReferenceId.unsafe(deps.ids.generate(EvidenceReferenceId.prefix)),
      ownerId: input.actorId,
      projectId: input.projectId,
      provenance: {
        kind: "TRANSCRIPT_SEGMENT",
        mediaAssetId: transcript.mediaAssetId,
        transcriptDocumentId: transcript.id,
        transcriptSegmentId: segment.transcriptSegmentId,
      },
      now: deps.clock.now(),
    });
    const inserted = await attempt("evidenceReference.insert", () =>
      deps.evidenceReferences.insert(evidence),
    );
    if (!inserted.ok) return inserted;
    bySegment.set(segmentKey(segment.transcriptSegmentId), evidence);
  }
  return ok(bySegment);
}

export async function runAutomaticAnalysis(
  deps: AutomaticAnalysisDependencies,
  input: { actorId: OwnerId; projectId: ProjectId },
) {
  const project = await attempt("project.findById", () => deps.projects.findById(input.projectId));
  if (!project.ok) return project;
  if (!project.value || project.value.ownerId !== input.actorId) {
    return err(new NotFoundError("Project", input.projectId));
  }
  const transcripts = await attempt("transcriptDocument.listByProject", () =>
    deps.transcripts.listByProject(input.projectId),
  );
  if (!transcripts.ok) return transcripts;
  if (transcripts.value.length === 0) {
    return err(new InvalidValueError("Import a transcript before running analysis"));
  }
  const segments: AnalysisSourceSegment[] = transcripts.value.flatMap((document) => {
    const speakers = new Map(document.speakers.map((speaker) => [speaker.id, speaker.label]));
    return document.segments.map((segment) => ({
      transcriptDocumentId: document.id,
      transcriptSegmentId: segment.id,
      transcriptTitle: document.title,
      sequence: segment.sequence,
      speakerLabel: segment.speakerId ? (speakers.get(segment.speakerId) ?? null) : null,
      text: segment.text,
      startMs: segment.startMs,
      endMs: segment.endMs,
    }));
  });
  const created = await createAnalysisRun(deps, input);
  if (!created.ok) return created;
  const started = await startAnalysisRun(deps, {
    actorId: input.actorId,
    analysisRunId: created.value.id as never,
  });
  if (!started.ok) return started;
  try {
    const draft = await deps.analyzer.analyze({ segments });
    const grounded = validateGrounding(
      draft,
      new Set(segments.map((segment) => segmentKey(segment.transcriptSegmentId))),
    );
    if (!grounded.ok) {
      await failAnalysisRun(deps, {
        actorId: input.actorId,
        analysisRunId: created.value.id as never,
        reason: grounded.error.message,
      });
      return grounded;
    }
    const evidence = await ensureEvidence(deps, input, segments);
    if (!evidence.ok) {
      await failAnalysisRun(deps, {
        actorId: input.actorId,
        analysisRunId: created.value.id as never,
        reason: "Evidence could not be prepared for this analysis.",
      });
      return evidence;
    }
    const idsFor = (ids: readonly TranscriptSegmentId[]) =>
      [...new Set(ids)].map((id) => evidence.value.get(segmentKey(id))!.id);
    const completed = await completeAnalysisRun(deps, {
      actorId: input.actorId,
      analysisRunId: created.value.id as never,
      outputs: grounded.value.outputs.map((output) => ({
        kind: output.kind,
        content: output.content,
        confidence: output.confidence,
        evidenceReferenceIds: idsFor(output.sourceSegmentIds),
      })),
      recommendations: grounded.value.recommendations.map((recommendation) => ({
        title: recommendation.title,
        rationale: recommendation.rationale,
        confidence: recommendation.confidence,
        evidenceReferenceIds: idsFor(recommendation.sourceSegmentIds),
      })),
    });
    if (!completed.ok) {
      const failed = await failAnalysisRun(deps, {
        actorId: input.actorId,
        analysisRunId: created.value.id as never,
        reason: "The analysis result could not be completed.",
      });
      return failed.ok ? completed : failed;
    }
    return completed;
  } catch {
    await failAnalysisRun(deps, {
      actorId: input.actorId,
      analysisRunId: created.value.id as never,
      reason: "The analysis engine was unavailable.",
    });
    return err(new InvalidValueError("The analysis engine was unavailable"));
  }
}

export async function getLatestAutomaticAnalysis(
  deps: Pick<AutomaticAnalysisDependencies, "projects" | "analyses">,
  input: { actorId: OwnerId; projectId: ProjectId },
) {
  const project = await attempt("project.findById", () => deps.projects.findById(input.projectId));
  if (!project.ok) return project;
  if (!project.value || project.value.ownerId !== input.actorId) {
    return err(new NotFoundError("Project", input.projectId));
  }
  const runs = await attempt("analysisRun.listByProject", () =>
    deps.analyses.listRunsByProject(input.projectId),
  );
  if (!runs.ok) return runs;
  const latest = runs.value.filter((run) => run.status === "COMPLETED").at(-1);
  if (!latest) return err(new NotFoundError("AnalysisRun", input.projectId));
  return getAnalysisRun(deps, {
    actorId: input.actorId,
    analysisRunId: latest.id,
  });
}
