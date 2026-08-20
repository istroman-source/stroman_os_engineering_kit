import { createHash } from "node:crypto";
import { updateCreativePlanning } from "@/application/creative";
import { importProjectSource } from "@/application/source-import";
import { createLocationWorkspace } from "@/domain/creative";
import { InvalidGlbError, readGlbBounds } from "@/infrastructure/spatial/glb-metadata";
import { ProjectId } from "@/domain/project";
import { authenticateRequest } from "@/server/auth";
import { getApiContext } from "@/server/composition";
import { HttpError } from "@/server/http/http-error";
import { apiRoute, parsePathId, sendResult } from "@/server/http/respond";
import { serializeAnalysis } from "@/server/http/serializers";
import { requireBoundedContentLength } from "@/server/http/upload-limit";

const MAX_GLB_BYTES = 100 * 1024 * 1024;
const MAX_REQUEST_BYTES = MAX_GLB_BYTES + 1024 * 1024;
export const POST = apiRoute<{ projectId: string }>(async ({ req, params, requestId }) => {
  const actorId = (await authenticateRequest(req)).ownerId;
  const projectId = parsePathId(params.projectId, ProjectId.parse);
  const context = getApiContext();
  const project = await context.projects.findById(projectId);
  if (!project) throw new HttpError(404, "NOT_FOUND", "Project not found.");
  if (project.ownerId !== actorId) {
    throw new HttpError(403, "FORBIDDEN", "You cannot add a location scan to this project.");
  }
  const brief = await context.creativeBriefs.findByProject(projectId);
  if (!brief?.blueprint) {
    throw new HttpError(404, "NOT_FOUND", "Develop the project before adding a location scan.");
  }
  requireBoundedContentLength(req.headers, MAX_REQUEST_BYTES);
  if (!(req.headers.get("content-type") ?? "").toLowerCase().includes("multipart/form-data")) {
    throw new HttpError(415, "UNSUPPORTED_MEDIA_TYPE", "Expected a location-scan upload.");
  }
  const form = await req.formData();
  const file = form.get("file");
  const name = String(form.get("name") ?? "").trim();
  const sourceKind = String(form.get("sourceKind") ?? "PHONE_SCAN");
  const metricScale = String(form.get("metricScale") ?? "false") === "true";
  const unit = String(form.get("unit") ?? "METERS");
  if (!(file instanceof File) || file.size <= 0 || file.size > MAX_GLB_BYTES) {
    throw new HttpError(400, "VALIDATION_FAILED", "Choose one GLB scan no larger than 100 MB.");
  }
  if (!file.name.toLowerCase().endsWith(".glb")) {
    throw new HttpError(400, "VALIDATION_FAILED", "Location geometry must be a .glb file.");
  }
  if (!name || name.length > 160) {
    throw new HttpError(400, "VALIDATION_FAILED", "Name the location in 160 characters or fewer.");
  }
  if (!["PHONE_SCAN", "PHOTOGRAMMETRY", "ROOMPLAN", "OTHER"].includes(sourceKind)) {
    throw new HttpError(400, "VALIDATION_FAILED", "Choose a supported capture source.");
  }
  if (!["METERS", "CENTIMETERS", "MILLIMETERS"].includes(unit)) {
    throw new HttpError(400, "VALIDATION_FAILED", "Choose the scan export unit.");
  }
  const scale = unit === "CENTIMETERS" ? 0.01 : unit === "MILLIMETERS" ? 0.001 : 1;
  const bytes = new Uint8Array(await file.arrayBuffer());
  let bounds;
  try {
    bounds = readGlbBounds(bytes, scale);
  } catch (error) {
    if (error instanceof InvalidGlbError) {
      throw new HttpError(400, "VALIDATION_FAILED", error.message);
    }
    throw error;
  }
  const contentHash = `sha256:${createHash("sha256").update(bytes).digest("hex")}`;
  const previous = brief.planningContext.locationWorkspace ?? null;
  if (previous && previous.environments.length >= 3) {
    throw new HttpError(
      409,
      "CONFLICT",
      "This project already has the first-release limit of three location versions. Start a new project before importing another; Stroman will not delete an original automatically.",
    );
  }
  const previousBytes =
    previous?.environments.reduce(
      (total, environment) => total + environment.geometryAsset.byteSize,
      0,
    ) ?? 0;
  if (previousBytes + bytes.byteLength > 500 * 1024 * 1024) {
    throw new HttpError(413, "PAYLOAD_TOO_LARGE", "Project spatial assets cannot exceed 500 MB.");
  }
  const imported = await importProjectSource(
    { ...context, imports: context.sourceImports, storage: context.sourceStorage },
    {
      actorId,
      projectId,
      idempotencyKey: `${projectId}:location:${contentHash}`,
      sourceName: file.name,
      contentType: "model/gltf-binary",
      bytes,
      contentHash,
    },
  );
  if (!imported.ok) return sendResult(imported, { requestId, serialize: (value) => value });
  if (!imported.value.mediaAssetId) {
    throw new HttpError(500, "INTERNAL_ERROR", "Location import did not produce an asset.");
  }
  const environmentVersion = (previous?.environment.version ?? 0) + 1;
  const locationWorkspace = createLocationWorkspace(
    {
      // Every immutable geometry version gets its own route-safe id. Version remains
      // explicit for human-facing history and saved-shot provenance.
      id: context.ids.generate("env"),
      version: environmentVersion,
      name,
      sourceKind: sourceKind as "PHONE_SCAN" | "PHOTOGRAMMETRY" | "ROOMPLAN" | "OTHER",
      geometryAsset: {
        mediaAssetId: imported.value.mediaAssetId,
        fileName: file.name,
        mediaType: "model/gltf-binary",
        byteSize: bytes.byteLength,
        contentHash,
      },
      bounds,
      scaleMetersPerUnit: scale,
      scaleConfidence: metricScale ? "OBSERVED" : "ESTIMATED",
      createdAt: new Date().toISOString(),
    },
    previous,
  );
  const result = await updateCreativePlanning(context, {
    actorId,
    projectId,
    stage: "SCOUTING",
    locationWorkspace,
  });
  return sendResult(result, { requestId, serialize: serializeAnalysis });
});
