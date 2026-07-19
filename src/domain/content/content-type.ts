import { err, ok, type Result } from "@/lib/result";
import { InvalidValueError } from "../shared";

/** The fixed set of knowledge-base content kinds (see PRD knowledge base). */
export const CONTENT_TYPES = [
  "FIRST_PRINCIPLE",
  "PROTOCOL",
  "STANDARD",
  "ENGINE",
  "TOOL",
  "PLAYBOOK",
  "RUBRIC",
  "DECISION_TREE",
  "CASE_STUDY",
  "TAXONOMY_TERM",
  "AI_MODULE",
] as const;

export type ContentType = (typeof CONTENT_TYPES)[number];

export function isContentType(value: string): value is ContentType {
  return (CONTENT_TYPES as readonly string[]).includes(value);
}

export function makeContentType(raw: string): Result<ContentType, InvalidValueError> {
  return isContentType(raw)
    ? ok(raw)
    : err(new InvalidValueError(`Unknown content type: "${raw}"`));
}
