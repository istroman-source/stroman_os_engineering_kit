import { AppError, type AppErrorOptions } from "@/lib/errors";

/**
 * Base class for expected domain failures. Extends the repository's `AppError`
 * (per the accepted error architecture) so domain errors carry a stable code and
 * safe serialization, while remaining framework- and provider-free.
 */
export abstract class DomainError extends AppError {}

/** A value object or identifier failed validation. */
export class InvalidValueError extends DomainError {
  constructor(message: string, options: AppErrorOptions = {}) {
    super("VALIDATION", message, options);
  }
}

/** An aggregate was asked to make an illegal lifecycle transition. */
export class InvalidStateTransitionError extends DomainError {
  readonly entity: string;
  readonly from: string;
  readonly to: string;

  constructor(entity: string, from: string, to: string) {
    super("CONFLICT", `Invalid ${entity} transition: ${from} -> ${to}`, {
      context: { entity, from, to },
    });
    this.entity = entity;
    this.from = from;
    this.to = to;
  }
}
