import { createHash } from "node:crypto";
import { isDeepStrictEqual } from "node:util";
import { updateCreativePlanning } from "@/application/creative";
import { importProjectSource } from "@/application/source-import";
import {
  cameraOrientationMatches,
  isLocationWorkspaceState,
  LOCATION_RENDERER_VERSION,
  type LocationCameraState,
  type LocationWorkspaceState,
} from "@/domain/creative";
import { ProjectId } from "@/domain/project";
import { authenticateRequest } from "@/server/auth";
import { getApiContext } from "@/server/composition";
import { HttpError } from "@/server/http/http-error";
import { apiRoute, parsePathId, sendResult } from "@/server/http/respond";
import { serializeAnalysis } from "@/server/http/serializers";
import { requireBoundedContentLength } from "@/server/http/upload-limit";

const MAX_FRAME_BYTES = 5 * 1024 * 1024;

function within(value: number, min: number, max: number): boolean {
  return value >= min && value <= max;
}

function cameraWithinCoverage(camera: LocationCameraState, workspace: LocationWorkspaceState) {
  const { min, max } = workspace.environment.coverage.bounds;
  return (
    within(camera.position.x, min.x, max.x) &&
    within(camera.position.y, min.y, max.y) &&
    within(camera.position.z, min.z, max.z)
  );
}

