import { err, ok } from "@/lib/result";
import { InvalidValueError } from "@/domain/shared";
import type { EvidenceReferenceId, EvidenceReferenceRepository } from "@/domain/evidence";
import type { MediaAssetRepository, TranscriptDocumentRepository } from "@/domain/media-transcript";
import type { OwnerId, ProjectId, ProjectRepository } from "@/domain/project";
import { loadOwnedProject } from "@/application/media-transcript/media-transcript-access";
import { loadOwnedEvidenceReference } from "./evidence-access";
import { attempt } from "@/application/shared/attempt";
import { NotFoundError } from "@/application/shared/errors";

export interface EvidenceInspection {
  readonly id: EvidenceReferenceId;
  readonly kind: "MEDIA_ASSET" | "TRANSCRIPT_SEGMENT";
  readonly source: {
    readonly id: string;
    readonly name: string;
    readonly mediaType: string;
  };
  readonly transcript: null | {
    readonly title: string;
    readonly segmentId: string;
    readonly speaker: string | null;
    readonly text: string;
    readonly startMs: number | null;
    readonly endMs: number | null;
    readonly contextBefore: string | null;
    readonly contextAfter: string | null;
  };
  readonly limitation: string | null;
}

export async function inspectEvidenceReference(
  deps: {
    projects: ProjectRepository;
    evidenceReferences: EvidenceReferenceRepository;
    mediaAssets: MediaAssetRepository;
    transcripts: TranscriptDocumentRepository;
  },
  input: {
    actorId: OwnerId;
    projectId: ProjectId;
    evidenceReferenceId: EvidenceReferenceId;
  },
) {
  const project = await loadOwnedProject(
    deps.projects,
    input.actorId,
    input.projectId,
    "evidenceReference.inspect",
  );
  if (!project.ok) return project;
  const evidence = await loadOwnedEvidenceReference(
    deps.evidenceReferences,
    input.actorId,
    input.evidenceReferenceId,
    "evidenceReference.inspect",
  );
  if (!evidence.ok) return evidence;
  if (evidence.value.projectId !== input.projectId)
    return err(new InvalidValueError("Evidence must belong to the inspected project"));
  const media = await attempt("mediaAsset.findById", () =>
    deps.mediaAssets.findById(evidence.value.provenance.mediaAssetId),
  );
  if (!media.ok) return media;
  if (!media.value || media.value.ownerId !== input.actorId)
    return err(new NotFoundError("MediaAsset", evidence.value.provenance.mediaAssetId));

  if (evidence.value.provenance.kind === "MEDIA_ASSET") {
    return ok<EvidenceInspection>({
      id: evidence.value.id,
      kind: "MEDIA_ASSET",
      source: { id: media.value.id, name: media.value.fileName, mediaType: media.value.mediaType },
      transcript: null,
      limitation:
        "The cited sampled time is preserved in the finding. The sampled frame image is not retained after analysis yet.",
    });
  }

  const provenance = evidence.value.provenance;
  const transcript = await attempt("transcriptDocument.findById", () =>
    deps.transcripts.findById(provenance.transcriptDocumentId),
  );
  if (!transcript.ok) return transcript;
  if (!transcript.value || transcript.value.ownerId !== input.actorId)
    return err(new NotFoundError("TranscriptDocument", provenance.transcriptDocumentId));
  const index = transcript.value.segments.findIndex(
    (segment) => segment.id === provenance.transcriptSegmentId,
  );
  if (index < 0) return err(new NotFoundError("TranscriptSegment", provenance.transcriptSegmentId));
  const segment = transcript.value.segments[index]!;
  const speakers = new Map(transcript.value.speakers.map((speaker) => [speaker.id, speaker.label]));
  return ok<EvidenceInspection>({
    id: evidence.value.id,
    kind: "TRANSCRIPT_SEGMENT",
    source: { id: media.value.id, name: media.value.fileName, mediaType: media.value.mediaType },
    transcript: {
      title: transcript.value.title,
      segmentId: segment.id,
      speaker: segment.speakerId ? (speakers.get(segment.speakerId) ?? null) : null,
      text: segment.text,
      startMs: segment.startMs,
      endMs: segment.endMs,
      contextBefore: transcript.value.segments[index - 1]?.text ?? null,
      contextAfter: transcript.value.segments[index + 1]?.text ?? null,
    },
    limitation: null,
  });
}
