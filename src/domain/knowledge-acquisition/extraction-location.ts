import { err, ok, type Result } from "@/lib/result";
import { InvalidValueError } from "@/domain/shared";

/**
 * Exactly where within a source document an observation was drawn from. Every
 * field is optional so a location can capture whichever coordinate system fits the
 * document — a quoted span, character offsets, a timestamp range (transcripts /
 * video), or a page number (PDFs) — supporting complete traceability to evidence.
 */
export interface ExtractionLocation {
  readonly textSpan: string | null;
  readonly charStart: number | null;
  readonly charEnd: number | null;
  readonly timeStartMs: number | null;
  readonly timeEndMs: number | null;
  readonly pageNumber: number | null;
}

export interface ExtractionLocationInput {
  readonly textSpan?: string | null;
  readonly charStart?: number | null;
  readonly charEnd?: number | null;
  readonly timeStartMs?: number | null;
  readonly timeEndMs?: number | null;
  readonly pageNumber?: number | null;
}

function optionalOffset(
  value: number | null | undefined,
  label: string,
): Result<number | null, InvalidValueError> {
  if (value === null || value === undefined) return ok(null);
  if (!Number.isInteger(value) || value < 0) {
    return err(new InvalidValueError(`${label} must be a non-negative integer`));
  }
  return ok(value);
}

/** Validate and normalize an extraction location. Blank text spans become null. */
export function makeExtractionLocation(
  input: ExtractionLocationInput,
): Result<ExtractionLocation | null, InvalidValueError> {
  const textSpan =
    input.textSpan == null || input.textSpan.trim() === "" ? null : input.textSpan.trim();

  const charStart = optionalOffset(input.charStart, "Character start");
  if (!charStart.ok) return charStart;
  const charEnd = optionalOffset(input.charEnd, "Character end");
  if (!charEnd.ok) return charEnd;
  if (charStart.value !== null && charEnd.value !== null && charEnd.value < charStart.value) {
    return err(new InvalidValueError("Character end must be greater than or equal to start"));
  }

  const timeStartMs = optionalOffset(input.timeStartMs, "Time start (ms)");
  if (!timeStartMs.ok) return timeStartMs;
  const timeEndMs = optionalOffset(input.timeEndMs, "Time end (ms)");
  if (!timeEndMs.ok) return timeEndMs;
  if (
    timeStartMs.value !== null &&
    timeEndMs.value !== null &&
    timeEndMs.value < timeStartMs.value
  ) {
    return err(new InvalidValueError("Time end must be greater than or equal to start"));
  }

  let pageNumber: number | null = null;
  if (input.pageNumber !== null && input.pageNumber !== undefined) {
    if (!Number.isInteger(input.pageNumber) || input.pageNumber < 1) {
      return err(new InvalidValueError("Page number must be an integer of at least 1"));
    }
    pageNumber = input.pageNumber;
  }

  const location: ExtractionLocation = {
    textSpan,
    charStart: charStart.value,
    charEnd: charEnd.value,
    timeStartMs: timeStartMs.value,
    timeEndMs: timeEndMs.value,
    pageNumber,
  };

  return ok(Object.values(location).every((value) => value === null) ? null : location);
}
