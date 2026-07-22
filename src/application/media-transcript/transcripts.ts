import { err, ok } from "@/lib/result";
import { InvalidValueError } from "@/domain/shared";
import {
  TranscriptDocumentId,
  TranscriptSegmentId,
  TranscriptSpeakerId,
  createTranscriptDocument,
  type MediaAssetId,
  type MediaAssetRepository,
  type TranscriptDocumentRepository,
} from "@/domain/media-transcript";
import type { OwnerId, ProjectId, ProjectRepository } from "@/domain/project";
import type { Clock, IdGenerator } from "../shared";
import { attempt } from "../shared/attempt";
import {
  loadOwnedMediaAsset,
  loadOwnedProject,
  loadOwnedTranscript,
} from "./media-transcript-access";
import { toTranscriptDocumentView } from "./media-transcript-view";
export interface NormalizedSpeakerInput {
  readonly label: string;
}
export interface NormalizedSegmentInput {
  readonly sequence: number;
  readonly speakerIndex?: number | null;
  readonly text: string;
  readonly startMs?: number | null;
  readonly endMs?: number | null;
}
export async function createTranscriptDocumentService(
  deps: {
    projects: ProjectRepository;
    mediaAssets: MediaAssetRepository;
    transcripts: TranscriptDocumentRepository;
    ids: IdGenerator;
    clock: Clock;
  },
  input: {
    actorId: OwnerId;
    projectId: ProjectId;
    mediaAssetId: MediaAssetId;
    title: string;
    speakers: readonly NormalizedSpeakerInput[];
    segments: readonly NormalizedSegmentInput[];
  },
) {
  const p = await loadOwnedProject(
    deps.projects,
    input.actorId,
    input.projectId,
    "transcriptDocument.create",
  );
  if (!p.ok) return p;
  const a = await loadOwnedMediaAsset(
    deps.mediaAssets,
    input.actorId,
    input.mediaAssetId,
    "transcriptDocument.create",
  );
  if (!a.ok) return a;
  if (a.value.projectId !== input.projectId)
    return err(new InvalidValueError("Media asset must belong to the transcript project"));
  const speakerIds = input.speakers.map(() =>
    TranscriptSpeakerId.unsafe(deps.ids.generate(TranscriptSpeakerId.prefix)),
  );
  const made = createTranscriptDocument({
    id: TranscriptDocumentId.unsafe(deps.ids.generate(TranscriptDocumentId.prefix)),
    ownerId: input.actorId,
    projectId: input.projectId,
    mediaAssetId: input.mediaAssetId,
    title: input.title,
    speakers: input.speakers.map((s, i) => ({ id: speakerIds[i]!, label: s.label })),
    segments: input.segments.map((s) => ({
      id: TranscriptSegmentId.unsafe(deps.ids.generate(TranscriptSegmentId.prefix)),
      sequence: s.sequence,
      speakerId:
        s.speakerIndex == null
          ? null
          : (speakerIds[s.speakerIndex] ?? TranscriptSpeakerId.unsafe("trspk_invalid")),
      text: s.text,
      startMs: s.startMs,
      endMs: s.endMs,
    })),
    now: deps.clock.now(),
  });
  if (!made.ok) return made;
  const saved = await attempt("transcriptDocument.insert", () =>
    deps.transcripts.insert(made.value),
  );
  return saved.ok ? ok(toTranscriptDocumentView(made.value)) : saved;
}
export { createTranscriptDocumentService as createTranscriptDocument };
export async function getTranscriptDocument(
  deps: { transcripts: TranscriptDocumentRepository },
  input: { actorId: OwnerId; transcriptDocumentId: TranscriptDocumentId },
) {
  const t = await loadOwnedTranscript(
    deps.transcripts,
    input.actorId,
    input.transcriptDocumentId,
    "transcriptDocument.read",
  );
  return t.ok ? ok(toTranscriptDocumentView(t.value)) : t;
}
export async function listTranscriptsForProject(
  deps: { projects: ProjectRepository; transcripts: TranscriptDocumentRepository },
  input: { actorId: OwnerId; projectId: ProjectId },
) {
  const p = await loadOwnedProject(
    deps.projects,
    input.actorId,
    input.projectId,
    "transcriptDocument.list",
  );
  if (!p.ok) return p;
  const r = await attempt("transcriptDocument.listByProject", () =>
    deps.transcripts.listByProject(input.projectId),
  );
  return r.ok ? ok(r.value.map(toTranscriptDocumentView)) : r;
}
export async function getTranscriptForMediaAsset(
  deps: { mediaAssets: MediaAssetRepository; transcripts: TranscriptDocumentRepository },
  input: { actorId: OwnerId; mediaAssetId: MediaAssetId },
) {
  const a = await loadOwnedMediaAsset(
    deps.mediaAssets,
    input.actorId,
    input.mediaAssetId,
    "transcriptDocument.readByMediaAsset",
  );
  if (!a.ok) return a;
  const r = await attempt("transcriptDocument.findByMediaAsset", () =>
    deps.transcripts.findByMediaAsset(input.mediaAssetId),
  );
  return r.ok ? ok(r.value ? toTranscriptDocumentView(r.value) : null) : r;
}
