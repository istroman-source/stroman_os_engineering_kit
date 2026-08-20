import { stageLocationReconstructionPhoto } from "@/application/creative";
import { ProjectId } from "@/domain/project";
import { authenticateRequest } from "@/server/auth";
import { getApiContext } from "@/server/composition";
import { HttpError } from "@/server/http/http-error";
import { apiRoute, json, parsePathId } from "@/server/http/respond";
import { requireBoundedContentLength } from "@/server/http/upload-limit";

const MAX_PHOTO_BYTES = 8 * 1024 * 1024;
const MAX_REQUEST_BYTES = MAX_PHOTO_BYTES + 64 * 1024;
const ALLOWED_TYPES = new Set(["image/jpeg", "image/png"]);

function validMagic(bytes: Uint8Array, type: string): boolean {
  if (type === "image/jpeg") return bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff;
  return (
    bytes.length >= 8 &&
    [137, 80, 78, 71, 13, 10, 26, 10].every((value, index) => bytes[index] === value)
  );
}

export const POST = apiRoute<{ projectId: string }>(async ({ req, params, requestId }) => {
  const actorId = (await authenticateRequest(req)).ownerId;
  const projectId = parsePathId(params.projectId, ProjectId.parse);
  requireBoundedContentLength(req.headers, MAX_REQUEST_BYTES);
  if (!(req.headers.get("content-type") ?? "").toLowerCase().includes("multipart/form-data")) {
    throw new HttpError(415, "UNSUPPORTED_MEDIA_TYPE", "Expected one location photograph.");
  }
  const form = await req.formData();
  const file = form.get("photo");
  if (
    !(file instanceof File) ||
    !ALLOWED_TYPES.has(file.type) ||
    file.size === 0 ||
    file.size > MAX_PHOTO_BYTES
  ) {
    throw new HttpError(
      400,
      "VALIDATION_FAILED",
      "Choose one JPEG or PNG location photo no larger than 8 MB.",
    );
  }
  const bytes = new Uint8Array(await file.arrayBuffer());
  if (!validMagic(bytes, file.type)) {
    throw new HttpError(
      400,
      "VALIDATION_FAILED",
      `${file.name || "The selected photo"} does not match its image format.`,
    );
  }
  const upload = await stageLocationReconstructionPhoto(getApiContext(), {
    actorId,
    projectId,
    fileName: file.name || `location-photo-${crypto.randomUUID()}.jpg`,
    contentType: file.type as "image/jpeg" | "image/png",
    bytes,
  });
  return json({ upload }, { requestId, status: 201 });
});
