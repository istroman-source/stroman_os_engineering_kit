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
