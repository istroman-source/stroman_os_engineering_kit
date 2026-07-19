import { ok, type Result } from "@/lib/result";
import { type Brand, type InvalidValueError, validateBoundedText } from "../shared";

/** A project's human-readable name. */
export type ProjectName = Brand<string, "ProjectName">;

export function makeProjectName(raw: string): Result<ProjectName, InvalidValueError> {
  const result = validateBoundedText(raw, { label: "Project name", max: 200 });
  return result.ok ? ok(result.value as ProjectName) : result;
}
