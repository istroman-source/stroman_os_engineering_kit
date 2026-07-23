import { err, ok } from "@/lib/result";
import { InvalidValueError } from "@/domain/shared";
import type { OwnerId, ProjectId, ProjectRepository } from "@/domain/project";
import {
  EvidenceReferenceId,
  createEvidenceReference as createEvidenceReferenceAggregate,
  type EvidenceReferenceRepository,
} from "@/domain/evidence";
import type {
  MediaAssetId,
  MediaAssetRepository,
  TranscriptDocumentId,
  TranscriptDocumentRepository,
  TranscriptSegmentId,
} from "@/domain/media-transcript";
import type { Clock, IdGenerator } from "../shared";
import { attempt } from "../shared/attempt";
import {
  loadOwnedMediaAsset,
  loadOwnedProject,
  loadOwnedTranscript,
} from "../media-transcript/media-transcript-access";
import { loadOwnedEvidenceReference } from "./evidence-access";
import { toEvidenceReferenceView } from "./evidence-view";

export type EvidenceSourceInput =
  | { readonly kind: "MEDIA_ASSET"; readonly mediaAssetId: MediaAssetId }
  | {
      readonly kind: "TRANSCRIPT_SEGMENT";
      readonly transcriptDocumentId: TranscriptDocumentId;
      readonly transcriptSegmentId: TranscriptSegmentId;
    };

export async function createEvidenceReference(
  deps: {
    projects: ProjectRepository;
    mediaAssets: MediaAssetRepository;
    transcripts: TranscriptDocumentRepository;
    evidenceReferences: EvidenceReferenceRepository;
    ids: IdGenerator;
    clock: Clock;
  },
  input: {
    actorId: OwnerId;
    projectId: ProjectId;
    source: EvidenceSourceInput;
  },
) {
  const project = await loadOwnedProject(
    deps.projects,
    input.actorId,
    input.projectId,
    "evidenceReference.create",
  );
  if (!project.ok) return project;

  let provenance;
  if (input.source.kind === "MEDIA_ASSET") {
    const media = await loadOwnedMediaAsset(
      deps.mediaAssets,
      input.actorId,
      input.source.mediaAssetId,
      "evidenceReference.create",
    );
    if (!media.ok) return media;
    if (media.value.projectId !== input.projectId)
      return err(new InvalidValueError("Evidence media must belong to the evidence project"));
    provenance = { kind: "MEDIA_ASSET" as const, mediaAssetId: media.value.id };
  } else {
    const source = input.source;
    const transcript = await loadOwnedTranscript(
      deps.transcripts,
      input.actorId,
      source.transcriptDocumentId,
      "evidenceReference.create",
    );
    if (!transcript.ok) return transcript;
    if (transcript.value.projectId !== input.projectId)
      return err(new InvalidValueError("Evidence transcript must belong to the evidence project"));
    if (!transcript.value.segments.some((segment) => segment.id === source.transcriptSegmentId))
      return err(new InvalidValueError("Evidence transcript segment does not exist"));
    provenance = {
      kind: "TRANSCRIPT_SEGMENT" as const,
      mediaAssetId: transcript.value.mediaAssetId,
      transcriptDocumentId: transcript.value.id,
      transcriptSegmentId: source.transcriptSegmentId,
    };
  }

  const evidence = createEvidenceReferenceAggregate({
    id: EvidenceReferenceId.unsafe(deps.ids.generate(EvidenceReferenceId.prefix)),
    ownerId: input.actorId,
    projectId: input.projectId,
    provenance,
    now: deps.clock.now(),
  });
  const saved = await attempt("evidenceReference.insert", () =>
    deps.evidenceReferences.insert(evidence),
  );
  return saved.ok ? ok(toEvidenceReferenceView(evidence)) : saved;
}

export async function getEvidenceReference(
  deps: { evidenceReferences: EvidenceReferenceRepository },
  input: { actorId: OwnerId; evidenceReferenceId: EvidenceReferenceId },
) {
  const evidence = await loadOwnedEvidenceReference(
    deps.evidenceReferences,
    input.actorId,
    input.evidenceReferenceId,
    "evidenceReference.read",
  );
  return evidence.ok ? ok(toEvidenceReferenceView(evidence.value)) : evidence;
}

export async function listEvidenceForProject(
  deps: { projects: ProjectRepository; evidenceReferences: EvidenceReferenceRepository },
  input: { actorId: OwnerId; projectId: ProjectId },
) {
  const project = await loadOwnedProject(
    deps.projects,
    input.actorId,
    input.projectId,
    "evidenceReference.list",
  );
  if (!project.ok) return project;
  const evidence = await attempt("evidenceReference.listByProject", () =>
    deps.evidenceReferences.listByProject(input.projectId),
  );
  return evidence.ok ? ok(evidence.value.map(toEvidenceReferenceView)) : evidence;
}

export async function listEvidenceForMediaAsset(
  deps: {
    mediaAssets: MediaAssetRepository;
    evidenceReferences: EvidenceReferenceRepository;
  },
  input: { actorId: OwnerId; mediaAssetId: MediaAssetId },
) {
  const media = await loadOwnedMediaAsset(
    deps.mediaAssets,
    input.actorId,
    input.mediaAssetId,
    "evidenceReference.list",
  );
  if (!media.ok) return media;
  const evidence = await attempt("evidenceReference.listByMediaAsset", () =>
    deps.evidenceReferences.listByMediaAsset(input.mediaAssetId),
  );
  return evidence.ok ? ok(evidence.value.map(toEvidenceReferenceView)) : evidence;
}

export async function listEvidenceForTranscript(
  deps: {
    transcripts: TranscriptDocumentRepository;
    evidenceReferences: EvidenceReferenceRepository;
  },
  input: { actorId: OwnerId; transcriptDocumentId: TranscriptDocumentId },
) {
  const transcript = await loadOwnedTranscript(
    deps.transcripts,
    input.actorId,
    input.transcriptDocumentId,
    "evidenceReference.list",
  );
  if (!transcript.ok) return transcript;
  const evidence = await attempt("evidenceReference.listByTranscriptDocument", () =>
    deps.evidenceReferences.listByTranscriptDocument(input.transcriptDocumentId),
  );
  return evidence.ok ? ok(evidence.value.map(toEvidenceReferenceView)) : evidence;
}
