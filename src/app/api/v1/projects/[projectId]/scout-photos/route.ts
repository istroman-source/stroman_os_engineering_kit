import { createHash } from "node:crypto";
import { updateCreativePlanning } from "@/application/creative";
import { importProjectSource } from "@/application/source-import";
import { ProjectId } from "@/domain/project";
import { authenticateRequest } from "@/server/auth";
import { getApiContext } from "@/server/composition";
import { HttpError } from "@/server/http/http-error";
import { apiRoute, parsePathId, sendResult } from "@/server/http/respond";
import { serializeAnalysis } from "@/server/http/serializers";
import { requireBoundedContentLength } from "@/server/http/upload-limit";

const MAX_PHOTO_BYTES = 8 * 1024 * 1024;
const MAX_PHOTOS = 6;
const MAX_REQUEST_BYTES = MAX_PHOTO_BYTES * MAX_PHOTOS + 1024 * 1024;
const ALLOWED_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);

export const POST = apiRoute<{ projectId: string }>(async ({ req, params, requestId }) => {
  const actorId = (await authenticateRequest(req)).ownerId;
  const projectId = parsePathId(params.projectId, ProjectId.parse);
  const context = getApiContext();
  const project = await context.projects.findById(projectId);
  if (!project) throw new HttpError(404, "NOT_FOUND", "Project not found.");
  if (project.ownerId !== actorId) {
    throw new HttpError(403, "FORBIDDEN", "You cannot add scout photos to this project.");
  }
  const brief = await context.creativeBriefs.findByProject(projectId);
  if (!brief?.blueprint) {
    throw new HttpError(404, "NOT_FOUND", "Develop the project before adding scout photos.");
  }
  const contentType = req.headers.get("content-type") ?? "";
  if (!contentType.toLowerCase().includes("multipart/form-data")) {
    throw new HttpError(415, "UNSUPPORTED_MEDIA_TYPE", "Expected scout-photo uploads.");
  }
  requireBoundedContentLength(req.headers, MAX_REQUEST_BYTES);
  const form = await req.formData();
  const files = form.getAll("files").filter((value): value is File => value instanceof File);
  if (files.length === 0 || files.length > MAX_PHOTOS) {
    throw new HttpError(400, "VALIDATION_FAILED", "Choose between one and six scout photos.");
  }
  const photos = [];
  for (const [index, file] of files.entries()) {
    if (!ALLOWED_TYPES.has(file.type) || file.size === 0 || file.size > MAX_PHOTO_BYTES) {
      throw new HttpError(
        400,
        "VALIDATION_FAILED",
        "Scout photos must be PNG, JPEG, or WebP and no larger than 8 MB each.",
      );
    }
    const bytes = new Uint8Array(await file.arrayBuffer());
    const contentHash = `sha256:${createHash("sha256").update(bytes).digest("hex")}`;
    const imported = await importProjectSource(
      { ...context, imports: context.sourceImports, storage: context.sourceStorage },
      {
        actorId,
        projectId,
        idempotencyKey: `${projectId}:scout:${contentHash}`,
        sourceName: file.name,
        contentType: file.type,
        bytes,
        contentHash,
      },
    );
    if (!imported.ok) return sendResult(imported, { requestId, serialize: (value) => value });
    if (!imported.value.mediaAssetId) {
      throw new HttpError(500, "INTERNAL_ERROR", "Scout photo import did not produce an asset.");
    }
    photos.push({
      id: imported.value.mediaAssetId,
      mediaAssetId: imported.value.mediaAssetId,
      fileName: file.name,
      contentType: file.type,
      contentHash,
      angleLabel: `Angle ${index + 1}`,
    });
  }
  const result = await updateCreativePlanning(context, {
    actorId,
    projectId,
    stage: "SCOUTING",
    scoutPhotos: photos,
  });
  return sendResult(result, { requestId, serialize: serializeAnalysis });
});
