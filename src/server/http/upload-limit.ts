import { HttpError } from "./http-error";

export function requireBoundedContentLength(headers: Headers, maximumBytes: number): number {
  const raw = headers.get("content-length");
  if (raw === null)
    throw new HttpError(
      411,
      "CONTENT_LENGTH_REQUIRED",
      "A content length is required for file uploads.",
    );
  if (!/^\d+$/.test(raw))
    throw new HttpError(400, "INVALID_CONTENT_LENGTH", "Invalid upload size.");
  const length = Number(raw);
  if (!Number.isSafeInteger(length) || length <= 0)
    throw new HttpError(400, "INVALID_CONTENT_LENGTH", "Invalid upload size.");
  if (length > maximumBytes)
    throw new HttpError(413, "PAYLOAD_TOO_LARGE", "The upload is too large.");
  return length;
}
