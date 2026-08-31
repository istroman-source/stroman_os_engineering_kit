import { describe, expect, it } from "vitest";
import { createCreativeBrief, CreativeBriefId } from "@/domain/creative";
import type { VisualMediaAnalyzer } from "@/domain/media-analysis";
import { createMediaAsset, MediaAssetId } from "@/domain/media-transcript";
import { createProject, makeProjectName, OwnerId, ProjectId } from "@/domain/project";
import { InMemoryCreativeBriefRepository } from "../../../test/adapters/in-memory-creative-brief-repository";
import {
  InMemoryAnalysisRepository,
  InMemoryDecisionRepository,
  InMemoryEvidenceReferenceRepository,
  InMemoryMediaAssetRepository,
  InMemoryProjectRepository,
  InMemoryTranscriptDocumentRepository,
} from "../../../test/adapters/in-memory-repositories";
import { FixedClock, SequentialIdGenerator } from "../../../test/adapters/fakes";
import { InMemorySourceStorage } from "../../../test/adapters/in-memory-source-import";
import { runMediaVisualAnalysis } from "./run-media-visual-analysis";
import { getEvidenceFrame, inspectEvidenceReference } from "@/application/evidence";

const OWNER = OwnerId.unsafe("usr_VISUAL01");
const PROJECT = ProjectId.unsafe("proj_VISUAL01");
const MEDIA = MediaAssetId.unsafe("mast_VISUAL01");
const NOW = new Date("2026-08-13T12:00:00.000Z");

function setup(analyzer?: VisualMediaAnalyzer) {
  const projects = new InMemoryProjectRepository();
  const mediaAssets = new InMemoryMediaAssetRepository();
  const creativeBriefs = new InMemoryCreativeBriefRepository();
  const name = makeProjectName("Instruction at the Desk");
  if (!name.ok) throw name.error;
  projects.seed(createProject({ id: PROJECT, ownerId: OWNER, name: name.value, now: NOW }));
  const media = createMediaAsset({
    id: MEDIA,
    ownerId: OWNER,
    projectId: PROJECT,
    fileName: "desk.webm",
    mediaType: "video/webm",
    byteSize: 1000,
    contentHash: "sha256:visual-fixture",
    now: NOW,
  });
  if (!media.ok) throw media.error;
  mediaAssets.seed(media.value);
  const brief = createCreativeBrief({
    id: CreativeBriefId.unsafe("brief_VISUAL01"),
    projectId: PROJECT,
    title: "Instruction at the Desk",
    client: "",
    projectType: "Narrative",
    creativeGoal: "A dry procedural search comes up empty.",
    targetAudience: "",
    desiredEmotion: "Wry tension",
    context: "Phone, yellow note, drawer, keyboard, mug.",
    now: NOW,
  });
  if (!brief.ok) throw brief.error;
  void creativeBriefs.insert(brief.value);
  return {
    projects,
    mediaAssets,
    transcripts: new InMemoryTranscriptDocumentRepository(),
    creativeBriefs,
    evidenceReferences: new InMemoryEvidenceReferenceRepository(),
    analyses: new InMemoryAnalysisRepository(),
    decisions: new InMemoryDecisionRepository(),
    sourceStorage: new InMemorySourceStorage(),
    visualMediaAnalyzer:
      analyzer ??
      ({
        id: "fixture-vision",
        mode: "HOSTED",
        async analyze(input) {
          expect(input.projectContext).toContain("Phone, yellow note, drawer, keyboard, mug.");
          return {
            observations: [
              {
                frameIndex: 0,
                description: "An intern writes on a yellow note.",
                confidence: 0.95,
              },
              {
                frameIndex: 1,
                description: "The desk drawer is visibly open and empty.",
                confidence: 0.92,
              },
            ],
            interpretations: [
              {
                frameIndices: [0, 1],
                content: "The search reads as an escalating procedure.",
                confidence: 0.76,
              },
            ],
            recommendations: [
              {
                frameIndices: [1],
                title: "Protect the empty drawer",
                rationale: "Keep its interior legible in the chosen angle.",
                confidence: 0.84,
              },
            ],
            unknowns: ["Sound and dialogue cannot be verified from sampled frames."],
          };
        },
      } satisfies VisualMediaAnalyzer),
    ids: new SequentialIdGenerator(),
    clock: new FixedClock(NOW),
  };
}

const frames = [
  { index: 0, timestampMs: 500, mimeType: "image/jpeg" as const, bytes: new Uint8Array([1]) },
  { index: 1, timestampMs: 1500, mimeType: "image/jpeg" as const, bytes: new Uint8Array([2]) },
];

describe("runMediaVisualAnalysis", () => {
  it("persists visible facts, estimated readings, unknowns, and advice against media evidence", async () => {
    const deps = setup();
    const result = await runMediaVisualAnalysis(deps, {
      actorId: OWNER,
      projectId: PROJECT,
      mediaAssetId: MEDIA,
      frames,
    });
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.value.run).toMatchObject({ status: "COMPLETED", version: 1 });
    expect(result.value.outputs.map((output) => output.content)).toEqual([
      "[OBSERVED @ 00:00.5] An intern writes on a yellow note.",
      "[OBSERVED @ 00:01.5] The desk drawer is visibly open and empty.",
      "[ESTIMATED from 00:00.5, 00:01.5] The search reads as an escalating procedure.",
      "[UNKNOWN] Sound and dialogue cannot be verified from sampled frames.",
    ]);
    expect(result.value.recommendations[0]?.rationale).toContain("frames 00:01.5");
    expect(result.value.outputs.map((claim) => claim.evidenceReferenceIds.length)).toEqual([
      1, 1, 2, 2,
    ]);
    expect(result.value.recommendations[0]?.evidenceReferenceIds).toHaveLength(1);
    const evidence = await deps.evidenceReferences.listByMediaAsset(MEDIA);
    expect(evidence).toHaveLength(2);
    expect(
      evidence.map((item) =>
        item.provenance.kind === "MEDIA_ASSET" ? item.provenance.frame?.timestampMs : null,
      ),
    ).toEqual([500, 1500]);
    expect(deps.sourceStorage.values.size).toBe(2);
    const firstEvidence = evidence[0]!;
    const inspected = await inspectEvidenceReference(deps, {
      actorId: OWNER,
      projectId: PROJECT,
      evidenceReferenceId: firstEvidence.id,
    });
    expect(inspected.ok && inspected.value.frame).toMatchObject({
      index: 0,
      timestampMs: 500,
      contentType: "image/jpeg",
    });
    const loaded = await getEvidenceFrame(deps, {
      actorId: OWNER,
      projectId: PROJECT,
      evidenceReferenceId: firstEvidence.id,
    });
    expect(loaded.ok && loaded.value.bytes).toEqual(frames[0]!.bytes);
  });

  it("rejects provider claims that cite a frame outside the uploaded sample", async () => {
    const deps = setup({
      id: "bad-vision",
      mode: "HOSTED",
      async analyze() {
        return {
          observations: [{ frameIndex: 99, description: "Invented frame.", confidence: 1 }],
          interpretations: [],
          recommendations: [],
          unknowns: [],
        };
      },
    });
    const result = await runMediaVisualAnalysis(deps, {
      actorId: OWNER,
      projectId: PROJECT,
      mediaAssetId: MEDIA,
      frames,
    });
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.error.message).toMatch(/invalid observation/i);
  });
});
