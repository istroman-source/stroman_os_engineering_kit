import { ProjectId } from "@/domain/project";
import { authenticateRequest } from "@/server/auth";
import { getApiContext } from "@/server/composition";
import { HttpError } from "@/server/http/http-error";
import { apiRoute, parsePathId } from "@/server/http/respond";

export const GET = apiRoute<{ projectId: string; environmentId: string }>(
  async ({ req, params }) => {
    const actorId = (await authenticateRequest(req)).ownerId;
    const projectId = parsePathId(params.projectId, ProjectId.parse);
    const context = getApiContext();
    const project = await context.projects.findById(projectId);
    if (!project || project.ownerId !== actorId) {
      throw new HttpError(404, "NOT_FOUND", "Project not found.");
    }
    const brief = await context.creativeBriefs.findByProject(projectId);
    const environment = brief?.planningContext.locationWorkspace?.environments.find(
      (item) => item.id === params.environmentId,
    );
    if (!environment) throw new HttpError(404, "NOT_FOUND", "Location environment not found.");
    const receipt = (await context.sourceImports.listByProject(projectId)).find(
      (item) => item.mediaAssetId === environment.geometryAsset.mediaAssetId,
    );
    if (!receipt) throw new HttpError(404, "NOT_FOUND", "Location geometry not found.");
    const bytes = await context.sourceStorage.get(receipt.storageKey);
    const body = bytes.buffer.slice(
      bytes.byteOffset,
      bytes.byteOffset + bytes.byteLength,
    ) as ArrayBuffer;
    return new Response(body, {
      headers: {
        "Content-Type": "model/gltf-binary",
        "Content-Length": String(bytes.byteLength),
        "Cache-Control": "private, no-store",
        "X-Content-Type-Options": "nosniff",
      },
    });
  },
);
