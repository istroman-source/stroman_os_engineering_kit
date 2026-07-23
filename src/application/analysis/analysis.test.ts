import { describe, expect, it } from "vitest";
import { createDecision, DecisionId } from "@/domain/decision";
import { createEvidenceReference, EvidenceReferenceId } from "@/domain/evidence";
import { MediaAssetId } from "@/domain/media-transcript";
import { createProject, makeProjectName, OwnerId, ProjectId } from "@/domain/project";
import { InvalidValueError } from "@/domain/shared";
import { FixedClock, SequentialIdGenerator } from "../../../test/adapters/fakes";
import {
  InMemoryAnalysisRepository,
  InMemoryDecisionRepository,
  InMemoryEvidenceReferenceRepository,
  InMemoryProjectRepository,
} from "../../../test/adapters/in-memory-repositories";
import { completeAnalysisRun, createAnalysisRun, getAnalysisRun, startAnalysisRun } from ".";

const OWNER = OwnerId.unsafe("usr_00000001");
const OTHER = OwnerId.unsafe("usr_00000002");
const PROJECT = ProjectId.unsafe("proj_00000001");
const OTHER_PROJECT = ProjectId.unsafe("proj_00000002");
const NOW = new Date("2026-07-23T00:00:00Z");

function env() {
  const projects = new InMemoryProjectRepository();
  const name = makeProjectName("Documentary");
  if (!name.ok) throw name.error;
  projects.seed(createProject({ id: PROJECT, ownerId: OWNER, name: name.value, now: NOW }));
  return {
    projects,
    analyses: new InMemoryAnalysisRepository(),
    evidenceReferences: new InMemoryEvidenceReferenceRepository(),
    decisions: new InMemoryDecisionRepository(),
    ids: new SequentialIdGenerator(),
    clock: new FixedClock(NOW),
  };
}

describe("analysis application", () => {
  it("versions runs and persists immutable editorial outputs atomically", async () => {
    const e = env();
    const first = await createAnalysisRun(e, { actorId: OWNER, projectId: PROJECT });
    const second = await createAnalysisRun(e, { actorId: OWNER, projectId: PROJECT });
    expect(first.ok && first.value.version).toBe(1);
    expect(second.ok && second.value.version).toBe(2);
    if (!first.ok) throw first.error;
    const started = await startAnalysisRun(e, {
      actorId: OWNER,
      analysisRunId: first.value.id as never,
    });
    expect(started.ok).toBe(true);
    const completed = await completeAnalysisRun(e, {
      actorId: OWNER,
      analysisRunId: first.value.id as never,
      outputs: [{ kind: "THEME", content: "Belonging drives the story", confidence: 0.8 }],
      recommendations: [
        {
          title: "Open on the reunion",
          rationale: "It states the emotional question",
          confidence: 0.9,
        },
      ],
    });
    expect(completed.ok).toBe(true);
    const read = await getAnalysisRun(e, {
      actorId: OWNER,
      analysisRunId: first.value.id as never,
    });
    expect(read.ok && read.value.outputs[0]?.kind).toBe("THEME");
    expect(read.ok && read.value.recommendations[0]?.title).toBe("Open on the reunion");
  });

  it("enforces ownership and lifecycle state", async () => {
    const e = env();
    const created = await createAnalysisRun(e, { actorId: OWNER, projectId: PROJECT });
    if (!created.ok) throw created.error;
    expect(
      (await startAnalysisRun(e, { actorId: OTHER, analysisRunId: created.value.id as never })).ok,
    ).toBe(false);
    expect(
      (
        await completeAnalysisRun(e, {
          actorId: OWNER,
          analysisRunId: created.value.id as never,
          outputs: [],
          recommendations: [],
        })
      ).ok,
    ).toBe(false);
  });

  it("validates analysis payloads before any result mutation", async () => {
    const e = env();
    const created = await createAnalysisRun(e, { actorId: OWNER, projectId: PROJECT });
    if (!created.ok) throw created.error;
    await startAnalysisRun(e, { actorId: OWNER, analysisRunId: created.value.id as never });
    const result = await completeAnalysisRun(e, {
      actorId: OWNER,
      analysisRunId: created.value.id as never,
      outputs: [{ kind: "INFERENCE", content: "", confidence: 2 }],
      recommendations: [],
    });
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.error).toBeInstanceOf(InvalidValueError);
    const read = await getAnalysisRun(e, {
      actorId: OWNER,
      analysisRunId: created.value.id as never,
    });
    expect(read.ok && read.value.run.status).toBe("RUNNING");
    expect(read.ok && read.value.outputs).toEqual([]);
  });

  it("rejects evidence from another project without persisting a partial result", async () => {
    const e = env();
    const evidence = createEvidenceReference({
      id: EvidenceReferenceId.unsafe("evref_00000001"),
      ownerId: OWNER,
      projectId: OTHER_PROJECT,
      provenance: {
        kind: "MEDIA_ASSET",
        mediaAssetId: MediaAssetId.unsafe("mast_00000001"),
      },
      now: NOW,
    });
    e.evidenceReferences.seed(evidence);
    const created = await createAnalysisRun(e, { actorId: OWNER, projectId: PROJECT });
    if (!created.ok) throw created.error;
    await startAnalysisRun(e, { actorId: OWNER, analysisRunId: created.value.id as never });

    const result = await completeAnalysisRun(e, {
      actorId: OWNER,
      analysisRunId: created.value.id as never,
      outputs: [
        {
          kind: "OBSERVATION",
          content: "A cross-project citation",
          evidenceReferenceIds: [evidence.id],
        },
      ],
      recommendations: [
        { title: "Use the citation", rationale: "It appears relevant", confidence: 0.8 },
      ],
    });

    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.error).toBeInstanceOf(InvalidValueError);
    const read = await getAnalysisRun(e, {
      actorId: OWNER,
      analysisRunId: created.value.id as never,
    });
    expect(read.ok && read.value.run.status).toBe("RUNNING");
    expect(read.ok && read.value.outputs).toEqual([]);
    expect(read.ok && read.value.recommendations).toEqual([]);
  });

  it("rejects a Decision from another project without persisting a partial result", async () => {
    const e = env();
    const decision = createDecision({
      id: DecisionId.unsafe("dec_00000001"),
      projectId: OTHER_PROJECT,
      question: "Which opening should we use?",
      options: [
        { id: "quiet", label: "Quiet opening" },
        { id: "urgent", label: "Urgent opening" },
      ],
      now: NOW,
    });
    if (!decision.ok) throw decision.error;
    e.decisions.seed(decision.value);
    const created = await createAnalysisRun(e, { actorId: OWNER, projectId: PROJECT });
    if (!created.ok) throw created.error;
    await startAnalysisRun(e, { actorId: OWNER, analysisRunId: created.value.id as never });

    const result = await completeAnalysisRun(e, {
      actorId: OWNER,
      analysisRunId: created.value.id as never,
      outputs: [{ kind: "NARRATIVE", content: "The current story shape" }],
      recommendations: [
        {
          title: "Use the quiet opening",
          rationale: "It creates contrast",
          confidence: 0.9,
          decisionId: decision.value.id,
        },
      ],
    });

    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.error).toBeInstanceOf(InvalidValueError);
    const read = await getAnalysisRun(e, {
      actorId: OWNER,
      analysisRunId: created.value.id as never,
    });
    expect(read.ok && read.value.run.status).toBe("RUNNING");
    expect(read.ok && read.value.outputs).toEqual([]);
    expect(read.ok && read.value.recommendations).toEqual([]);
  });
});
