import { err, ok, type Result } from "@/lib/result";
import type { Brand } from "./brand";
import { InvalidValueError } from "./domain-error";

/** A certainty value in the inclusive range [0, 1]. */
export type Confidence = Brand<number, "Confidence">;

export function makeConfidence(value: number): Result<Confidence, InvalidValueError> {
  if (!Number.isFinite(value) || value < 0 || value > 1) {
    return err(new InvalidValueError("Confidence must be a number between 0 and 1"));
  }
  return ok(value as Confidence);
}
