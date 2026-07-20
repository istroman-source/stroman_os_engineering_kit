import { ok, type Result } from "@/lib/result";
import type { OwnerId } from "@/domain/project";
import { type DomainError, validateBoundedText } from "@/domain/shared";
import type { SourceId } from "./ids";

/** Provenance for a piece of knowledge (an interview, article, note, observation…). */
export interface Source {
  readonly id: SourceId;
  readonly ownerId: OwnerId;
  readonly label: string;
  readonly sourceType: string;
  readonly url: string | null;
  readonly detail: string | null;
  readonly createdAt: Date;
}

export interface CreateSourceInput {
  readonly id: SourceId;
  readonly ownerId: OwnerId;
  readonly label: string;
  readonly sourceType: string;
  readonly url?: string | null;
  readonly detail?: string | null;
  readonly now: Date;
}

/** Validate an optional free-text field: null when blank, else length-bounded. */
export function optionalBounded(
  raw: string | null | undefined,
  label: string,
  max: number,
): Result<string | null, DomainError> {
  if (raw === null || raw === undefined || raw.trim() === "") return ok(null);
  return validateBoundedText(raw, { label, max });
}

export function createSource(input: CreateSourceInput): Result<Source, DomainError> {
  const label = validateBoundedText(input.label, { label: "Source label", max: 200 });
  if (!label.ok) return label;
  const sourceType = validateBoundedText(input.sourceType, { label: "Source type", max: 60 });
  if (!sourceType.ok) return sourceType;
  const url = optionalBounded(input.url, "Source URL", 2000);
  if (!url.ok) return url;
  const detail = optionalBounded(input.detail, "Source detail", 5000);
  if (!detail.ok) return detail;
  return ok({
    id: input.id,
    ownerId: input.ownerId,
    label: label.value,
    sourceType: sourceType.value,
    url: url.value,
    detail: detail.value,
    createdAt: input.now,
  });
}
