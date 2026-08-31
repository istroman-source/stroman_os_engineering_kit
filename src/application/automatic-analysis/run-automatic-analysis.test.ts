import { describe, expect, it } from "vitest";
import { getLatestAutomaticAnalysis, runAutomaticAnalysis } from ".";
import {
  completeAnalysisRun,
  createAnalysisRun,
  failAnalysisRun,
  startAnalysisRun,
} from "@/application/analysis";
import type { GroundedEditorialAnalyzer } from "@/domain/analysis";
import { createDecision, DecisionId } from "@/domain/decision";
import { createEvidenceReference, EvidenceReferenceId } from "@/domain/evidence";
import {
  createMediaAsset,
  createTranscriptDocument,
  MediaAssetId,
  TranscriptDocumentId,
  TranscriptSegmentId,
} from "@/domain/media-transcript";
import { createProject, makeProjectName, OwnerId, ProjectId } from "@/domain/project";
import {
  InMemoryAnalysisRepository,
  InMemoryDecisionRepository,
  InMemoryEvidenceReferenceRepository,
  InMemoryMediaAssetRepository,
  InMemoryProjectRepository,
  InMemoryTranscriptDocumentRepository,
} from "../../../test/adapters/in-memory-repositories";
import { FixedClock, SequentialIdGenerator } from "../../../test/adapters/fakes";

const OWNER = OwnerId.unsafe("usr_OWNER001");
const OTHER = OwnerId.unsafe("usr_OTHER001");
const PROJECT = ProjectId.unsafe("proj_AAAAAAA1");
const MEDIA = MediaAssetId.unsafe("media_00000001");
const DOCUMENT = TranscriptDocumentId.unsafe("trdoc_00000001");
const SEGMENT_A = TranscriptSegmentId.unsafe("trseg_00000001");
const SEGMENT_B = TranscriptSegmentId.unsafe("trseg_00000002");
const NOW = new Date("2026-07-29T12:00:00.000Z");

function defaultAnalyzer(): GroundedEditorialAnalyzer {
  return {
    async analyze({ segments }) {
      return {
        outputs: [
          {
            kind: "OBSERVATION",
            content: segments[0]!.text,
            confidence: 1,
            sourceSegmentIds: [segments[0]!.transcriptSegmentId],
          },
        ],
        recommendations: [
          {
            title: "Start with the explicit statement",
            rationale: "It is directly supported by the transcript.",
            confidence: 0.8,
            sourceSegmentIds: [segments[0]!.transcriptSegmentId],
          },
        ],
      };
    },
  };
}

function setup(analyzer: GroundedEditorialAnalyzer = defaultAnalyzer()) {
  const projects = new InMemoryProjectRepository();
  const mediaAssets = new InMemoryMediaAssetRepository();
  const transcripts = new InMemoryTranscriptDocumentRepository();
  const name = makeProjectName("Interview");
  if (!name.ok) throw name.error;
  projects.seed(createProject({ id: PROJECT, ownerId: OWNER, name: name.value, now: NOW }));
  const media = createMediaAsset({
    id: MEDIA,
    ownerId: OWNER,
    projectId: PROJECT,
    fileName: "interview.mp4",
    mediaType: "video/mp4",
    byteSize: 100,
    contentHash: "sha256:fixture",
    now: NOW,
  });
  if (!media.ok) throw media.error;
  mediaAssets.seed(media.value);
  return {
    projects,
    mediaAssets,
    transcripts,
    evidenceReferences: new InMemoryEvidenceReferenceRepository(),
    analyses: new InMemoryAnalysisRepository(),
    decisions: new InMemoryDecisionRepository(),
    analyzer,
    ids: new SequentialIdGenerator(),
    clock: new FixedClock(NOW),
  };
}

class CompletionFailingAnalysisRepository extends InMemoryAnalysisRepository {
  override async saveResult(): Promise<void> {
    throw new Error("synthetic completion failure");
  }
}

function seedTranscript(deps: ReturnType<typeof setup>) {
  const transcript = createTranscriptDocument({
    id: DOCUMENT,
    ownerId: OWNER,
    projectId: PROJECT,
    mediaAssetId: MEDIA,
    title: "Interview",
    speakers: [],
    segments: [
      {
        id: SEGMENT_A,
        sequence: 0,
        text: "Community is why we kept building this place together.",
        startMs: 0,
        endMs: 1000,
      },
      {
        id: SEGMENT_B,
        sequence: 1,
        text: "Every guest should feel part of that community.",
        startMs: 1000,
        endMs: 2000,
      },
    ],
    now: NOW,
  });
  if (!transcript.ok) throw transcript.error;
  deps.transcripts.seed(transcript.value);
}

