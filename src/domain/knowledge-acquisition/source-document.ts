import { err, ok, type Result } from "@/lib/result";
import type { OwnerId } from "@/domain/project";
import { type DomainError, InvalidValueError, validateBoundedText } from "@/domain/shared";
import type { KnowledgeSourceId, SourceDocumentId } from "./ids";

/** The shape of a document, independent of the connector that produced it. */
export type DocumentType =
  "TRANSCRIPT" | "ARTICLE" | "WEB_PAGE" | "SOCIAL_POST" | "PDF" | "VIDEO" | "NOTE";

const DOCUMENT_TYPES: readonly DocumentType[] = [
  "TRANSCRIPT",
  "ARTICLE",
  "WEB_PAGE",
  "SOCIAL_POST",
  "PDF",
  "VIDEO",
  "NOTE",
];

/**
 * A concrete unit of content belonging to a knowledge source. Append-only and
 * immutable. Its `contentHash` provides idempotency (a source cannot register the
 * same content twice — uniqueness enforced in persistence) and provenance.
 */
export interface SourceDocument {
  readonly id: SourceDocumentId;
  readonly ownerId: OwnerId;
  readonly knowledgeSourceId: KnowledgeSourceId;
  readonly documentType: DocumentType;
  readonly contentHash: string;
  readonly title: string;
  readonly mediaType: string | null;
  readonly byteSize: number | null;
  readonly createdAt: Date;
}

export interface CreateSourceDocumentInput {
  readonly id: SourceDocumentId;
  readonly ownerId: OwnerId;
  readonly knowledgeSourceId: KnowledgeSourceId;
  readonly documentType: DocumentType;
  readonly contentHash: string;
  readonly title: string;
  readonly mediaType?: string | null;
  readonly byteSize?: number | null;
  readonly now: Date;
}

export function createSourceDocument(
  input: CreateSourceDocumentInput,
): Result<SourceDocument, DomainError> {
  if (!DOCUMENT_TYPES.includes(input.documentType)) {
    return err(new InvalidValueError(`Invalid document type: "${input.documentType}"`));
  }
  const contentHash = validateBoundedText(input.contentHash, { label: "Content hash", max: 512 });
  if (!contentHash.ok) return contentHash;
  const title = validateBoundedText(input.title, { label: "Document title", max: 300 });
  if (!title.ok) return title;

  let mediaType: string | null = null;
  if (input.mediaType != null && input.mediaType.trim() !== "") {
    const validated = validateBoundedText(input.mediaType, { label: "Media type", max: 255 });
    if (!validated.ok) return validated;
    mediaType = validated.value;
  }

  let byteSize: number | null = null;
  if (input.byteSize != null) {
    if (!Number.isInteger(input.byteSize) || input.byteSize < 0) {
      return err(new InvalidValueError("Byte size must be a non-negative integer"));
    }
    byteSize = input.byteSize;
  }

  return ok({
    id: input.id,
    ownerId: input.ownerId,
    knowledgeSourceId: input.knowledgeSourceId,
    documentType: input.documentType,
    contentHash: contentHash.value,
    title: title.value,
    mediaType,
    byteSize,
    createdAt: input.now,
  });
}
