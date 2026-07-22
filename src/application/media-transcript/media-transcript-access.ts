import { err } from "@/lib/result";
import type { OwnerId, ProjectId, ProjectRepository } from "@/domain/project";
import type {
  MediaAssetId,
  MediaAssetRepository,
  TranscriptDocumentId,
  TranscriptDocumentRepository,
} from "@/domain/media-transcript";
import { attempt } from "../shared/attempt";
import { ensureOwner } from "../shared/authorization";
import { NotFoundError } from "../shared/errors";
export async function loadOwnedProject(
  repo: ProjectRepository,
  actorId: OwnerId,
  id: ProjectId,
  action: string,
) {
  const r = await attempt("project.findById", () => repo.findById(id));
  if (!r.ok) return r;
  if (!r.value) return err(new NotFoundError("Project", id));
  const auth = ensureOwner(actorId, r.value.ownerId, action);
  return auth.ok ? { ok: true as const, value: r.value } : auth;
}
export async function loadOwnedMediaAsset(
  repo: MediaAssetRepository,
  actorId: OwnerId,
  id: MediaAssetId,
  action: string,
) {
  const r = await attempt("mediaAsset.findById", () => repo.findById(id));
  if (!r.ok) return r;
  if (!r.value) return err(new NotFoundError("MediaAsset", id));
  const auth = ensureOwner(actorId, r.value.ownerId, action);
  return auth.ok ? { ok: true as const, value: r.value } : auth;
}
export async function loadOwnedTranscript(
  repo: TranscriptDocumentRepository,
  actorId: OwnerId,
  id: TranscriptDocumentId,
  action: string,
) {
  const r = await attempt("transcriptDocument.findById", () => repo.findById(id));
  if (!r.ok) return r;
  if (!r.value) return err(new NotFoundError("TranscriptDocument", id));
  const auth = ensureOwner(actorId, r.value.ownerId, action);
  return auth.ok ? { ok: true as const, value: r.value } : auth;
}