describe("runAutomaticAnalysis", () => {
  it("creates a completed versioned run with evidence on every claim", async () => {
    const deps = setup();
    seedTranscript(deps);
    const result = await runAutomaticAnalysis(deps, { actorId: OWNER, projectId: PROJECT });
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.value.run.status).toBe("COMPLETED");
    expect(result.value.run.version).toBe(1);
    expect(result.value.outputs.length).toBeGreaterThan(0);
    for (const item of [...result.value.outputs, ...result.value.recommendations]) {
      expect(item.evidenceReferenceIds.length).toBeGreaterThan(0);
    }
    expect(await deps.evidenceReferences.listByProject(PROJECT)).toHaveLength(2);
  });

  it("completes with an explicit empty result when no substantive claims are supported", async () => {
    const analyzer: GroundedEditorialAnalyzer = {
      async analyze() {
        return { outputs: [], recommendations: [] };
      },
    };
    const deps = setup(analyzer);
    seedTranscript(deps);

    const result = await runAutomaticAnalysis(deps, { actorId: OWNER, projectId: PROJECT });

    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.value.run.status).toBe("COMPLETED");
    expect(result.value.outputs).toEqual([]);
    expect(result.value.recommendations).toEqual([]);
    expect(await deps.evidenceReferences.listByProject(PROJECT)).toHaveLength(2);
    const latest = await getLatestAutomaticAnalysis(deps, {
      actorId: OWNER,
      projectId: PROJECT,
    });
    expect(latest.ok && latest.value.run.status).toBe("COMPLETED");
    if (latest.ok) {
      expect(latest.value.outputs).toEqual([]);
      expect(latest.value.recommendations).toEqual([]);
    }
  });

  it("creates a new run version while reusing immutable transcript evidence", async () => {
    const deps = setup();
    seedTranscript(deps);
    const first = await runAutomaticAnalysis(deps, { actorId: OWNER, projectId: PROJECT });
    const second = await runAutomaticAnalysis(deps, { actorId: OWNER, projectId: PROJECT });
    expect(first.ok && second.ok).toBe(true);
    if (!second.ok) return;
    expect(second.value.run.version).toBe(2);
    expect(await deps.evidenceReferences.listByProject(PROJECT)).toHaveLength(2);
    const latest = await getLatestAutomaticAnalysis(deps, {
      actorId: OWNER,
      projectId: PROJECT,
    });
    expect(latest.ok && latest.value.run.version).toBe(2);
  });

  it("flags prior edit decisions when source evidence is reanalyzed", async () => {
    const deps = setup();
    seedTranscript(deps);
    const decision = createDecision({
      id: DecisionId.unsafe("dec_EDITSTALE1"),
      projectId: PROJECT,
      question: "Use this edit recommendation?",
      options: [
        { id: "keep", label: "Keep" },
        { id: "reject", label: "Reject" },
      ],
      context: {
        originStage: "EDIT",
        artifactKind: "EDIT_RECOMMENDATION",
        artifactVersion: 1,
      },
      now: NOW,
    });
    if (!decision.ok) throw decision.error;
    deps.decisions.seed(decision.value);

    const result = await runAutomaticAnalysis(deps, { actorId: OWNER, projectId: PROJECT });

    expect(result.ok).toBe(true);
    expect((await deps.decisions.findById(decision.value.id))?.context).toMatchObject({
      needsReview: true,
      reviewReason: expect.stringContaining("Source evidence or analysis changed"),
    });
  });

  it("combines the latest transcript and visual runs without reviving stale findings", async () => {
    const deps = setup();
    seedTranscript(deps);
    const firstTranscript = await runAutomaticAnalysis(deps, {
      actorId: OWNER,
      projectId: PROJECT,
    });
    expect(firstTranscript.ok && firstTranscript.value.run.sourceKind).toBe("TRANSCRIPT");

    const frameEvidence = createEvidenceReference({
      id: EvidenceReferenceId.unsafe("evref_VISUAL001"),
      ownerId: OWNER,
      projectId: PROJECT,
      provenance: {
        kind: "MEDIA_ASSET",
        mediaAssetId: MEDIA,
        frame: {
          index: 3,
          timestampMs: 3000,
          storageKey: "evidence/project/frame-3.jpg",
          contentType: "image/jpeg",
          byteSize: 1200,
          contentHash: "sha256:frame-3",
        },
      },
      now: NOW,
    });
    deps.evidenceReferences.seed(frameEvidence);
    const visual = await createAnalysisRun(deps, {
      actorId: OWNER,
      projectId: PROJECT,
      sourceKind: "VISUAL_MEDIA",
    });
    expect(visual.ok).toBe(true);
    if (!visual.ok) return;
    await startAnalysisRun(deps, {
      actorId: OWNER,
      analysisRunId: visual.value.id as never,
    });
    const completedVisual = await completeAnalysisRun(deps, {
      actorId: OWNER,
      analysisRunId: visual.value.id as never,
      outputs: [
        {
          kind: "OBSERVATION",
          content: "The doorway remains visible behind the speaker.",
          confidence: 1,
          evidenceReferenceIds: [frameEvidence.id],
        },
      ],
      recommendations: [
        {
          title: "Preserve the doorway reveal",
          rationale: "The sampled frame confirms a usable depth relationship.",
          confidence: 0.8,
          evidenceReferenceIds: [frameEvidence.id],
        },
      ],
    });
    expect(completedVisual.ok && completedVisual.value.run.sourceKind).toBe("VISUAL_MEDIA");

    const newestTranscript = await runAutomaticAnalysis(deps, {
      actorId: OWNER,
      projectId: PROJECT,
    });
    expect(newestTranscript.ok && newestTranscript.value.run.version).toBe(3);

    const latest = await getLatestAutomaticAnalysis(deps, {
      actorId: OWNER,
      projectId: PROJECT,
    });
    expect(latest.ok).toBe(true);
    if (!latest.ok) return;
    expect(latest.value.run).toMatchObject({ version: 3, sourceKind: "TRANSCRIPT" });
    expect(latest.value.outputs.map((item) => item.content)).toEqual([
      "The doorway remains visible behind the speaker.",
      "Community is why we kept building this place together.",
    ]);
    expect(latest.value.recommendations.map((item) => item.title)).toEqual([
      "Preserve the doorway reveal",
      "Start with the explicit statement",
    ]);
    expect(latest.value.outputs).toHaveLength(2);

    const emptyTranscript = await createAnalysisRun(deps, {
      actorId: OWNER,
      projectId: PROJECT,
      sourceKind: "TRANSCRIPT",
    });
    expect(emptyTranscript.ok).toBe(true);
    if (!emptyTranscript.ok) return;
    await startAnalysisRun(deps, {
      actorId: OWNER,
      analysisRunId: emptyTranscript.value.id as never,
    });
    await completeAnalysisRun(deps, {
      actorId: OWNER,
      analysisRunId: emptyTranscript.value.id as never,
      outputs: [],
      recommendations: [],
    });
    const afterEmptyTranscript = await getLatestAutomaticAnalysis(deps, {
      actorId: OWNER,
      projectId: PROJECT,
    });
    expect(afterEmptyTranscript.ok).toBe(true);
    if (!afterEmptyTranscript.ok) return;
    expect(afterEmptyTranscript.value.run).toMatchObject({
      version: 4,
      sourceKind: "TRANSCRIPT",
    });
    expect(afterEmptyTranscript.value.outputs.map((item) => item.content)).toEqual([
      "The doorway remains visible behind the speaker.",
    ]);
  });

  it("stops legacy results from resurfacing after typed source analysis begins", async () => {
    const deps = setup();
    seedTranscript(deps);
    const legacy = await createAnalysisRun(deps, { actorId: OWNER, projectId: PROJECT });
    expect(legacy.ok).toBe(true);
    if (!legacy.ok) return;
    await startAnalysisRun(deps, {
      actorId: OWNER,
      analysisRunId: legacy.value.id as never,
    });
    await completeAnalysisRun(deps, {
      actorId: OWNER,
      analysisRunId: legacy.value.id as never,
      outputs: [
        {
          kind: "INFERENCE",
          content: "A stale legacy interpretation.",
          confidence: 0.4,
        },
      ],
      recommendations: [],
    });

    const transcript = await runAutomaticAnalysis(deps, { actorId: OWNER, projectId: PROJECT });
    expect(transcript.ok).toBe(true);
    const latest = await getLatestAutomaticAnalysis(deps, {
      actorId: OWNER,
      projectId: PROJECT,
    });
    expect(latest.ok).toBe(true);
    if (!latest.ok) return;
    expect(latest.value.outputs.map((item) => item.content)).not.toContain(
      "A stale legacy interpretation.",
    );
  });

  it("returns the latest completed run while newer pending, running, and failed runs exist", async () => {
    const deps = setup();
    seedTranscript(deps);
    const completed = await runAutomaticAnalysis(deps, {
      actorId: OWNER,
      projectId: PROJECT,
    });
    expect(completed.ok).toBe(true);

    const pending = await createAnalysisRun(deps, { actorId: OWNER, projectId: PROJECT });
    expect(pending.ok).toBe(true);
    if (!pending.ok) return;
    let latest = await getLatestAutomaticAnalysis(deps, {
      actorId: OWNER,
      projectId: PROJECT,
    });
    expect(latest.ok && latest.value.run.version).toBe(1);

    const running = await startAnalysisRun(deps, {
      actorId: OWNER,
      analysisRunId: pending.value.id as never,
    });
    expect(running.ok).toBe(true);
    latest = await getLatestAutomaticAnalysis(deps, {
      actorId: OWNER,
      projectId: PROJECT,
    });
    expect(latest.ok && latest.value.run.version).toBe(1);

    const failed = await failAnalysisRun(deps, {
      actorId: OWNER,
      analysisRunId: pending.value.id as never,
      reason: "Interrupted.",
    });
    expect(failed.ok).toBe(true);
    latest = await getLatestAutomaticAnalysis(deps, {
      actorId: OWNER,
      projectId: PROJECT,
    });
    expect(latest.ok && latest.value.run.version).toBe(1);
  });

  it("does not reveal another owner's project and rejects missing transcripts", async () => {
    const deps = setup();
    expect((await runAutomaticAnalysis(deps, { actorId: OTHER, projectId: PROJECT })).ok).toBe(
      false,
    );
    expect((await runAutomaticAnalysis(deps, { actorId: OWNER, projectId: PROJECT })).ok).toBe(
      false,
    );
    expect(await deps.analyses.listRunsByProject(PROJECT)).toHaveLength(0);
    expect(
      (await getLatestAutomaticAnalysis(deps, { actorId: OWNER, projectId: PROJECT })).ok,
    ).toBe(false);
  });

  it("rejects unsupported claims and records the run as failed", async () => {
    const analyzer: GroundedEditorialAnalyzer = {
      async analyze() {
        return {
          outputs: [
            {
              kind: "INFERENCE",
              content: "Unsupported claim",
              confidence: 0.9,
              sourceSegmentIds: [TranscriptSegmentId.unsafe("trseg_OUTSIDE01")],
            },
          ],
          recommendations: [],
        };
      },
    };
    const deps = setup(analyzer);
    seedTranscript(deps);
    const result = await runAutomaticAnalysis(deps, { actorId: OWNER, projectId: PROJECT });
    expect(result.ok).toBe(false);
    const runs = await deps.analyses.listRunsByProject(PROJECT);
    expect(runs).toHaveLength(1);
    expect(runs[0]?.status).toBe("FAILED");
  });

  it("marks the run failed when completion payload validation fails", async () => {
    const analyzer: GroundedEditorialAnalyzer = {
      async analyze() {
        return {
          outputs: [
            {
              kind: "INFERENCE",
              content: "Grounded but invalid confidence",
              confidence: 2,
              sourceSegmentIds: [SEGMENT_A],
            },
          ],
          recommendations: [],
        };
      },
    };
    const deps = setup(analyzer);
    seedTranscript(deps);
    const result = await runAutomaticAnalysis(deps, {
      actorId: OWNER,
      projectId: PROJECT,
    });
    expect(result.ok).toBe(false);
    const runs = await deps.analyses.listRunsByProject(PROJECT);
    expect(runs).toHaveLength(1);
    expect(runs[0]?.status).toBe("FAILED");
    expect(runs[0]?.failureReason).toBe("The analysis result could not be completed.");
  });

  it("marks the run failed when result persistence fails", async () => {
    const deps = setup();
    deps.analyses = new CompletionFailingAnalysisRepository();
    seedTranscript(deps);
    const result = await runAutomaticAnalysis(deps, {
      actorId: OWNER,
      projectId: PROJECT,
    });
    expect(result.ok).toBe(false);
    const runs = await deps.analyses.listRunsByProject(PROJECT);
    expect(runs).toHaveLength(1);
    expect(runs[0]?.status).toBe("FAILED");
    expect(runs[0]?.failureReason).toBe("The analysis result could not be completed.");
  });
});
