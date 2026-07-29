import { AppError, ValidationError } from "@/lib/errors";
import { err, ok, type Result } from "@/lib/result";
import {
  MediaAssetId,
  TranscriptDocumentId,
  TranscriptSegmentId,
  TranscriptSpeakerId,
  createMediaAsset,
  createTranscriptDocument,
  type TranscriptDocument,
} from "@/domain/media-transcript";
import type { OwnerId, ProjectId, ProjectRepository } from "@/domain/project";
import type {
  SourceImportReceipt,
  SourceImportRepository,
  SourceStorage,
  TranscriptFormat,
} from "@/domain/source-import";
import type { Clock, IdGenerator } from "@/application/shared";
import { loadOwnedProject } from "@/application/media-transcript/media-transcript-access";

export class TranscriptParseError extends AppError {
  constructor(message: string) {
    super("VALIDATION", message, { context: { failureType: "TERMINAL" } });
  }
}

export class SourceIntegrityError extends AppError {
  constructor() {
    super("VALIDATION", "Source size or digest did not match the uploaded bytes", {
      context: { failureType: "TERMINAL" },
    });
  }
}

export interface ParsedTranscript {
  readonly speakers: readonly { label: string }[];
  readonly segments: readonly {
    sequence: number;
    speakerIndex: number | null;
    text: string;
    startMs: number | null;
    endMs: number | null;
  }[];
}

function timestamp(value: string): number {
  const match = value.trim().match(/^(\d{1,2}):(\d{2}):(\d{2})[,.](\d{3})$/);
  if (!match) throw new TranscriptParseError(`Invalid transcript timestamp: ${value}`);
  return (
    (Number(match[1]) * 60 * 60 + Number(match[2]) * 60 + Number(match[3])) * 1000 +
    Number(match[4])
  );
}

function timed(text: string, format: "srt" | "vtt"): ParsedTranscript {
  const normalized = text
    .replace(/\r\n?/g, "\n")
    .replace(/^\uFEFF/, "")
    .trim();
  const body = format === "vtt" ? normalized.replace(/^WEBVTT[^\n]*\n+/, "") : normalized;
  const blocks = body.split(/\n{2,}/).filter(Boolean);
  const segments = blocks.map((block, sequence) => {
    const lines = block.split("\n");
    if (format === "srt" && /^\d+$/.test(lines[0]?.trim() ?? "")) lines.shift();
    const timing = lines
      .shift()
      ?.match(/^(\d{1,2}:\d{2}:\d{2}[,.]\d{3})\s+-->\s+(\d{1,2}:\d{2}:\d{2}[,.]\d{3})/);
    if (!timing || lines.length === 0)
      throw new TranscriptParseError(`Invalid ${format.toUpperCase()} cue ${sequence + 1}`);
    const cueText = lines
      .join("\n")
      .replace(/<[^>]+>/g, "")
      .trim();
    if (!cueText) throw new TranscriptParseError(`Empty transcript cue ${sequence + 1}`);
    return {
      sequence,
      speakerIndex: null,
      text: cueText,
      startMs: timestamp(timing[1]!),
      endMs: timestamp(timing[2]!),
    };
  });
  if (segments.length === 0) throw new TranscriptParseError("Transcript contains no segments");
  return { speakers: [], segments };
}

export function parseTranscript(text: string, format: TranscriptFormat): ParsedTranscript {
  if (format === "srt" || format === "vtt") return timed(text, format);
  if (format === "text") {
    const segments = text
      .replace(/\r\n?/g, "\n")
      .split(/\n{2,}/)
      .map((value) => value.trim())
      .filter(Boolean)
      .map((value, sequence) => ({
        sequence,
        speakerIndex: null,
        text: value,
        startMs: null,
        endMs: null,
      }));
    if (segments.length === 0) throw new TranscriptParseError("Transcript contains no text");
    return { speakers: [], segments };
  }
  let value: unknown;
  try {
    value = JSON.parse(text);
  } catch {
    throw new TranscriptParseError("Transcript JSON is malformed");
  }
  const rows = Array.isArray(value)
    ? value
    : value &&
        typeof value === "object" &&
        Array.isArray((value as { segments?: unknown }).segments)
      ? (value as { segments: unknown[] }).segments
      : null;
  if (!rows?.length) throw new TranscriptParseError("Transcript JSON contains no segments");
  const labels: string[] = [];
  const segments = rows.map((raw, sequence) => {
    if (!raw || typeof raw !== "object") throw new TranscriptParseError("Invalid JSON segment");
    const row = raw as Record<string, unknown>;
    if (typeof row.text !== "string" || row.text.trim() === "")
      throw new TranscriptParseError("JSON segment text is required");
    const label = typeof row.speaker === "string" && row.speaker.trim() ? row.speaker.trim() : null;
    let speakerIndex: number | null = null;
    if (label) {
      speakerIndex = labels.indexOf(label);
      if (speakerIndex < 0) speakerIndex = labels.push(label) - 1;
    }
    const startMs = row.startMs == null ? null : Number(row.startMs);
    const endMs = row.endMs == null ? null : Number(row.endMs);
    if (
      (startMs === null) !== (endMs === null) ||
      (startMs !== null &&
        (!Number.isInteger(startMs) || !Number.isInteger(endMs) || endMs! <= startMs))
    )
      throw new TranscriptParseError("JSON segment timestamps are invalid");
    return { sequence, speakerIndex, text: row.text.trim(), startMs, endMs };
  });
  return { speakers: labels.map((label) => ({ label })), segments };
}

