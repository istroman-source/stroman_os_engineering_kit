import { OptimisticConcurrencyError } from "@/lib/errors";
import { err, ok, type Result } from "@/lib/result";
import { RepositoryError } from "./errors";

/**
 * Run a repository/port operation, translating any thrown failure into a safe
 * `RepositoryError`. This is how the application keeps infrastructure error
 * detail from leaking into use-case results while still surfacing failure.
 */
export async function attempt<T>(
  operation: string,
  run: () => Promise<T>,
): Promise<Result<T, RepositoryError>> {
  try {
    return ok(await run());
  } catch (cause) {
    return err(new RepositoryError(operation, { cause }));
  }
}

/**
 * Run an update operation, surfacing an optimistic-concurrency conflict as its own
 * typed failure (so a caller/delivery layer can distinguish a stale write from a
 * generic storage error) and any other failure as a safe `RepositoryError`.
 */
export async function attemptUpdate(
  operation: string,
  run: () => Promise<void>,
): Promise<Result<void, OptimisticConcurrencyError | RepositoryError>> {
  try {
    await run();
    return ok(undefined);
  } catch (cause) {
    if (cause instanceof OptimisticConcurrencyError) return err(cause);
    return err(new RepositoryError(operation, { cause }));
  }
}
