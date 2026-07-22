import { err, ok, type Result } from "@/lib/result";
import type { OwnerId, ProjectId } from "@/domain/project";
import { type DomainError, InvalidValueError, validateBoundedText } from "@/domain/shared";
import type { MediaAssetId } from "./ids";

export interface MediaAsset {
  readonly id: MediaAssetId;
  readonly ownerId: OwnerId;
  readonly projectId: ProjectId;
  readonly fileName: string;
  readonly mediaType: string;
  readonly byteSize: number;
  readonly contentHash: string;
  readonly createdAt: Date;
}
export interface CreateMediaAssetInput extends Omit<
  MediaAsset,
  "fileName" | "mediaType" | "contentHash" | "byteSize" | "createdAt"
> {
  readonly fileName: string;
  readonly mediaType: string;
  readonly byteSize: number;
  readonly contentHash: string;
  readonly now: Date;
}
export function createMediaAsset(input: CreateMediaAssetInput): Result<MediaAsset, DomainError> {
  const fileName = validateBoundedText(input.fileName, { label: "Media filename", max: 500 });
  if (!fileName.ok) return fileName;
  const mediaType = validateBoundedText(input.mediaType, { label: "Media type", max: 255 });
  if (!mediaType.ok) return mediaType;
  const contentHash = validateBoundedText(input.contentHash, { label: "Content hash", max: 512 });
  if (!contentHash.ok) return contentHash;
  if (!Number.isInteger(input.byteSize) || input.byteSize < 0)
    return err(new InvalidValueError("Byte size must be a non-negative integer"));
  return ok({
    id: input.id,
    ownerId: input.ownerId,
    projectId: input.projectId,
    fileName: fileName.value,
    mediaType: mediaType.value,
    byteSize: input.byteSize,
    contentHash: contentHash.value,
    createdAt: input.now,
  });
}
