import { describe, expect, it } from "vitest";
import type {
  MediaAsset,
  TranscriptDocument,
  TranscriptSegment,
  TranscriptSpeaker,
} from "@prisma/client";
import { PersistenceMappingError } from "../errors";
import { toMediaAsset, toTranscriptDocument } from "./media-transcript-mappers";

const createdAt = new Date("2026-07-22T00:00:00Z");
const media: MediaAsset = {
  id: "mast_00000001",
  ownerId: "usr_00000001",
  projectId: "proj_00000001",
  fileName: "a.mp4",
  mediaType: "video/mp4",
  byteSize: 10,
  contentHash: "sha256:a",
  createdAt,
};
const transcript: TranscriptDocument = {
  id: "trdoc_00000001",
  ownerId: media.ownerId,
  projectId: media.projectId,
  mediaAssetId: media.id,
  title: "Interview",
  createdAt,
};
const speaker: TranscriptSpeaker = {
  transcriptDocumentId: transcript.id,
  id: "trspk_00000001",
  label: "Guest",
};
const segment: TranscriptSegment = {
  transcriptDocumentId: transcript.id,
  id: "trseg_00000001",
  sequence: 0,
  speakerId: speaker.id,
  text: "Hello",
  startMs: 0,
  endMs: 10,
};

describe("media transcript Prisma mappers", () => {
  it("maps valid media and transcript rows", () => {
    expect(toMediaAsset(media)).toMatchObject({ id: media.id, byteSize: 10 });
    expect(
      toTranscriptDocument({ ...transcript, speakers: [speaker], segments: [segment] }),
    ).toMatchObject({
      id: transcript.id,
      speakers: [{ label: "Guest" }],
      segments: [{ sequence: 0, text: "Hello" }],
    });
  });

  it.each([
    { ...transcript, id: "bad", speakers: [speaker], segments: [segment] },
    { ...transcript, speakers: [speaker], segments: [{ ...segment, speakerId: "trspk_99999999" }] },
    { ...transcript, speakers: [speaker], segments: [{ ...segment, endMs: null }] },
  ])("turns corrupt transcript rows into PersistenceMappingError", (row) => {
    expect(() => toTranscriptDocument(row)).toThrow(PersistenceMappingError);
  });

  it("turns corrupt media rows into PersistenceMappingError", () => {
    expect(() => toMediaAsset({ ...media, byteSize: -1 })).toThrow(PersistenceMappingError);
  });
});
