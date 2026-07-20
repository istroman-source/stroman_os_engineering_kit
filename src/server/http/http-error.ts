import { AppError, OptimisticConcurrencyError } from "@/lib/errors";
import { InvalidStateTransitionError } from "@/domain/shared";

/**
 * A failure raised at the HTTP boundary itself (bad request, unsupported media,
 * missing/malformed precondition, actor problems). Distinct from application
 * `AppError`s, which are mapped centrally below. Throw these from route handlers;
 * `apiRoute` turns them into a stable error response.
 */
export interface FieldError {
  readonly path: string;
  readonly code: string;
  readonly message: string;
}

export class HttpError extends Error {
  readonly status: number;
  readonly code: string;
  readonly fields: readonly FieldError[] | undefined;
  /** Extra response headers (e.g. `WWW-Authenticate`). Never carries secrets. */
  readonly headers: Readonly<Record<string, string>> | undefined;
  constructor(
    status: number,
    code: string,
    message: string,
    fields?: readonly FieldError[],
    headers?: Readonly<Record<string, string>>,
  ) {
    super(message);
    this.name = "HttpError";
    this.status = status;
    this.code = code;
    this.fields = fields;
    this.headers = headers;
  }
}

interface ResponseParts {
  readonly status: number;
  readonly code: string;
  readonly message: string;
  readonly fields?: readonly FieldError[];
  readonly headers?: Readonly<Record<string, string>>;
}

/**
 * Map an application `AppError` to stable HTTP parts using only NEUTRAL contracts
 * (error subclass + code) — never Prisma codes, SQLSTATE, or constraint names,
 * which infrastructure has already translated below the HTTP boundary.
 */
function appErrorToParts(error: AppError): ResponseParts {
  if (error instanceof OptimisticConcurrencyError) {
    return {
      status: 409,
      code: "CONCURRENCY_CONFLICT",
      message: "The resource was modified by another writer.",
    };
  }
  if (error instanceof InvalidStateTransitionError) {
    return { status: 409, code: "INVALID_STATE_TRANSITION", message: error.message };
  }
  switch (error.code) {
    case "NOT_FOUND":
      return { status: 404, code: "NOT_FOUND", message: error.message };
    case "FORBIDDEN":
      return {
        status: 403,
        code: "FORBIDDEN",
        message: "You do not have access to this resource.",
      };
    case "UNAUTHORIZED":
      return { status: 401, code: "UNAUTHORIZED", message: "Authentication is required." };
    case "CONFLICT":
      return { status: 409, code: "CONFLICT", message: error.message };
    case "VALIDATION":
      return { status: 422, code: "UNPROCESSABLE_ENTITY", message: error.message };
    case "RATE_LIMITED":
      return { status: 429, code: "RATE_LIMITED", message: "Too many requests." };
    case "UNAVAILABLE":
      return {
        status: 503,
        code: "SERVICE_UNAVAILABLE",
        message: "A required service is unavailable.",
      };
    default:
      return { status: 500, code: "INTERNAL", message: "An unexpected error occurred." };
  }
}

function toParts(error: unknown): ResponseParts {
  if (error instanceof HttpError) {
    return {
      status: error.status,
      code: error.code,
      message: error.message,
      fields: error.fields,
      headers: error.headers,
    };
  }
  if (error instanceof AppError) return appErrorToParts(error);
  return { status: 500, code: "INTERNAL", message: "An unexpected error occurred." };
}

/** Build the stable JSON error response. Never leaks causes, SQL, or stack traces. */
export function errorResponse(error: unknown, requestId: string): Response {
  const parts = toParts(error);
  const body = {
    error: {
      code: parts.code,
      message: parts.message,
      requestId,
      ...(parts.fields ? { fields: parts.fields } : {}),
    },
  };
  return Response.json(body, {
    status: parts.status,
    headers: { "X-Request-Id": requestId, "Cache-Control": "no-store", ...parts.headers },
  });
}