export const POST = apiRoute<{ projectId: string }>(async ({ req, params, requestId }) => {
  const actorId = (await authenticateRequest(req)).ownerId;
  const projectId = parsePathId(params.projectId, ProjectId.parse);
  const context = getApiContext();
  const project = await context.projects.findById(projectId);
  if (!project || project.ownerId !== actorId) {
    throw new HttpError(404, "NOT_FOUND", "Project not found.");
  }
  requireBoundedContentLength(req.headers, MAX_FRAME_BYTES + 512 * 1024);
  if (!(req.headers.get("content-type") ?? "").toLowerCase().includes("multipart/form-data")) {
    throw new HttpError(415, "UNSUPPORTED_MEDIA_TYPE", "Expected a saved-shot form.");
  }
  const form = await req.formData();
  const frame = form.get("frame");
  const title = String(form.get("title") ?? "Saved location shot").trim();
  const technicalSummary = String(form.get("technicalSummary") ?? "").trim();
  const shootingInstructions = String(form.get("shootingInstructions") ?? "").trim();
  const includesUnknownSpace = String(form.get("includesUnknownSpace") ?? "false") === "true";
  const width = Number(form.get("width"));
  const height = Number(form.get("height"));
  let workspace: unknown;
  try {
    workspace = JSON.parse(String(form.get("workspace") ?? "null"));
  } catch {
    throw new HttpError(400, "VALIDATION_FAILED", "The location workspace is not valid JSON.");
  }
  if (!isLocationWorkspaceState(workspace)) {
    throw new HttpError(400, "VALIDATION_FAILED", "The location workspace is invalid.");
  }
  if (
    !(frame instanceof File) ||
    frame.type !== "image/png" ||
    frame.size <= 0 ||
    frame.size > MAX_FRAME_BYTES
  ) {
    throw new HttpError(
      400,
      "VALIDATION_FAILED",
      "The saved camera frame must be a PNG under 5 MB.",
    );
  }
  if (
    !title ||
    title.length > 160 ||
    technicalSummary.length > 1000 ||
    shootingInstructions.length > 2000
  ) {
    throw new HttpError(400, "VALIDATION_FAILED", "The saved-shot details are too long.");
  }
  if (
    !Number.isInteger(width) ||
    !Number.isInteger(height) ||
    width < 360 ||
    height < 360 ||
    width > 4096 ||
    height > 4096
  ) {
    throw new HttpError(400, "VALIDATION_FAILED", "The saved camera frame dimensions are invalid.");
  }
  const brief = await context.creativeBriefs.findByProject(projectId);
  const persisted = brief?.planningContext.locationWorkspace;
  if (
    !brief?.blueprint ||
    !persisted ||
    persisted.environment.id !== workspace.environment.id ||
    persisted.environment.version !== workspace.environment.version ||
    persisted.environment.geometryAsset.contentHash !==
      workspace.environment.geometryAsset.contentHash ||
    !isDeepStrictEqual(persisted.environment, workspace.environment) ||
    !isDeepStrictEqual(persisted.environments, workspace.environments) ||
    !isDeepStrictEqual(persisted.savedShots, workspace.savedShots)
  ) {
    throw new HttpError(
      409,
      "CONFLICT",
      "The location changed. Reload it before saving this shot.",
    );
  }
  const camera =
    workspace.activeAspect === "16:9"
      ? workspace.compositions.horizontal
      : workspace.compositions.vertical;
  if (!cameraWithinCoverage(camera, persisted)) {
    throw new HttpError(
      400,
      "VALIDATION_FAILED",
      "Move the camera inside captured space before saving.",
    );
  }
  if (!cameraOrientationMatches(camera)) {
    throw new HttpError(
      400,
      "VALIDATION_FAILED",
      "The saved camera orientation does not match its exact target.",
    );
  }
  const targetIsUnknown = !cameraWithinCoverage({ ...camera, position: camera.target }, persisted);
  if (targetIsUnknown && !includesUnknownSpace) {
    throw new HttpError(
      400,
      "VALIDATION_FAILED",
      "Confirm the uncaptured part of the frame before saving this shot.",
    );
  }
  const expectedAspect = camera.aspectRatio === "16:9" ? 16 / 9 : 9 / 16;
  if (Math.abs(width / height - expectedAspect) > 0.01) {
    throw new HttpError(
      400,
      "VALIDATION_FAILED",
      "The baked frame dimensions do not match the saved camera gate.",
    );
  }
  const bytes = new Uint8Array(await frame.arrayBuffer());
  if (bytes[0] !== 0x89 || bytes[1] !== 0x50 || bytes[2] !== 0x4e || bytes[3] !== 0x47) {
    throw new HttpError(400, "VALIDATION_FAILED", "The saved camera frame is not a valid PNG.");
  }
  const contentHash = `sha256:${createHash("sha256").update(bytes).digest("hex")}`;
  const version = (persisted.savedShots.at(-1)?.version ?? 0) + 1;
  const imported = await importProjectSource(
    { ...context, imports: context.sourceImports, storage: context.sourceStorage },
    {
      actorId,
      projectId,
      idempotencyKey: `${projectId}:location-shot:${workspace.environment.id}:${version}:${contentHash}`,
      sourceName: `${workspace.environment.name}-shot-${version}.png`,
      contentType: "image/png",
      bytes,
      contentHash,
    },
  );
  if (!imported.ok) return sendResult(imported, { requestId, serialize: (value) => value });
  if (!imported.value.mediaAssetId) {
    throw new HttpError(500, "INTERNAL_ERROR", "The saved frame did not produce an asset.");
  }
  const next: LocationWorkspaceState = {
    ...persisted,
    activeAspect: workspace.activeAspect,
    compositions: workspace.compositions,
    savedShots: [
      ...persisted.savedShots,
      {
        id: context.ids.generate("lshot"),
        version,
        title,
        environmentId: workspace.environment.id,
        environmentVersion: workspace.environment.version,
        camera: { ...camera, confidence: "FILMMAKER_CONFIRMED" },
        storyboardFrame: {
          mediaAssetId: imported.value.mediaAssetId,
          contentHash,
          width,
          height,
          colorSpace: "srgb",
          renderer: "THREE_WEBGL",
          rendererVersion: LOCATION_RENDERER_VERSION,
          capturedAt: new Date().toISOString(),
        },
        technicalSummary,
        shootingInstructions,
        includesUnknownSpace,
      },
    ],
  };
  const result = await updateCreativePlanning(context, {
    actorId,
    projectId,
    locationWorkspace: next,
  });
  return sendResult(result, { requestId, serialize: serializeAnalysis });
});
