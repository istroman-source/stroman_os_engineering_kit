import { createHash } from "node:crypto";
import { AppError, ConflictError, NotFoundError, ValidationError } from "@/lib/errors";
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

interface SourceImportDependencies {
  projects: ProjectRepository;
  imports: SourceImportRepository;
  storage: SourceStorage;
  ids: IdGenerator;
  clock: Clock;
}

function srtTimestamp(value: string): number {
  const match = value.trim().match(/^(\d{1,2}):(\d{2}):(\d{2})[,.](\d{3})$/);
  if (!match) throw new TranscriptParseError(`Invalid transcript timestamp: ${value}`);
  return (
    (Number(match[1]) * 60 * 60 + Number(match[2]) * 60 + Number(match[3])) * 1000 +
    Number(match[4])
  );
}

function parseSrt(text: string): ParsedTranscript {
  const normalized = text
    .replace(/\r\n?/g, "\n")
    .replace(/^\uFEFF/, "")
    .trim();
  const blocks = normalized.split(/\n{2,}/).filter(Boolean);
  const segments = blocks.map((block, sequence) => {
    const lines = block.split("\n");
    if (/^\d+$/.test(lines[0]?.trim() ?? "")) lines.shift();
    const timing = lines
      .shift()
      ?.match(/^(\d{1,2}:\d{2}:\d{2}[,.]\d{3})\s+-->\s+(\d{1,2}:\d{2}:\d{2}[,.]\d{3})/);
    if (!timing || lines.length === 0)
      throw new TranscriptParseError(`Invalid SRT cue ${sequence + 1}`);
    const cueText = lines
      .join("\n")
      .replace(/<[^>]+>/g, "")
      .trim();
    if (!cueText) throw new TranscriptParseError(`Empty transcript cue ${sequence + 1}`);
    return {
      sequence,
      speakerIndex: null,
      text: cueText,
      startMs: srtTimestamp(timing[1]!),
      endMs: srtTimestamp(timing[2]!),
    };
  });
  if (segments.length === 0) throw new TranscriptParseError("Transcript contains no segments");
  return { speakers: [], segments };
}

function webVttTimestamp(value: string): number {
  const match = value.trim().match(/^(?:(\d+):)?(\d{2}):(\d{2})\.(\d{3})$/);
  if (!match) throw new TranscriptParseError(`Invalid transcript timestamp: ${value}`);
  const hours = match[1] ? Number(match[1]) : 0;
  const minutes = Number(match[2]);
  const seconds = Number(match[3]);
  if (minutes > 59 || seconds > 59)
    throw new TranscriptParseError(`Invalid transcript timestamp: ${value}`);
  return (hours * 3600 + minutes * 60 + seconds) * 1000 + Number(match[4]);
}

function parseWebVtt(text: string): ParsedTranscript {
  const normalized = text.replace(/\r\n?/g, "\n").replace(/^\uFEFF/, "");
  const headerEnd = normalized.indexOf("\n\n");
  const header = (headerEnd < 0 ? normalized : normalized.slice(0, headerEnd)).split("\n");
  if (!/^WEBVTT(?:[ \t].*)?$/.test(header[0] ?? ""))
    throw new TranscriptParseError("WebVTT header is required");
  if (headerEnd < 0) throw new TranscriptParseError("WebVTT contains no cues");
  const blocks = normalized
    .slice(headerEnd + 2)
    .split(/\n{2,}/)
    .map((block) => block.trim())
    .filter(Boolean);
  const segments: ParsedTranscript["segments"][number][] = [];
  for (const block of blocks) {
    const lines = block.split("\n");
    const first = lines[0]?.trim() ?? "";
    if (first === "STYLE" || first === "REGION" || first.startsWith("NOTE")) continue;
    let timingLine = lines.shift() ?? "";
    if (!timingLine.includes("-->")) timingLine = lines.shift() ?? "";
    const timing = timingLine.match(
      /^((?:(?:\d+):)?\d{2}:\d{2}\.\d{3})\s+-->\s+((?:(?:\d+):)?\d{2}:\d{2}\.\d{3})(?:\s+.*)?$/,
    );
    if (!timing || lines.length === 0)
      throw new TranscriptParseError(`Invalid WebVTT cue ${segments.length + 1}`);
    const cueText = lines
      .join("\n")
      .replace(/<[^>]+>/g, "")
      .trim();
    if (!cueText) throw new TranscriptParseError(`Empty transcript cue ${segments.length + 1}`);
    segments.push({
      sequence: segments.length,
      speakerIndex: null,
      text: cueText,
      startMs: webVttTimestamp(timing[1]!),
      endMs: webVttTimestamp(timing[2]!),
    });
  }
  if (segments.length === 0) throw new TranscriptParseError("Transcript contains no segments");
  return { speakers: [], segments };
}

export function parseTranscript(text: string, format: TranscriptFormat): ParsedTranscript {
  if (format === "srt") return parseSrt(text);
  if (format === "vtt") return parseWebVtt(text);
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
  deps: SourceImportDependencies,
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
  const storageKey = `${input.actorId}/${input.projectId}/${input.contentHash}`;
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
  let lease: { readonly leaseId: string };
  try {
    lease = await deps.storage.put(storageKey, input.bytes);
  } catch (error) {
    return err(
      error instanceof AppError
        ? error
        : new AppError("UNAVAILABLE", "Import could not be stored", { cause: error }),
    );
  }
  try {
    await deps.imports.start(receipt);
    await deps.storage.retain(storageKey, lease.leaseId);
  } catch (error) {
    if (error instanceof ConflictError) {
      const original = await deps.imports.findByKey(input.projectId, input.idempotencyKey);
      if (original) {
        await deps.storage.retain(storageKey, lease.leaseId);
        return ok(original);
      }
    }
    await deps.storage.discard(storageKey, lease.leaseId).catch(() => undefined);
    return err(
      error instanceof AppError
        ? error
        : new AppError("UNAVAILABLE", "Import could not be started", { cause: error }),
    );
  }
  return processStoredSource(deps, receipt, input.bytes);
}

