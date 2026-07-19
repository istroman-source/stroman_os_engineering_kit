import { err, ok, type Result } from "@/lib/result";
import type { Brand } from "./brand";
import { InvalidValueError } from "./domain-error";

/** A URL-safe, human-readable key: lowercase alphanumeric words joined by hyphens. */
export type Slug = Brand<string, "Slug">;

const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const MAX_SLUG_LENGTH = 120;

export function makeSlug(raw: string): Result<Slug, InvalidValueError> {
  const value = raw.trim();
  if (value.length === 0 || value.length > MAX_SLUG_LENGTH || !SLUG_PATTERN.test(value)) {
    return err(
      new InvalidValueError(
        "Slug must be lowercase alphanumeric words separated by single hyphens",
      ),
    );
  }
  return ok(value as Slug);
}
