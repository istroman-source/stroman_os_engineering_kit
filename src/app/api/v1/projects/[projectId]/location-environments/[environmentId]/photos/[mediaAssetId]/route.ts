import { MediaAssetId } from "@/domain/media-transcript";
import { ProjectId } from "@/domain/project";
import { authenticateRequest } from "@/server/auth";
import { getApiContext } from "@/server/composition";
import { HttpError } from "@/server/http/http-error";
import { apiRoute, parsePathId } from "@/server/http/respond";

export const GET = apiRoute<{
  projectId: string;
  environmentId: string;
  mediaAssetId: string;
}>(async ({ req, params }) => {
  const actorId = (await authenticateRequest(req)).ownerId;
  const projectId = parsePathId(params.projectId, ProjectId.parse);
  const mediaAssetId = parsePathId(params.mediaAssetId, MediaAssetId.parse);
  const context = getApiContext();
  const project = await context.projects.findById(projectId);
  if (!project || project.ownerId !== actorId) {
    throw new HttpError(404, "NOT_FOUND", "Project not found.");
  }
  const brief = await context.creativeBriefs.findByProject(projectId);
  const environment = brief?.planningContext.locationWorkspace?.environments.find(
    (item) => item.id === decodeURIComponent(params.environmentId),
  );
  const photo = environment?.sourcePhotos?.find((item) => item.mediaAssetId === mediaAssetId);
  if (!photo) throw new HttpError(404, "NOT_FOUND", "Location photo not found.");
  const receipt = (await context.sourceImports.listByProject(projectId)).find(
    (item) => item.mediaAssetId === mediaAssetId && item.contentHash === photo.contentHash,
  );
  if (!receipt) throw new HttpError(404, "NOT_FOUND", "Location photo not found.");
  const bytes = await context.sourceStorage.get(receipt.storageKey);
  const body = bytes.buffer.slice(
    bytes.byteOffset,
    bytes.byteOffset + bytes.byteLength,
  ) as ArrayBuffer;
  return new Response(body, {
    headers: {
      "Content-Type": photo.contentType,
      "Content-Length": String(bytes.byteLength),
      "Cache-Control": "private, no-store",
      "X-Content-Type-Options": "nosniff",
      "Content-Disposition": "inline",
    },
  });
});
