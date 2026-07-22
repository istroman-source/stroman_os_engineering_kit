import { err, ok, type Result } from "@/lib/result";
import type { OwnerId, ProjectId } from "@/domain/project";
import { type DomainError, InvalidValueError, validateBoundedText } from "@/domain/shared";
import type {
  MediaAssetId,
  TranscriptDocumentId,
  TranscriptSegmentId,
  TranscriptSpeakerId,
} from "./ids";
import {
  DuplicateTranscriptSegmentError,
  DuplicateTranscriptSequenceError,
  DuplicateTranscriptSpeakerError,
  EmptyTranscriptError,
  UnknownTranscriptSpeakerError,
} from "./media-transcript-errors";

export interface TranscriptSpeaker {
  readonly id: TranscriptSpeakerId;
  readonly label: string;
}
export interface TranscriptSegment {
  readonly id: TranscriptSegmentId;
  readonly sequence: number;
  readonly speakerId: TranscriptSpeakerId | null;
  readonly text: string;
  readonly startMs: number | null;
  readonly endMs: number | null;
}
export interface TranscriptDocument {
  readonly id: TranscriptDocumentId;
  readonly ownerId: OwnerId;
  readonly projectId: ProjectId;
  readonly mediaAssetId: MediaAssetId;
  readonly title: string;
  readonly speakers: readonly TranscriptSpeaker[];
  readonly segments: readonly TranscriptSegment[];
  readonly createdAt: Date;
}
export interface TranscriptSpeakerInput {
  readonly id: TranscriptSpeakerId;
  readonly label: string;
}
export interface TranscriptSegmentInput {
  readonly id: TranscriptSegmentId;
  readonly sequence: number;
  readonly speakerId?: TranscriptSpeakerId | null;
  readonly text: string;
  readonly startMs?: number | null;
  readonly endMs?: number | null;
}
export interface CreateTranscriptDocumentInput {
  readonly id: TranscriptDocumentId;
  readonly ownerId: OwnerId;
  readonly projectId: ProjectId;
  readonly mediaAssetId: MediaAssetId;
  readonly title: string;
  readonly speakers: readonly TranscriptSpeakerInput[];
  readonly segments: readonly TranscriptSegmentInput[];
  readonly now: Date;
}

export function createTranscriptDocument(
  input: CreateTranscriptDocumentInput,
): Result<TranscriptDocument, DomainError> {
  const title = validateBoundedText(input.title, { label: "Transcript title", max: 300 });
  if (!title.ok) return title;
  if (input.segments.length === 0) return err(new EmptyTranscriptError());
  const speakerIds = new Set<string>();
  const speakers: TranscriptSpeaker[] = [];
  for (const value of input.speakers) {
    if (speakerIds.has(value.id)) return err(new DuplicateTranscriptSpeakerError());
    speakerIds.add(value.id);
    const label = validateBoundedText(value.label, { label: "Speaker label", max: 200 });
    if (!label.ok) return label;
    speakers.push({ id: value.id, label: label.value });
  }
  const segmentIds = new Set<string>();
  const sequences = new Set<number>();
  const segments: TranscriptSegment[] = [];
  for (const value of input.segments) {
    if (segmentIds.has(value.id)) return err(new DuplicateTranscriptSegmentError());
    segmentIds.add(value.id);
    if (!Number.isInteger(value.sequence) || value.sequence < 0)
      return err(new InvalidValueError("Segment sequence must be a non-negative integer"));
    if (sequences.has(value.sequence)) return err(new DuplicateTranscriptSequenceError());
    sequences.add(value.sequence);
    const speakerId = value.speakerId ?? null;
    if (speakerId !== null && !speakerIds.has(speakerId))
      return err(new UnknownTranscriptSpeakerError());
    const text = validateBoundedText(value.text, { label: "Transcript segment text", max: 10000 });
    if (!text.ok) return text;
    const startMs = value.startMs ?? null;
    const endMs = value.endMs ?? null;
    if ((startMs === null) !== (endMs === null))
      return err(
        new InvalidValueError("Segment timestamps must both be absent or both be present"),
      );
    if (
      startMs !== null &&
      (!Number.isInteger(startMs) || !Number.isInteger(endMs) || startMs < 0 || endMs! < 0)
    )
      return err(new InvalidValueError("Segment timestamps must be non-negative integers"));
    if (startMs !== null && endMs! <= startMs)
      return err(
        new InvalidValueError("Segment end timestamp must be greater than start timestamp"),
      );
    segments.push({
      id: value.id,
      sequence: value.sequence,
      speakerId,
      text: text.value,
      startMs,
      endMs,
    });
  }
  speakers.sort((a, b) => a.id.localeCompare(b.id));
  segments.sort((a, b) => a.sequence - b.sequence || a.id.localeCompare(b.id));
  return ok({
    id: input.id,
    ownerId: input.ownerId,
    projectId: input.projectId,
    mediaAssetId: input.mediaAssetId,
    title: title.value,
    speakers,
    segments,
    createdAt: input.now,
  });
}
