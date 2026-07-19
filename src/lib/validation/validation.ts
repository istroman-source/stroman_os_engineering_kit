import { z } from "zod";
import { ValidationError } from "@/lib/errors";
import { err, ok, type Result } from "@/lib/result";

/**
 * Validation helpers built on Zod.
 *
 * `validate` bridges Zod parsing into the Result + AppError conventions used
 * across the codebase, so boundary validation is uniform and never throws for
 * expected bad input.
 */

/** Flatten a ZodError into human-readable "path: message" strings. */
export function formatIssues(error: z.ZodError): string[] {
  return error.issues.map((issue) => `${issue.path.join(".") || "(root)"}: ${issue.message}`);
}

export function validate<T>(schema: z.ZodType<T>, data: unknown): Result<T, ValidationError> {
  const parsed = schema.safeParse(data);
  if (parsed.success) return ok(parsed.data);
  const issues = formatIssues(parsed.error);
  return err(new ValidationError(issues.join("; "), { context: { issues } }));
}
