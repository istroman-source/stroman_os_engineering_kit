import { describe, expect, it } from "vitest";
import { OwnerId, ProjectId } from "@/domain/project";
import {
  DuplicateTranscriptSegmentError,
  DuplicateTranscriptSequenceError,
  DuplicateTranscriptSpeakerError,
  EmptyTranscriptError,
  MediaAssetId,
  TranscriptDocumentId,
  TranscriptSegmentId,
  TranscriptSpeakerId,
  UnknownTranscriptSpeakerError,
  createMediaAsset,
  createTranscriptDocument,
} from "./index";

const NOW = new Date("2026-07-22T00:00:00Z");
const speaker = { id: TranscriptSpeakerId.unsafe("trspk_00000001"), label: "Guest" };
const segment = {
  id: TranscriptSegmentId.unsafe("trseg_00000001"),
  sequence: 0,
  speakerId: speaker.id,
  text: "Hello",
  startMs: 0,
  endMs: 100,
};
const base = {
  id: TranscriptDocumentId.unsafe("trdoc_00000001"),
  ownerId: OwnerId.unsafe("usr_00000001"),
  projectId: ProjectId.unsafe("proj_00000001"),
  mediaAssetId: MediaAssetId.unsafe("mast_00000001"),
  title: "Interview",
  speakers: [speaker],
  segments: [segment],
  now: NOW,
};

describe("media and transcript domain", () => {
  it("creates media and validates byte size", () => {
    const input = {
      id: base.mediaAssetId,
      ownerId: base.ownerId,
      projectId: base.projectId,
      fileName: "interview.mp4",
      mediaType: "video/mp4",
      byteSize: 42,
      contentHash: "sha256:abc",
      now: NOW,
    };
    expect(createMediaAsset(input)).toMatchObject({ ok: true, value: { byteSize: 42 } });
    expect(createMediaAsset({ ...input, byteSize: -1 }).ok).toBe(false);
  });

  it.each([
    ["filename", { fileName: "" }],
    ["media type", { mediaType: "" }],
    ["content hash", { contentHash: "" }],
    ["integer byte size", { byteSize: 1.5 }],
  ])("rejects an invalid media %s", (_name, change) => {
    expect(
      createMediaAsset({
        id: base.mediaAssetId,
        ownerId: base.ownerId,
        projectId: base.projectId,
        fileName: "interview.mp4",
        mediaType: "video/mp4",
        byteSize: 42,
        contentHash: "sha256:abc",
        now: NOW,
        ...change,
      }).ok,
    ).toBe(false);
  });

  it("orders segments deterministically without mutating the input", () => {
    const segments = Object.freeze([
      { ...segment, id: TranscriptSegmentId.unsafe("trseg_00000002"), sequence: 2 },
      { ...segment, sequence: 1 },
    ]);
    const result = createTranscriptDocument({ ...base, segments });
    expect(result.ok && result.value.segments.map((value) => value.sequence)).toEqual([1, 2]);
    expect(segments.map((value) => value.sequence)).toEqual([2, 1]);
  });

  it("permits absent speakers and timestamps", () => {
    const result = createTranscriptDocument({
      ...base,
      speakers: [],
      segments: [{ id: segment.id, sequence: 0, text: "Narration" }],
    });
    expect(result).toMatchObject({
      ok: true,
      value: { speakers: [], segments: [{ speakerId: null, startMs: null, endMs: null }] },
    });
  });

  it.each([
    [{ segments: [] }, EmptyTranscriptError],
    [{ speakers: [speaker, speaker] }, DuplicateTranscriptSpeakerError],
    [{ segments: [segment, segment] }, DuplicateTranscriptSegmentError],
    [
      { segments: [segment, { ...segment, id: TranscriptSegmentId.unsafe("trseg_00000002") }] },
      DuplicateTranscriptSequenceError,
    ],
    [
      { segments: [{ ...segment, speakerId: TranscriptSpeakerId.unsafe("trspk_99999999") }] },
      UnknownTranscriptSpeakerError,
    ],
  ])("rejects invalid transcript collections", (change, errorType) => {
    const result = createTranscriptDocument({ ...base, ...change });
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.error).toBeInstanceOf(errorType);
  });

  it.each([
    { ...segment, endMs: undefined },
    { ...segment, startMs: -1 },
    { ...segment, startMs: 100, endMs: 100 },
    { ...segment, sequence: -1 },
    { ...segment, text: "" },
  ])("rejects invalid segment timing or sequence", (invalid) => {
    expect(createTranscriptDocument({ ...base, segments: [invalid] }).ok).toBe(false);
  });
});
