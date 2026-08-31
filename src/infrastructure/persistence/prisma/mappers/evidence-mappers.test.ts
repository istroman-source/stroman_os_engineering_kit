import { describe, expect, it } from "vitest";
import type { EvidenceReference } from "@prisma/client";
import { PersistenceMappingError } from "../errors";
import { toEvidenceReference } from "./evidence-mappers";

const base: EvidenceReference = {
  id: "evref_00000001",
  ownerId: "usr_00000001",
  projectId: "proj_00000001",
  provenanceKind: "MEDIA_ASSET",
  mediaAssetId: "mast_00000001",
  transcriptDocumentId: null,
  transcriptSegmentId: null,
  frameIndex: null,
  frameTimestampMs: null,
  frameStorageKey: null,
  frameContentType: null,
  frameByteSize: null,
  frameContentHash: null,
  createdAt: new Date("2026-07-22T21:00:00Z"),
};

describe("evidence Prisma mappers", () => {
  it("reconstructs complete media provenance", () => {
    expect(toEvidenceReference(base)).toMatchObject({
      id: base.id,
      provenance: { kind: "MEDIA_ASSET", mediaAssetId: base.mediaAssetId },
    });
  });

  it("reconstructs an exact retained sampled frame", () => {
    expect(
      toEvidenceReference({
        ...base,
        frameIndex: 2,
        frameTimestampMs: 1_500,
        frameStorageKey: "owner/project/evidence-frames/frame.jpg",
        frameContentType: "image/jpeg",
        frameByteSize: 42,
        frameContentHash: "sha256:frame",
      }),
    ).toMatchObject({
      provenance: {
        kind: "MEDIA_ASSET",
        frame: { index: 2, timestampMs: 1_500, contentType: "image/jpeg", byteSize: 42 },
      },
    });
  });

  it("reconstructs complete transcript-segment provenance", () => {
    expect(
      toEvidenceReference({
        ...base,
        provenanceKind: "TRANSCRIPT_SEGMENT",
        transcriptDocumentId: "trdoc_00000001",
        transcriptSegmentId: "trseg_00000001",
      }),
    ).toMatchObject({
      provenance: {
        kind: "TRANSCRIPT_SEGMENT",
        transcriptDocumentId: "trdoc_00000001",
        transcriptSegmentId: "trseg_00000001",
      },
    });
  });

  it.each([
    { ...base, id: "bad" },
    { ...base, ownerId: "bad" },
    { ...base, projectId: "bad" },
    { ...base, mediaAssetId: "bad" },
    { ...base, transcriptDocumentId: "trdoc_00000001" },
    { ...base, frameIndex: 1 },
    {
      ...base,
      frameIndex: 1,
      frameTimestampMs: 100,
      frameStorageKey: "frame",
      frameContentType: "text/plain",
      frameByteSize: 1,
      frameContentHash: "sha256:x",
    },
    { ...base, provenanceKind: "TRANSCRIPT_SEGMENT" as const },
    {
      ...base,
      provenanceKind: "TRANSCRIPT_SEGMENT" as const,
      transcriptDocumentId: "bad",
      transcriptSegmentId: "trseg_00000001",
    },
  ])("maps corrupt persistence into PersistenceMappingError", (row) => {
    expect(() => toEvidenceReference(row)).toThrow(PersistenceMappingError);
  });
});
