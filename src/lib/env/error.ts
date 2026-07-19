import { z } from "zod";

/** Shared error type + formatter for environment validation (client and server). */
export class EnvironmentValidationError extends Error {
  readonly issues: readonly string[];
  constructor(issues: readonly string[]) {
    super(`Invalid environment configuration:\n${issues.map((i) => `  - ${i}`).join("\n")}`);
    this.name = "EnvironmentValidationError";
    this.issues = issues;
  }
}

export function issuesFromZodError(error: z.ZodError): string[] {
  return error.issues.map((issue) => `${issue.path.join(".") || "(root)"}: ${issue.message}`);
}
