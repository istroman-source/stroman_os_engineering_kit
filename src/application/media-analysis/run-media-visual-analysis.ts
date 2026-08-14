import {
  completeAnalysisRun,
  createAnalysisRun,
  failAnalysisRun,
  startAnalysisRun,
} from "@/application/analysis";
import type { Clock, IdGenerator } from "@/application/shared";
import { attempt } from "@/application/shared/attempt";
import { NotFoundError } from "@/application/shared/errors";
import type { AnalysisRepository } from "@/domain/analysis";
import type { CreativeBriefRepository } from "@/domain/creative";
import type { DecisionRepository } from "@/domain/decision";
import {
  EvidenceReferenceId,
  createEvidenceReference,
  type EvidenceReferenceRepository,
} from "@/domain/evidence";
import type {
  VisualAnalysisFrame,
  VisualMediaAnalysisDraft,
  VisualMediaAnalyzer,
} from "@/domain/media-analysis";
import type { MediaAssetId, MediaAssetRepository } from "@/domain/media-transcript";
import type { OwnerId, ProjectId, ProjectRepository } from "@/domain/project";
import { InvalidValueError } from "@/domain/shared";
import { err, ok } from "@/lib/result";

export interface MediaVisualAnalysisDependencies {
  readonly projects: ProjectRepository;
  readonly mediaAssets: MediaAssetRepository;
  readonly creativeBriefs: CreativeBriefRepository;
  readonly evidenceReferences: EvidenceReferenceRepository;
  readonly analyses: AnalysisRepository;
  readonly decisions: DecisionRepository;
  readonly visualMediaAnalyzer: VisualMediaAnalyzer;
  readonly ids: IdGenerator;
  readonly clock: Clock;
}

function formatTimestamp(timestampMs: number): string {
  const minutes = Math.floor(timestampMs / 60_000);
  const seconds = ((timestampMs % 60_000) / 1000).toFixed(1).padStart(4, "0");
  return `${String(minutes).padStart(2, "0")}:${seconds}`;
}

function projectContext(
  brief: Awaited<ReturnType<CreativeBriefRepository["findByProject"]>>,
): string | null {
  if (!brief) return null;
  return [
    `Title: ${brief.title}`,
    brief.projectType && `Mode: ${brief.projectType}`,
    brief.creativeGoal && `Goal: ${brief.creativeGoal}`,
    brief.desiredEmotion && `Desired feeling: ${brief.desiredEmotion}`,
    brief.context && `Constraints/context: ${brief.context}`,
  ]
    .filter(Boolean)
    .join("\n");
}

function validateFrames(frames: readonly VisualAnalysisFrame[]) {
  if (frames.length < 2 || frames.length > 6) {
    return err(new InvalidValueError("Sample between 2 and 6 video frames"));
  }
  const seen = new Set<number>();
  let previousTimestamp = -1;
  for (const frame of frames) {
    if (!Number.isInteger(frame.index) || frame.index < 0 || seen.has(frame.index)) {
      return err(new InvalidValueError("Video frame indices must be unique non-negative integers"));
    }
    if (
      !Number.isInteger(frame.timestampMs) ||
      frame.timestampMs < 0 ||
      frame.timestampMs < previousTimestamp
    ) {
      return err(new InvalidValueError("Video frame timestamps must be ordered"));
    }
    if (frame.bytes.byteLength === 0 || frame.bytes.byteLength > 1_500_000) {
      return err(new InvalidValueError("A sampled video frame is not supported"));
    }
    seen.add(frame.index);
    previousTimestamp = frame.timestampMs;
  }
  return ok(seen);
}

function validateDraft(draft: VisualMediaAnalysisDraft, available: ReadonlySet<number>) {
  const validConfidence = (value: number) => Number.isFinite(value) && value >= 0 && value <= 1;
  const validText = (value: string, max: number) => value.trim().length > 0 && value.length <= max;
  for (const observation of draft.observations) {
    if (
      !available.has(observation.frameIndex) ||
      !validText(observation.description, 2_000) ||
      !validConfidence(observation.confidence)
    ) {
      return err(new InvalidValueError("Visual analysis returned an invalid observation"));
    }
  }
  for (const interpretation of draft.interpretations) {
    if (
      interpretation.frameIndices.length === 0 ||
      interpretation.frameIndices.some((index) => !available.has(index)) ||
      !validText(interpretation.content, 3_000) ||
      !validConfidence(interpretation.confidence)
    ) {
      return err(new InvalidValueError("Visual analysis returned an invalid interpretation"));
    }
  }
  for (const recommendation of draft.recommendations) {
    if (
      recommendation.frameIndices.length === 0 ||
      recommendation.frameIndices.some((index) => !available.has(index)) ||
      !validText(recommendation.title, 300) ||
      !validText(recommendation.rationale, 3_000) ||
      !validConfidence(recommendation.confidence)
    ) {
      return err(new InvalidValueError("Visual analysis returned an invalid recommendation"));
    }
  }
  if (draft.unknowns.some((unknown) => !validText(unknown, 1_000))) {
    return err(new InvalidValueError("Visual analysis returned an invalid unknown"));
  }
  return ok(draft);
}

