import type { Result } from "@/lib/result";
import { PersistenceMappingError } from "../errors";

/**
 * Unwrap a domain validation `Result` when mapping a persisted value into the
 * domain. A failure means the database holds data the domain considers invalid
 * (corruption) — surfaced as a controlled mapping error, never silently repaired.
 */
export function orThrowMapping<T>(result: Result<T, unknown>, detail: string): T {
  if (!result.ok) {
    throw new PersistenceMappingError(detail);
  }
  return result.value;
}
