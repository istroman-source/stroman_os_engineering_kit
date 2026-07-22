import { ok } from "@/lib/result";
import {
  MediaAssetId,
  createMediaAsset,
  type MediaAssetRepository,
} from "@/domain/media-transcript";
import type { OwnerId, ProjectId, ProjectRepository } from "@/domain/project";
import type { Clock, IdGenerator } from "../shared";
import { attempt } from "../shared/attempt";
import { loadOwnedMediaAsset, loadOwnedProject } from "./media-transcript-access";
import { toMediaAssetView } from "./media-transcript-view";
export async function registerMediaAsset(
  deps: {
    projects: ProjectRepository;
    mediaAssets: MediaAssetRepository;
    ids: IdGenerator;
    clock: Clock;
  },
  input: {
    actorId: OwnerId;
    projectId: ProjectId;
    fileName: string;
    mediaType: string;
    byteSize: number;
    contentHash: string;
  },
) {
  const p = await loadOwnedProject(
    deps.projects,
    input.actorId,
    input.projectId,
    "mediaAsset.register",
  );
  if (!p.ok) return p;
  const made = createMediaAsset({
    id: MediaAssetId.unsafe(deps.ids.generate(MediaAssetId.prefix)),
    ownerId: input.actorId,
    projectId: input.projectId,
    fileName: input.fileName,
    mediaType: input.mediaType,
    byteSize: input.byteSize,
    contentHash: input.contentHash,
    now: deps.clock.now(),
  });
  if (!made.ok) return made;
  const saved = await attempt("mediaAsset.insert", () => deps.mediaAssets.insert(made.value));
  return saved.ok ? ok(toMediaAssetView(made.value)) : saved;
}
export async function getMediaAsset(
  deps: { mediaAssets: MediaAssetRepository },
  input: { actorId: OwnerId; mediaAssetId: MediaAssetId },
) {
  const a = await loadOwnedMediaAsset(
    deps.mediaAssets,
    input.actorId,
    input.mediaAssetId,
    "mediaAsset.read",
  );
  return a.ok ? ok(toMediaAssetView(a.value)) : a;
}
export async function listMediaAssetsForProject(
  deps: { projects: ProjectRepository; mediaAssets: MediaAssetRepository },
  input: { actorId: OwnerId; projectId: ProjectId },
) {
  const p = await loadOwnedProject(
    deps.projects,
    input.actorId,
    input.projectId,
    "mediaAsset.list",
  );
  if (!p.ok) return p;
  const r = await attempt("mediaAsset.listByProject", () =>
    deps.mediaAssets.listByProject(input.projectId),
  );
  return r.ok ? ok(r.value.map(toMediaAssetView)) : r;
}
