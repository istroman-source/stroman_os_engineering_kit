import { runMediaVisualAnalysis } from "@/application/media-analysis";
import type { VisualAnalysisFrame } from "@/domain/media-analysis";
import { MediaAssetId } from "@/domain/media-transcript";
import { ProjectId } from "@/domain/project";
import { authenticateRequest } from "@/server/auth";
import { getApiContext } from "@/server/composition";
import { HttpError } from "@/server/http/http-error";
import { apiRoute, parsePathId, sendResult } from "@/server/http/respond";
import { requireBoundedContentLength } from "@/server/http/upload-limit";

const MAX_FRAME_BYTES = 1_500_000;
const MAX_REQUEST_BYTES = 10 * 1024 * 1024;
const frameTypes = new Set<VisualAnalysisFrame["mimeType"]>([
  "image/jpeg",
  "image/png",
  "image/webp",
]);

const iso = (date: Date | null) => (date ? date.toISOString() : null);

const sendAnalysis = (
  result: Awaited<ReturnType<typeof runMediaVisualAnalysis>>,
  requestId: string,
) =>
  sendResult(result, {
    requestId,
    status: 201,
    serialize: (value) => ({
      run: {
        ...value.run,
        createdAt: iso(value.run.createdAt),
        startedAt: iso(value.run.startedAt),
        completedAt: iso(value.run.completedAt),
      },
      outputs: value.outputs.map((output) => ({
        ...output,
        createdAt: output.createdAt.toISOString(),
      })),
      recommendations: value.recommendations.map((recommendation) => ({
        ...recommendation,
        createdAt: recommendation.createdAt.toISOString(),
      })),
    }),
  });

export const POST = apiRoute<{ projectId: string }>(async ({ req, params, requestId }) => {
  const actorId = (await authenticateRequest(req)).ownerId;
  const projectId = parsePathId(params.projectId, ProjectId.parse);
  const contentType = req.headers.get("content-type") ?? "";
  if (!contentType.toLowerCase().includes("multipart/form-data")) {
    throw new HttpError(415, "UNSUPPORTED_MEDIA_TYPE", "Expected sampled video frames.");
  }
  requireBoundedContentLength(req.headers, MAX_REQUEST_BYTES);
  const form = await req.formData();
  const mediaAssetId = parsePathId(String(form.get("mediaId") ?? ""), MediaAssetId.parse);
  const metadataValue = form.get("frameMetadata");
  let metadata: unknown;
  try {
    metadata = JSON.parse(typeof metadataValue === "string" ? metadataValue : "");
  } catch {
    throw new HttpError(400, "VALIDATION_FAILED", "Frame metadata is invalid.");
  }
  const files = form.getAll("frame");
  if (
    !Array.isArray(metadata) ||
    metadata.length !== files.length ||
    files.length < 2 ||
    files.length > 6
  ) {
    throw new HttpError(400, "VALIDATION_FAILED", "Provide between 2 and 6 sampled frames.");
  }
  const frames: VisualAnalysisFrame[] = [];
  for (let index = 0; index < files.length; index += 1) {
    const file = files[index];
    const item = metadata[index];
    if (
      !(file instanceof File) ||
      !item ||
      typeof item !== "object" ||
      !Number.isInteger((item as { index?: unknown }).index) ||
      !Number.isInteger((item as { timestampMs?: unknown }).timestampMs) ||
      !frameTypes.has(file.type as VisualAnalysisFrame["mimeType"]) ||
      file.size === 0 ||
      file.size > MAX_FRAME_BYTES
    ) {
      throw new HttpError(400, "VALIDATION_FAILED", "A sampled frame is invalid.");
    }
    frames.push({
      index: (item as { index: number }).index,
      timestampMs: (item as { timestampMs: number }).timestampMs,
      mimeType: file.type as VisualAnalysisFrame["mimeType"],
      bytes: new Uint8Array(await file.arrayBuffer()),
    });
  }
  const result = await runMediaVisualAnalysis(getApiContext(), {
    actorId,
    projectId,
    mediaAssetId,
    frames,
  });
  return sendAnalysis(result, requestId);
});
