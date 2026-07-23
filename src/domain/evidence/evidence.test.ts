import { describe, expect, it } from "vitest";
import { OwnerId, ProjectId } from "@/domain/project";
import { MediaAssetId, TranscriptDocumentId, TranscriptSegmentId } from "@/domain/media-transcript";
import { EvidenceReferenceId, createEvidenceReference } from "./index";

const base = {
  id: EvidenceReferenceId.unsafe("evref_00000001"),
  ownerId: OwnerId.unsafe("usr_00000001"),
  projectId: ProjectId.unsafe("proj_00000001"),
  now: new Date("2026-07-22T20:00:00Z"),
};

describe("EvidenceReference", () => {
  it("creates immutable media-asset provenance", () => {
    const provenance = Object.freeze({
      kind: "MEDIA_ASSET" as const,
      mediaAssetId: MediaAssetId.unsafe("mast_00000001"),
    });
    const evidence = createEvidenceReference({ ...base, provenance });
    expect(evidence).toEqual({
      id: base.id,
      ownerId: base.ownerId,
      projectId: base.projectId,
      createdAt: base.now,
      provenance,
    });
    expect(evidence.provenance).not.toBe(provenance);
  });

  it("creates durable transcript-segment provenance", () => {
    const evidence = createEvidenceReference({
      ...base,
      provenance: {
        kind: "TRANSCRIPT_SEGMENT",
        mediaAssetId: MediaAssetId.unsafe("mast_00000001"),
        transcriptDocumentId: TranscriptDocumentId.unsafe("trdoc_00000001"),
        transcriptSegmentId: TranscriptSegmentId.unsafe("trseg_00000001"),
      },
    });
    expect(evidence.provenance).toMatchObject({
      kind: "TRANSCRIPT_SEGMENT",
      transcriptSegmentId: "trseg_00000001",
    });
  });
});