export async function retryProjectSource(
  deps: SourceImportDependencies,
  input: { actorId: OwnerId; projectId: ProjectId; sourceImportId: string },
): Promise<Result<SourceImportReceipt, AppError>> {
  const project = await loadOwnedProject(
    deps.projects,
    input.actorId,
    input.projectId,
    "sourceImport.retry",
  );
  if (!project.ok) return project;
  const current = await deps.imports.findById(input.sourceImportId);
  if (!current || current.projectId !== input.projectId)
    return err(new NotFoundError("Source import not found."));
  if (current.status === "COMPLETED" || current.status === "PROCESSING") return ok(current);
  if (current.status !== "RETRYABLE_FAILURE")
    return err(new ConflictError("This source needs replacement rather than retry."));
  const now = deps.clock.now();
  const claimed = await deps.imports.claimRetry(current.id, current.projectId, now);
  if (!claimed) {
    const latest = await deps.imports.findById(current.id);
    return latest
      ? ok(latest)
      : err(new ConflictError("The source changed before retry could begin."));
  }
  let bytes: Uint8Array;
  try {
    bytes = await deps.storage.get(claimed.storageKey);
  } catch (error) {
    await recordFailure(deps, claimed, "RETRYABLE_FAILURE", "SOURCE_STORAGE_UNAVAILABLE");
    return err(
      new AppError("UNAVAILABLE", "The preserved source is temporarily unavailable.", {
        cause: error,
      }),
    );
  }
  const digest = `sha256:${createHash("sha256").update(bytes).digest("hex")}`;
  if (bytes.byteLength !== claimed.byteSize || digest !== claimed.contentHash) {
    await recordFailure(deps, claimed, "TERMINAL_FAILURE", "SOURCE_INTEGRITY_MISMATCH");
    return err(new SourceIntegrityError());
  }
  return processStoredSource(deps, { ...claimed, updatedAt: now }, bytes);
}

async function processStoredSource(
  deps: SourceImportDependencies,
  receipt: SourceImportReceipt,
  bytes: Uint8Array,
): Promise<Result<SourceImportReceipt, AppError>> {
  const mediaId = MediaAssetId.unsafe(deps.ids.generate(MediaAssetId.prefix));
  const media = createMediaAsset({
    id: mediaId,
    ownerId: receipt.ownerId,
    projectId: receipt.projectId,
    fileName: receipt.sourceName,
    mediaType: receipt.contentType,
    byteSize: receipt.byteSize,
    contentHash: receipt.contentHash,
    now: receipt.updatedAt,
  });
  if (!media.ok) {
    await recordFailure(deps, receipt, "TERMINAL_FAILURE", "INVALID_MEDIA_METADATA");
    return media;
  }

  let transcript: TranscriptDocument | null = null;
  if (receipt.transcriptFormat) {
    let parsed: ParsedTranscript;
    try {
      parsed = parseTranscript(new TextDecoder().decode(bytes), receipt.transcriptFormat);
    } catch (error) {
      await recordFailure(deps, receipt, "TERMINAL_FAILURE", "TRANSCRIPT_PARSE_FAILED");
      return err(
        error instanceof AppError ? error : new TranscriptParseError("Transcript parsing failed"),
      );
    }
    const speakerIds = parsed.speakers.map(() =>
      TranscriptSpeakerId.unsafe(deps.ids.generate(TranscriptSpeakerId.prefix)),
    );
    const made = createTranscriptDocument({
      id: TranscriptDocumentId.unsafe(deps.ids.generate(TranscriptDocumentId.prefix)),
      ownerId: receipt.ownerId,
      projectId: receipt.projectId,
      mediaAssetId: mediaId,
      title: receipt.sourceName,
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
      now: receipt.updatedAt,
    });
    if (!made.ok) {
      await recordFailure(deps, receipt, "TERMINAL_FAILURE", "INVALID_TRANSCRIPT_METADATA");
      return made;
    }
    transcript = made.value;
  }

  try {
    return ok(await deps.imports.completeAtomically({ receipt, media: media.value, transcript }));
  } catch (error) {
    await recordFailure(deps, receipt, "RETRYABLE_FAILURE", "PERSISTENCE_UNAVAILABLE");
    return err(
      error instanceof AppError
        ? error
        : new AppError(
            "UNAVAILABLE",
            "Import could not be completed. Your source was preserved for retry.",
            {
              cause: error,
            },
          ),
    );
  }
}

async function recordFailure(
  deps: SourceImportDependencies,
  receipt: SourceImportReceipt,
  status: "RETRYABLE_FAILURE" | "TERMINAL_FAILURE",
  failureCode: string,
): Promise<void> {
  await deps.imports.markFailure({
    id: receipt.id,
    projectId: receipt.projectId,
    status,
    failureCode,
    now: deps.clock.now(),
  });
}
