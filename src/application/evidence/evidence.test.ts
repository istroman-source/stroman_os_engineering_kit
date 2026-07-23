import { describe, expect, it } from "vitest";
import { OwnerId, ProjectId, createProject, makeProjectName } from "@/domain/project";
import {
  MediaAssetId,
  TranscriptDocumentId,
  TranscriptSegmentId,
  createMediaAsset,
  createTranscriptDocument,
} from "@/domain/media-transcript";
import { InvalidValueError } from "@/domain/shared";
import { FixedClock, SequentialIdGenerator } from "../../../test/adapters/fakes";
import {
  InMemoryEvidenceReferenceRepository,
  InMemoryMediaAssetRepository,
  InMemoryProjectRepository,
  InMemoryTranscriptDocumentRepository,
} from "../../../test/adapters/in-memory-repositories";
import {
  createEvidenceReference,
  getEvidenceReference,
  listEvidenceForMediaAsset,
  listEvidenceForProject,
  listEvidenceForTranscript,
} from "./index";

const OWNER = OwnerId.unsafe("usr_00000001");
const OTHER = OwnerId.unsafe("usr_00000002");
const PROJECT = ProjectId.unsafe("proj_00000001");
const OTHER_PROJECT = ProjectId.unsafe("proj_00000002");
const ASSET = MediaAssetId.unsafe("mast_00000001");
const TRANSCRIPT = TranscriptDocumentId.unsafe("trdoc_00000001");
const SEGMENT = TranscriptSegmentId.unsafe("trseg_00000001");
const NOW = new Date("2026-07-22T21:00:00Z");

function environment() {
  const projects = new InMemoryProjectRepository();
  const name = makeProjectName("Documentary");
  if (!name.ok) throw name.error;
  projects.seed(createProject({ id: PROJECT, ownerId: OWNER, name: name.value, now: NOW }));
  projects.seed(createProject({ id: OTHER_PROJECT, ownerId: OWNER, name: name.value, now: NOW }));
  const mediaAssets = new InMemoryMediaAssetRepository();
  const media = createMediaAsset({
    id: ASSET,
    ownerId: OWNER,
    projectId: PROJECT,
    fileName: "interview.mp4",
    mediaType: "video/mp4",
    byteSize: 10,
    contentHash: "sha256:a",
    now: NOW,
  });
  if (!media.ok) throw media.error;
  mediaAssets.seed(media.value);
  const transcripts = new InMemoryTranscriptDocumentRepository();
  const transcript = createTranscriptDocument({
    id: TRANSCRIPT,
    ownerId: OWNER,
    projectId: PROJECT,
    mediaAssetId: ASSET,
    title: "Interview",
    speakers: [],
    segments: [{ id: SEGMENT, sequence: 0, text: "A grounded statement" }],
    now: NOW,
  });
  if (!transcript.ok) throw transcript.error;
  transcripts.seed(transcript.value);
  return {
    projects,
    mediaAssets,
    transcripts,
    evidenceReferences: new InMemoryEvidenceReferenceRepository(),
    ids: new SequentialIdGenerator(),
    clock: new FixedClock(NOW),
  };
}

const unwrap = <T>(result: { ok: true; value: T } | { ok: false; error: unknown }): T => {
  if (!result.ok) throw result.error;
  return result.value;
};

describe("evidence application", () => {
  it("creates, gets, and lists media-asset evidence", async () => {
    const e = environment();
    const created = unwrap(
      await createEvidenceReference(e, {
        actorId: OWNER,
        projectId: PROJECT,
        source: { kind: "MEDIA_ASSET", mediaAssetId: ASSET },
      }),
    );
    expect(created.provenance).toEqual({ kind: "MEDIA_ASSET", mediaAssetId: ASSET });
    expect(
      unwrap(await getEvidenceReference(e, { actorId: OWNER, evidenceReferenceId: created.id })),
    ).toEqual(created);
    expect(unwrap(await listEvidenceForProject(e, { actorId: OWNER, projectId: PROJECT }))).toEqual(
      [created],
    );
    expect(
      unwrap(await listEvidenceForMediaAsset(e, { actorId: OWNER, mediaAssetId: ASSET })),
    ).toEqual([created]);
  });

  it("creates durable transcript-segment evidence and lists it by transcript", async () => {
    const e = environment();
    const created = unwrap(
      await createEvidenceReference(e, {
        actorId: OWNER,
        projectId: PROJECT,
        source: {
          kind: "TRANSCRIPT_SEGMENT",
          transcriptDocumentId: TRANSCRIPT,
          transcriptSegmentId: SEGMENT,
        },
      }),
    );
    expect(created.provenance).toEqual({
      kind: "TRANSCRIPT_SEGMENT",
      mediaAssetId: ASSET,
      transcriptDocumentId: TRANSCRIPT,
      transcriptSegmentId: SEGMENT,
    });
    expect(
      unwrap(
        await listEvidenceForTranscript(e, { actorId: OWNER, transcriptDocumentId: TRANSCRIPT }),
      ),
    ).toEqual([created]);
  });

  it("rejects missing segments without persistence", async () => {
    const e = environment();
    const result = await createEvidenceReference(e, {
      actorId: OWNER,
      projectId: PROJECT,
      source: {
        kind: "TRANSCRIPT_SEGMENT",
        transcriptDocumentId: TRANSCRIPT,
        transcriptSegmentId: TranscriptSegmentId.unsafe("trseg_99999999"),
      },
    });
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.error).toBeInstanceOf(InvalidValueError);
    expect(await e.evidenceReferences.listByProject(PROJECT)).toEqual([]);
  });

  it("enforces owner and project alignment before persistence", async () => {
    const e = environment();
    expect((await listEvidenceForProject(e, { actorId: OTHER, projectId: PROJECT })).ok).toBe(
      false,
    );
    const mismatch = createMediaAsset({
      id: MediaAssetId.unsafe("mast_00000002"),
      ownerId: OWNER,
      projectId: OTHER_PROJECT,
      fileName: "other.mp4",
      mediaType: "video/mp4",
      byteSize: 1,
      contentHash: "sha256:b",
      now: NOW,
    });
    if (!mismatch.ok) throw mismatch.error;
    e.mediaAssets.seed(mismatch.value);
    const result = await createEvidenceReference(e, {
      actorId: OWNER,
      projectId: PROJECT,
      source: { kind: "MEDIA_ASSET", mediaAssetId: mismatch.value.id },
    });
    expect(result.ok).toBe(false);
    expect(await e.evidenceReferences.listByProject(PROJECT)).toEqual([]);
  });

  it("returns safe failures for unknown records and repository errors", async () => {
    const e = environment();
    expect(
      (
        await createEvidenceReference(e, {
          actorId: OWNER,
          projectId: ProjectId.unsafe("proj_99999999"),
          source: { kind: "MEDIA_ASSET", mediaAssetId: ASSET },
        })
      ).ok,
    ).toBe(false);
    expect(
      (
        await createEvidenceReference(e, {
          actorId: OWNER,
          projectId: PROJECT,
          source: { kind: "MEDIA_ASSET", mediaAssetId: MediaAssetId.unsafe("mast_99999999") },
        })
      ).ok,
    ).toBe(false);
    e.evidenceReferences.fail = true;
    expect((await listEvidenceForProject(e, { actorId: OWNER, projectId: PROJECT })).ok).toBe(
      false,
    );
  });
});
