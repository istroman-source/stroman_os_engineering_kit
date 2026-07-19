/**
 * Application error taxonomy.
 *
 * A small, explicit set of error kinds carrying a stable machine code and an
 * HTTP status. Operational errors (expected, caused by input or state) are
 * distinguished from programmer errors so we can decide what is safe to expose.
 */

export type ErrorCode =
  | "VALIDATION"
  | "UNAUTHORIZED"
  | "FORBIDDEN"
  | "NOT_FOUND"
  | "CONFLICT"
  | "RATE_LIMITED"
  | "UNAVAILABLE"
  | "INTERNAL";

const HTTP_STATUS: Record<ErrorCode, number> = {
  VALIDATION: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  RATE_LIMITED: 429,
  UNAVAILABLE: 503,
  INTERNAL: 500,
};

export interface AppErrorOptions {
  readonly cause?: unknown;
  readonly context?: Record<string, unknown>;
}

export class AppError extends Error {
  readonly code: ErrorCode;
  readonly httpStatus: number;
  readonly isOperational: boolean;
  readonly context: Record<string, unknown> | undefined;

  constructor(code: ErrorCode, message: string, options: AppErrorOptions = {}) {
    super(message, options.cause !== undefined ? { cause: options.cause } : undefined);
    this.name = new.target.name;
    this.code = code;
    this.httpStatus = HTTP_STATUS[code];
    this.isOperational = true;
    this.context = options.context;
  }

  /** Safe, serializable representation. Never includes the raw cause. */
  toJSON(): { name: string; code: ErrorCode; message: string; httpStatus: number } {
    return {
      name: this.name,
      code: this.code,
      message: this.message,
      httpStatus: this.httpStatus,
    };
  }
}

export class ValidationError extends AppError {
  constructor(message = "Validation failed", options: AppErrorOptions = {}) {
    super("VALIDATION", message, options);
  }
}

export class UnauthorizedError extends AppError {
  constructor(message = "Authentication required", options: AppErrorOptions = {}) {
    super("UNAUTHORIZED", message, options);
  }
}

export class ForbiddenError extends AppError {
  constructor(message = "Access denied", options: AppErrorOptions = {}) {
    super("FORBIDDEN", message, options);
  }
}

export class NotFoundError extends AppError {
  constructor(message = "Resource not found", options: AppErrorOptions = {}) {
    super("NOT_FOUND", message, options);
  }
}

export class ConflictError extends AppError {
  constructor(message = "Conflicting state", options: AppErrorOptions = {}) {
    super("CONFLICT", message, options);
  }
}

export function isAppError(value: unknown): value is AppError {
  return value instanceof AppError;
}

/** Normalize any thrown value into an AppError (non-AppError → INTERNAL). */
export function toAppError(value: unknown): AppError {
  if (isAppError(value)) return value;
  const message = value instanceof Error ? value.message : "Unexpected error";
  return new AppError("INTERNAL", message, { cause: value });
}