async function ensureMediaEvidence(
  deps: MediaVisualAnalysisDependencies,
  input: { actorId: OwnerId; projectId: ProjectId; mediaAssetId: MediaAssetId },
) {
  const listed = await attempt("evidenceReference.listByMediaAsset", () =>
    deps.evidenceReferences.listByMediaAsset(input.mediaAssetId),
  );
  if (!listed.ok) return listed;
  const existing = listed.value.find(
    (item) =>
      item.ownerId === input.actorId &&
      item.projectId === input.projectId &&
      item.provenance.kind === "MEDIA_ASSET",
  );
  if (existing) return ok(existing);
  const evidence = createEvidenceReference({
    id: EvidenceReferenceId.unsafe(deps.ids.generate(EvidenceReferenceId.prefix)),
    ownerId: input.actorId,
    projectId: input.projectId,
    provenance: { kind: "MEDIA_ASSET", mediaAssetId: input.mediaAssetId },
    now: deps.clock.now(),
  });
  const inserted = await attempt("evidenceReference.insert", () =>
    deps.evidenceReferences.insert(evidence),
  );
  return inserted.ok ? ok(evidence) : inserted;
}

export async function runMediaVisualAnalysis(
  deps: MediaVisualAnalysisDependencies,
  input: {
    actorId: OwnerId;
    projectId: ProjectId;
    mediaAssetId: MediaAssetId;
    frames: readonly VisualAnalysisFrame[];
  },
) {
  const checkedFrames = validateFrames(input.frames);
  if (!checkedFrames.ok) return checkedFrames;
  const [project, media, brief] = await Promise.all([
    attempt("project.findById", () => deps.projects.findById(input.projectId)),
    attempt("mediaAsset.findById", () => deps.mediaAssets.findById(input.mediaAssetId)),
    attempt("creativeBrief.findByProject", () =>
      deps.creativeBriefs.findByProject(input.projectId),
    ),
  ]);
  if (!project.ok) return project;
  if (!media.ok) return media;
  if (!brief.ok) return brief;
  if (!project.value || project.value.ownerId !== input.actorId) {
    return err(new NotFoundError("Project", input.projectId));
  }
  if (
    !media.value ||
    media.value.ownerId !== input.actorId ||
    media.value.projectId !== input.projectId
  ) {
    return err(new NotFoundError("MediaAsset", input.mediaAssetId));
  }
  if (!media.value.mediaType.startsWith("video/")) {
    return err(new InvalidValueError("Visual frame analysis requires a video import"));
  }

  const created = await createAnalysisRun(deps, input);
  if (!created.ok) return created;
  const analysisRunId = created.value.id as never;
  const started = await startAnalysisRun(deps, { actorId: input.actorId, analysisRunId });
  if (!started.ok) return started;
  try {
    const draft = await deps.visualMediaAnalyzer.analyze({
      sourceName: media.value.fileName,
      projectContext: projectContext(brief.value),
      frames: input.frames,
    });
    const grounded = validateDraft(draft, checkedFrames.value);
    if (!grounded.ok) {
      await failAnalysisRun(deps, {
        actorId: input.actorId,
        analysisRunId,
        reason: grounded.error.message,
      });
      return grounded;
    }
    const evidence = await ensureMediaEvidence(deps, input);
    if (!evidence.ok) {
      await failAnalysisRun(deps, {
        actorId: input.actorId,
        analysisRunId,
        reason: "The imported media could not be linked to its visual evidence.",
      });
      return evidence;
    }
    const frameByIndex = new Map(input.frames.map((frame) => [frame.index, frame]));
    const labelFrames = (indices: readonly number[]) =>
      [...new Set(indices)]
        .map((index) => formatTimestamp(frameByIndex.get(index)!.timestampMs))
        .join(", ");
    const completed = await completeAnalysisRun(deps, {
      actorId: input.actorId,
      analysisRunId,
      outputs: [
        ...[...grounded.value.observations]
          .sort(
            (left, right) =>
              frameByIndex.get(left.frameIndex)!.timestampMs -
              frameByIndex.get(right.frameIndex)!.timestampMs,
          )
          .map((observation) => ({
            kind: "OBSERVATION" as const,
            content: `[OBSERVED @ ${labelFrames([observation.frameIndex])}] ${observation.description}`,
            confidence: observation.confidence,
            evidenceReferenceIds: [evidence.value.id],
          })),
        ...grounded.value.interpretations.map((interpretation) => ({
          kind: "INFERENCE" as const,
          content: `[ESTIMATED from ${labelFrames(interpretation.frameIndices)}] ${interpretation.content}`,
          confidence: interpretation.confidence,
          evidenceReferenceIds: [evidence.value.id],
        })),
        ...grounded.value.unknowns.map((unknown) => ({
          kind: "PROMPT" as const,
          content: `[UNKNOWN] ${unknown}`,
          confidence: null,
          evidenceReferenceIds: [evidence.value.id],
        })),
      ],
      recommendations: grounded.value.recommendations.map((recommendation) => ({
        title: recommendation.title,
        rationale: `Test against frames ${labelFrames(recommendation.frameIndices)}: ${recommendation.rationale}`,
        confidence: recommendation.confidence,
        evidenceReferenceIds: [evidence.value.id],
      })),
    });
    if (!completed.ok) {
      await failAnalysisRun(deps, {
        actorId: input.actorId,
        analysisRunId,
        reason: "The visual analysis could not be saved.",
      });
    }
    return completed;
  } catch {
    await failAnalysisRun(deps, {
      actorId: input.actorId,
      analysisRunId,
      reason: "The visual analysis engine was unavailable.",
    });
    return err(new InvalidValueError("Visual analysis is temporarily unavailable"));
  }
}
