import { describe, expect, it } from "vitest";
import { OwnerId, ProjectId, createProject, makeProjectName } from "@/domain/project";
import { MediaAssetId, createMediaAsset } from "@/domain/media-transcript";
import { FixedClock, SequentialIdGenerator } from "../../../test/adapters/fakes";
import {
  InMemoryMediaAssetRepository,
  InMemoryProjectRepository,
  InMemoryTranscriptDocumentRepository,
} from "../../../test/adapters/in-memory-repositories";
import {
  createTranscriptDocument,
  getMediaAsset,
  getTranscriptDocument,
  getTranscriptForMediaAsset,
  listMediaAssetsForProject,
  listTranscriptsForProject,
  registerMediaAsset,
} from "./index";

const OWNER = OwnerId.unsafe("usr_00000001");
const OTHER = OwnerId.unsafe("usr_00000002");
const PROJECT = ProjectId.unsafe("proj_00000001");
const OTHER_PROJECT = ProjectId.unsafe("proj_00000002");
const NOW = new Date("2026-07-22T00:00:00Z");
function env() {
  const projects = new InMemoryProjectRepository();
  const name = makeProjectName("Documentary");
  if (!name.ok) throw name.error;
  projects.seed(createProject({ id: PROJECT, ownerId: OWNER, name: name.value, now: NOW }));
  projects.seed(createProject({ id: OTHER_PROJECT, ownerId: OWNER, name: name.value, now: NOW }));
  return {
    projects,
    mediaAssets: new InMemoryMediaAssetRepository(),
    transcripts: new InMemoryTranscriptDocumentRepository(),
    ids: new SequentialIdGenerator(),
    clock: new FixedClock(NOW),
  };
}
const unwrap = <T>(result: { ok: true; value: T } | { ok: false; error: unknown }): T => {
  if (!result.ok) throw result.error;
  return result.value;
};
async function media(e: ReturnType<typeof env>) {
  return unwrap(
    await registerMediaAsset(e, {
      actorId: OWNER,
      projectId: PROJECT,
      fileName: "a.mp4",
      mediaType: "video/mp4",
      byteSize: 10,
      contentHash: "sha256:a",
    }),
  );
}

describe("media transcript application", () => {
  it("registers, reads, and lists media for an owned project", async () => {
    const e = env();
    const created = await media(e);
    expect(unwrap(await getMediaAsset(e, { actorId: OWNER, mediaAssetId: created.id }))).toEqual(
      created,
    );
    expect(
      unwrap(await listMediaAssetsForProject(e, { actorId: OWNER, projectId: PROJECT })),
    ).toEqual([created]);
  });

  it("creates and reads normalized transcripts through every query", async () => {
    const e = env();
    const asset = await media(e);
    const transcript = unwrap(
      await createTranscriptDocument(e, {
        actorId: OWNER,
        projectId: PROJECT,
        mediaAssetId: asset.id,
        title: "Interview",
        speakers: [{ label: "Guest" }],
        segments: [
          { sequence: 1, speakerIndex: 0, text: "Second" },
          { sequence: 0, text: "First", startMs: 0, endMs: 10 },
        ],
      }),
    );
    expect(transcript.segments.map((value) => value.sequence)).toEqual([0, 1]);
    expect(
      unwrap(
        await getTranscriptDocument(e, { actorId: OWNER, transcriptDocumentId: transcript.id }),
      ),
    ).toEqual(transcript);
    expect(
      unwrap(await getTranscriptForMediaAsset(e, { actorId: OWNER, mediaAssetId: asset.id })),
    ).toEqual(transcript);
    expect(
      unwrap(await listTranscriptsForProject(e, { actorId: OWNER, projectId: PROJECT })),
    ).toEqual([transcript]);
  });

  it("rejects unauthorized, missing, invalid, and repository-failure paths", async () => {
    const e = env();
    const asset = await media(e);
    expect((await getMediaAsset(e, { actorId: OTHER, mediaAssetId: asset.id })).ok).toBe(false);
    expect(
      (
        await getMediaAsset(e, {
          actorId: OWNER,
          mediaAssetId: MediaAssetId.unsafe("mast_99999999"),
        })
      ).ok,
    ).toBe(false);
    expect(
      (
        await createTranscriptDocument(e, {
          actorId: OWNER,
          projectId: PROJECT,
          mediaAssetId: asset.id,
          title: "Bad",
          speakers: [],
          segments: [],
        })
      ).ok,
    ).toBe(false);
    expect(await e.transcripts.findByMediaAsset(asset.id)).toBeNull();
    e.mediaAssets.fail = true;
    expect((await listMediaAssetsForProject(e, { actorId: OWNER, projectId: PROJECT })).ok).toBe(
      false,
    );
  });

  it("rejects unknown projects, unknown media, owner mismatch, and project mismatch", async () => {
    const e = env();
    expect(
      (
        await registerMediaAsset(e, {
          actorId: OWNER,
          projectId: ProjectId.unsafe("proj_99999999"),
          fileName: "missing.mp4",
          mediaType: "video/mp4",
          byteSize: 1,
          contentHash: "sha256:missing",
        })
      ).ok,
    ).toBe(false);
    expect(
      (
        await createTranscriptDocument(e, {
          actorId: OWNER,
          projectId: PROJECT,
          mediaAssetId: MediaAssetId.unsafe("mast_99999999"),
          title: "Missing",
          speakers: [],
          segments: [{ sequence: 0, text: "Text" }],
        })
      ).ok,
    ).toBe(false);

    const foreign = createMediaAsset({
      id: MediaAssetId.unsafe("mast_00000090"),
      ownerId: OTHER,
      projectId: PROJECT,
      fileName: "foreign.mp4",
      mediaType: "video/mp4",
      byteSize: 1,
      contentHash: "sha256:foreign",
      now: NOW,
    });
    if (!foreign.ok) throw foreign.error;
    e.mediaAssets.seed(foreign.value);
    expect(
      (
        await createTranscriptDocument(e, {
          actorId: OWNER,
          projectId: PROJECT,
          mediaAssetId: foreign.value.id,
          title: "Foreign",
          speakers: [],
          segments: [{ sequence: 0, text: "Text" }],
        })
      ).ok,
    ).toBe(false);

    const otherAsset = unwrap(
      await registerMediaAsset(e, {
        actorId: OWNER,
        projectId: OTHER_PROJECT,
        fileName: "other.mp4",
        mediaType: "video/mp4",
        byteSize: 1,
        contentHash: "sha256:other",
      }),
    );
    expect(
      (
        await createTranscriptDocument(e, {
          actorId: OWNER,
          projectId: PROJECT,
          mediaAssetId: otherAsset.id,
          title: "Mismatch",
          speakers: [],
          segments: [{ sequence: 0, text: "Text" }],
        })
      ).ok,
    ).toBe(false);
    expect(await e.transcripts.listByProject(PROJECT)).toEqual([]);
  });
});