export async function importProjectSource(
  deps: {
    projects: ProjectRepository;
    imports: SourceImportRepository;
    storage: SourceStorage;
    ids: IdGenerator;
    clock: Clock;
  },
  input: {
    actorId: OwnerId;
    projectId: ProjectId;
    idempotencyKey: string;
    sourceName: string;
    contentType: string;
    bytes: Uint8Array;
    contentHash: string;
    transcriptFormat?: TranscriptFormat;
  },
): Promise<Result<SourceImportReceipt, AppError>> {
  const project = await loadOwnedProject(
    deps.projects,
    input.actorId,
    input.projectId,
    "sourceImport.create",
  );
  if (!project.ok) return project;
  if (!input.idempotencyKey.trim() || input.idempotencyKey.length > 200)
    return err(new ValidationError("A valid idempotency key is required"));
  const existing = await deps.imports.findByKey(input.projectId, input.idempotencyKey);
  if (existing) return ok(existing);

  const now = deps.clock.now();
  const mediaId = MediaAssetId.unsafe(deps.ids.generate(MediaAssetId.prefix));
  const storageKey = `${input.actorId}/${input.projectId}/${input.contentHash}`;
  const media = createMediaAsset({
    id: mediaId,
    ownerId: input.actorId,
    projectId: input.projectId,
    fileName: input.sourceName,
    mediaType: input.contentType,
    byteSize: input.bytes.byteLength,
    contentHash: input.contentHash,
    now,
  });
  if (!media.ok) return media;

  let transcript: TranscriptDocument | null = null;
  if (input.transcriptFormat) {
    let parsed: ParsedTranscript;
    try {
      parsed = parseTranscript(new TextDecoder().decode(input.bytes), input.transcriptFormat);
    } catch (error) {
      return err(
        error instanceof AppError ? error : new TranscriptParseError("Transcript parsing failed"),
      );
    }
    const speakerIds = parsed.speakers.map(() =>
      TranscriptSpeakerId.unsafe(deps.ids.generate(TranscriptSpeakerId.prefix)),
    );
    const made = createTranscriptDocument({
      id: TranscriptDocumentId.unsafe(deps.ids.generate(TranscriptDocumentId.prefix)),
      ownerId: input.actorId,
      projectId: input.projectId,
      mediaAssetId: mediaId,
      title: input.sourceName,
      speakers: parsed.speakers.map((speaker, index) => ({
        id: speakerIds[index]!,
        label: speaker.label,
      })),
      segments: parsed.segments.map((segment) => ({
        id: TranscriptSegmentId.unsafe(deps.ids.generate(TranscriptSegmentId.prefix)),
        sequence: segment.sequence,
        speakerId:
          segment.speakerIndex === null ? null : (speakerIds[segment.speakerIndex] ?? null),
        text: segment.text,
        startMs: segment.startMs,
        endMs: segment.endMs,
      })),
      now,
    });
    if (!made.ok) return made;
    transcript = made.value;
  }
  const receipt: SourceImportReceipt = {
    id: deps.ids.generate("simp"),
    ownerId: input.actorId,
    projectId: input.projectId,
    idempotencyKey: input.idempotencyKey,
    status: "PROCESSING",
    sourceName: input.sourceName,
    sourceKind: input.transcriptFormat ? "TRANSCRIPT" : "MEDIA",
    contentType: input.contentType,
    byteSize: input.bytes.byteLength,
    contentHash: input.contentHash,
    storageKey,
    transcriptFormat: input.transcriptFormat ?? null,
    failureCode: null,
    mediaAssetId: null,
    transcriptDocumentId: null,
    createdAt: now,
    updatedAt: now,
  };
  try {
    await deps.storage.put(storageKey, input.bytes);
    return ok(await deps.imports.completeAtomically({ receipt, media: media.value, transcript }));
  } catch (error) {
    await deps.storage.remove(storageKey).catch(() => undefined);
    return err(
      error instanceof AppError
        ? error
        : new AppError("UNAVAILABLE", "Import could not be completed", { cause: error }),
    );
  }
}
