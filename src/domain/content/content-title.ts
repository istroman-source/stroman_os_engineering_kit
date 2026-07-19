import { ok, type Result } from "@/lib/result";
import { type Brand, type InvalidValueError, validateBoundedText } from "../shared";

/** A content item's human-readable title. */
export type ContentTitle = Brand<string, "ContentTitle">;

export function makeContentTitle(raw: string): Result<ContentTitle, InvalidValueError> {
  const result = validateBoundedText(raw, { label: "Content title", max: 200 });
  return result.ok ? ok(result.value as ContentTitle) : result;
}
