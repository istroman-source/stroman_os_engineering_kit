import type { AppErrorOptions } from "@/lib/errors";
import { DomainError } from "../shared";

/** A provider-neutral failure of an AI request (e.g. unavailable, timed out). */
export class AiError extends DomainError {
  constructor(message: string, options: AppErrorOptions = {}) {
    super("UNAVAILABLE", message, options);
  }
}

/** AI output failed to satisfy the domain's recommendation invariants. */
export class InvalidAiRecommendationError extends DomainError {
  constructor(message: string, options: AppErrorOptions = {}) {
    super("VALIDATION", message, options);
  }
}
