import { err, ok, type Result } from "@/lib/result";
import type { Brand } from "./brand";
import { InvalidValueError } from "./domain-error";

/** An evaluation score: an integer on the 1–10 scale. */
export type Score = Brand<number, "Score">;

export const MIN_SCORE = 1;
export const MAX_SCORE = 10;

export function makeScore(value: number): Result<Score, InvalidValueError> {
  if (!Number.isInteger(value) || value < MIN_SCORE || value > MAX_SCORE) {
    return err(
      new InvalidValueError(`Score must be an integer between ${MIN_SCORE} and ${MAX_SCORE}`),
    );
  }
  return ok(value as Score);
}
