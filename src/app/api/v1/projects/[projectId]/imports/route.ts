import { createHash } from "node:crypto";
import { importProjectSource, type TranscriptFormat } from "@/application/source-import";
import { ProjectId } from "@/domain/project";
import { authenticateRequest } from "@/server/auth";
import { getApiContext } from "@/server/composition";
import { HttpError } from "@/server/http/http-error";
import { apiRoute, json, parsePathId, sendResult } from "@/server/http/respond";

const MAX_BYTES = 250 * 1024 * 1024;
const transcriptFormats = new Set<TranscriptFormat>(["srt", "vtt", "json", "text"]);

const serialize = (value: {
  id: string;
  status: string;
  sourceName: string;
  sourceKind: string;
  byteSize: number;
  contentHash: string;
  mediaAssetId: string | null;
  transcriptDocumentId: string | null;
  createdAt: Date;
}) => ({
  id: value.id,
  status: value.status,
  sourceName: value.sourceName,
  sourceKind: value.sourceKind,
  byteSize: value.byteSize,
  contentHash: value.contentHash,
  mediaId: value.mediaAssetId,
  transcriptId: value.transcriptDocumentId,
  createdAt: value.createdAt.toISOString(),
});

export const POST = apiRoute<{ projectId: string }>(async ({ req, params, requestId }) => {
  const actorId = (await authenticateRequest(req)).ownerId;
  const projectId = parsePathId(params.projectId, ProjectId.parse);
  const contentType = req.headers.get("content-type") ?? "";
  if (!contentType.toLowerCase().includes("multipart/form-data"))
    throw new HttpError(415, "UNSUPPORTED_MEDIA_TYPE", "Expected a file upload.");
  const form = await req.formData();
  const file = form.get("file");
  if (!(file instanceof File)) throw new HttpError(400, "VALIDATION_FAILED", "Choose a file.");
  if (file.size === 0 || file.size > MAX_BYTES)
    throw new HttpError(400, "VALIDATION_FAILED", "File size is not supported.");
  const rawFormat = form.get("transcriptFormat");
  const transcriptFormat =
    typeof rawFormat === "string" && transcriptFormats.has(rawFormat as TranscriptFormat)
      ? (rawFormat as TranscriptFormat)
      : undefined;
  const bytes = new Uint8Array(await file.arrayBuffer());
  const contentHash = `sha256:${createHash("sha256").update(bytes).digest("hex")}`;
  const key =
    req.headers.get("idempotency-key")?.trim() ||
    `${projectId}:${contentHash}:${transcriptFormat ?? "media"}`;
  const context = getApiContext();
  const result = await importProjectSource(
    { ...context, imports: context.sourceImports, storage: context.sourceStorage },
    {
      actorId,
      projectId,
      idempotencyKey: key,
      sourceName: file.name,
      contentType: file.type || "application/octet-stream",
      bytes,
      contentHash,
      transcriptFormat,
    },
  );
  return sendResult(result, { requestId, status: 201, serialize });
});

export const GET = apiRoute<{ projectId: string }>(async ({ req, params, requestId }) => {
  const actorId = (await authenticateRequest(req)).ownerId;
  const projectId = parsePathId(params.projectId, ProjectId.parse);
  const context = getApiContext();
  const project = await context.projects.findById(projectId);
  if (!project || project.ownerId !== actorId)
    throw new HttpError(404, "NOT_FOUND", "Project not found.");
  const imports = await context.sourceImports.listByProject(projectId);
  return json({ items: imports.map(serialize) }, { requestId });
});
