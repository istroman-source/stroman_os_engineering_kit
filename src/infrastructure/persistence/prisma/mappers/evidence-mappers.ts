import type { EvidenceReference as EvidenceReferenceRow, Prisma } from "@prisma/client";
import {
  EvidenceReferenceId,
  createEvidenceReference,
  type EvidenceProvenance,
  type EvidenceReference,
} from "@/domain/evidence";
import { MediaAssetId, TranscriptDocumentId, TranscriptSegmentId } from "@/domain/media-transcript";
import { OwnerId, ProjectId } from "@/domain/project";
import { PersistenceMappingError } from "../errors";
import { orThrowMapping } from "./shared";

export function toEvidenceReference(row: EvidenceReferenceRow): EvidenceReference {
  let provenance: EvidenceProvenance;
  if (row.provenanceKind === "MEDIA_ASSET") {
    if (row.transcriptDocumentId !== null || row.transcriptSegmentId !== null)
      throw new PersistenceMappingError("evidenceReference media provenance shape");
    const frameValues = [
      row.frameIndex,
      row.frameTimestampMs,
      row.frameStorageKey,
      row.frameContentType,
      row.frameByteSize,
      row.frameContentHash,
    ];
    const hasFrame = frameValues.every((value) => value !== null);
    if (!hasFrame && frameValues.some((value) => value !== null))
      throw new PersistenceMappingError("evidenceReference frame provenance shape");
    if (
      hasFrame &&
      (row.frameIndex! < 0 ||
        row.frameTimestampMs! < 0 ||
        row.frameByteSize! <= 0 ||
        !["image/jpeg", "image/png", "image/webp"].includes(row.frameContentType!))
    )
      throw new PersistenceMappingError("evidenceReference frame provenance value");
    provenance = {
      kind: "MEDIA_ASSET",
      mediaAssetId: orThrowMapping(
        MediaAssetId.parse(row.mediaAssetId),
        "evidenceReference.mediaAssetId",
      ),
      frame: hasFrame
        ? {
            index: row.frameIndex!,
            timestampMs: row.frameTimestampMs!,
            storageKey: row.frameStorageKey!,
            contentType: row.frameContentType! as "image/jpeg" | "image/png" | "image/webp",
            byteSize: row.frameByteSize!,
            contentHash: row.frameContentHash!,
          }
        : null,
    };
  } else if (row.provenanceKind === "TRANSCRIPT_SEGMENT") {
    if (row.transcriptDocumentId === null || row.transcriptSegmentId === null)
      throw new PersistenceMappingError("evidenceReference transcript provenance shape");
    provenance = {
      kind: "TRANSCRIPT_SEGMENT",
      mediaAssetId: orThrowMapping(
        MediaAssetId.parse(row.mediaAssetId),
        "evidenceReference.mediaAssetId",
      ),
      transcriptDocumentId: orThrowMapping(
        TranscriptDocumentId.parse(row.transcriptDocumentId),
        "evidenceReference.transcriptDocumentId",
      ),
      transcriptSegmentId: orThrowMapping(
        TranscriptSegmentId.parse(row.transcriptSegmentId),
        "evidenceReference.transcriptSegmentId",
      ),
    };
  } else {
    throw new PersistenceMappingError("evidenceReference.provenanceKind");
  }
  return createEvidenceReference({
    id: orThrowMapping(EvidenceReferenceId.parse(row.id), "evidenceReference.id"),
    ownerId: orThrowMapping(OwnerId.parse(row.ownerId), "evidenceReference.ownerId"),
    projectId: orThrowMapping(ProjectId.parse(row.projectId), "evidenceReference.projectId"),
    provenance,
    now: row.createdAt,
  });
}

export function toEvidenceReferenceFields(
  value: EvidenceReference,
): Prisma.EvidenceReferenceUncheckedCreateInput {
  return {
    id: value.id,
    ownerId: value.ownerId,
    projectId: value.projectId,
    provenanceKind: value.provenance.kind,
    mediaAssetId: value.provenance.mediaAssetId,
    transcriptDocumentId:
      value.provenance.kind === "TRANSCRIPT_SEGMENT" ? value.provenance.transcriptDocumentId : null,
    transcriptSegmentId:
      value.provenance.kind === "TRANSCRIPT_SEGMENT" ? value.provenance.transcriptSegmentId : null,
    frameIndex:
      value.provenance.kind === "MEDIA_ASSET" ? (value.provenance.frame?.index ?? null) : null,
    frameTimestampMs:
      value.provenance.kind === "MEDIA_ASSET"
        ? (value.provenance.frame?.timestampMs ?? null)
        : null,
    frameStorageKey:
      value.provenance.kind === "MEDIA_ASSET" ? (value.provenance.frame?.storageKey ?? null) : null,
    frameContentType:
      value.provenance.kind === "MEDIA_ASSET"
        ? (value.provenance.frame?.contentType ?? null)
        : null,
    frameByteSize:
      value.provenance.kind === "MEDIA_ASSET" ? (value.provenance.frame?.byteSize ?? null) : null,
    frameContentHash:
      value.provenance.kind === "MEDIA_ASSET"
        ? (value.provenance.frame?.contentHash ?? null)
        : null,
    createdAt: value.createdAt,
  };
}
