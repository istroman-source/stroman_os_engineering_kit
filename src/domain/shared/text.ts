import { err, ok, type Result } from "@/lib/result";
import { InvalidValueError } from "./domain-error";

export interface BoundedTextOptions {
  readonly label: string;
  readonly min?: number;
  readonly max: number;
}

/**
 * Validate and normalize free text used to build branded text value objects.
 * Trims surrounding whitespace, then enforces min/max length. Shared so every
 * text value object validates consistently instead of duplicating rules.
 */
export function validateBoundedText(
  raw: string,
  options: BoundedTextOptions,
): Result<string, InvalidValueError> {
  const min = options.min ?? 1;
  const value = raw.trim();
  if (value.length < min) {
    return err(new InvalidValueError(`${options.label} must be at least ${min} character(s)`));
  }
  if (value.length > options.max) {
    return err(new InvalidValueError(`${options.label} must be at most ${options.max} characters`));
  }
  return ok(value);
}
