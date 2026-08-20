import {
  getLatestLocationReconstruction,
  startLocationReconstruction,
} from "@/application/creative";
import { ProjectId } from "@/domain/project";
import { authenticateRequest } from "@/server/auth";
import { getApiContext } from "@/server/composition";
import { HttpError } from "@/server/http/http-error";
import { apiRoute, json, parsePathId } from "@/server/http/respond";
import { requireBoundedContentLength } from "@/server/http/upload-limit";

const MIN_PHOTOS = 20;
const MAX_PHOTOS = 40;
const MAX_PHOTO_BYTES = 8 * 1024 * 1024;
const MAX_TOTAL_PHOTO_BYTES = 180 * 1024 * 1024;
const MAX_REQUEST_BYTES = MAX_TOTAL_PHOTO_BYTES + 1024 * 1024;
const ALLOWED_TYPES = new Set(["image/jpeg", "image/png"]);

function validMagic(bytes: Uint8Array, type: string): boolean {
  if (type === "image/jpeg") return bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff;
  return (
    bytes.length >= 8 &&
    [137, 80, 78, 71, 13, 10, 26, 10].every((value, index) => bytes[index] === value)
  );
}

export const GET = apiRoute<{ projectId: string }>(async ({ req, params, requestId }) => {
  const actorId = (await authenticateRequest(req)).ownerId;
  const projectId = parsePathId(params.projectId, ProjectId.parse);
  const job = await getLatestLocationReconstruction(getApiContext(), { actorId, projectId });
  return json({ job }, { requestId });
});

export const POST = apiRoute<{ projectId: string }>(async ({ req, params, requestId }) => {
  const actorId = (await authenticateRequest(req)).ownerId;
  const projectId = parsePathId(params.projectId, ProjectId.parse);
  requireBoundedContentLength(req.headers, MAX_REQUEST_BYTES);
  if (!(req.headers.get("content-type") ?? "").toLowerCase().includes("multipart/form-data")) {
    throw new HttpError(415, "UNSUPPORTED_MEDIA_TYPE", "Expected location photographs.");
  }
  const form = await req.formData();
  const name = String(form.get("name") ?? "").trim();
  const files = form.getAll("photos").filter((value): value is File => value instanceof File);
  if (!name || name.length > 160) {
    throw new HttpError(400, "VALIDATION_FAILED", "Name the location in 160 characters or fewer.");
  }
  if (files.length < MIN_PHOTOS || files.length > MAX_PHOTOS) {
    throw new HttpError(
      400,
      "VALIDATION_FAILED",
      `Choose between ${MIN_PHOTOS} and ${MAX_PHOTOS} overlapping room photos.`,
    );
  }
  if (
    files.some(
      (file) => !ALLOWED_TYPES.has(file.type) || file.size === 0 || file.size > MAX_PHOTO_BYTES,
    )
  ) {
    throw new HttpError(
      400,
      "VALIDATION_FAILED",
      "Location photos must be JPEG or PNG and no larger than 8 MB each.",
    );
  }
  const totalBytes = files.reduce((total, file) => total + file.size, 0);
  if (totalBytes > MAX_TOTAL_PHOTO_BYTES) {
    throw new HttpError(
      413,
      "PAYLOAD_TOO_LARGE",
      "The location photo set must be no larger than 180 MB.",
    );
  }
  const photos = await Promise.all(
    files.map(async (file) => {
      const bytes = new Uint8Array(await file.arrayBuffer());
      if (!validMagic(bytes, file.type)) {
        throw new HttpError(
          400,
          "VALIDATION_FAILED",
          `${file.name || "A selected photo"} does not match its image format.`,
        );
      }
      return {
        fileName: file.name || `location-photo-${crypto.randomUUID()}.jpg`,
        contentType: file.type as "image/jpeg" | "image/png",
        bytes,
      };
    }),
  );
  const job = await startLocationReconstruction(getApiContext(), {
    actorId,
    projectId,
    name,
    photos,
  });
  return json({ job }, { requestId, status: 202 });
});
