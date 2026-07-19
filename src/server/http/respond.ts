import "server-only";

import { z } from "zod";
import type { AppError } from "@/lib/errors";
import { logger } from "@/lib/logging";
import type { Result } from "@/lib/result";
import { resolveRequestId } from "./context";
import { makeEtag, parseIfMatch } from "./etag";
import { errorResponse, type FieldError, HttpError } from "./http-error";

const log = logger.child({ scope: "http" });

/** Build a JSON success response with request-id and private (no-store) caching. */
export function json(
  body: unknown,
  opts: { requestId: string; status?: number; etag?: string; headers?: Record<string, string> },
): Response {
  const headers: Record<string, string> = {
    "X-Request-Id": opts.requestId,
    "Cache-Control": "no-store",
    "X-Content-Type-Options": "nosniff",
    ...(opts.etag ? { ETag: opts.etag } : {}),
    ...opts.headers,
  };
  return Response.json(body, { status: opts.status ?? 200, headers });
}

/** Map a use-case Result to an HTTP response, attaching an ETag for mutable resources. */
export function sendResult<V>(
  result: Result<V, AppError>,
  opts: {
    requestId: string;
    status?: number;
    serialize: (value: V) => unknown;
    resource?: string;
    version?: (value: V) => number;
  },
): Response {
  if (!result.ok) return errorResponse(result.error, opts.requestId);
  const etag =
    opts.resource && opts.version ? makeEtag(opts.resource, opts.version(result.value)) : undefined;
  return json(opts.serialize(result.value), {
    requestId: opts.requestId,
    status: opts.status ?? 200,
    etag,
  });
}

/** Map a list Result to a `{ items: [...] }` response (or an error response). */
export function sendList<V>(
  result: Result<readonly V[], AppError>,
  opts: { requestId: string; item: (value: V) => unknown },
): Response {
  if (!result.ok) return errorResponse(result.error, opts.requestId);
  return json({ items: result.value.map(opts.item) }, { requestId: opts.requestId });
}

function toFieldErrors(error: z.ZodError): FieldError[] {
  return error.issues.map((issue) => ({
    path: issue.path.join("."),
    code: issue.code,
    message: issue.message,
  }));
}

/** Parse and validate a JSON request body; throws stable HttpErrors on failure. */
export async function parseJson<T>(req: Request, schema: z.ZodType<T>): Promise<T> {
  const contentType = req.headers.get("content-type") ?? "";
  if (!contentType.toLowerCase().includes("application/json")) {
    throw new HttpError(415, "UNSUPPORTED_MEDIA_TYPE", "Expected application/json.");
  }
  let raw: unknown;
  try {
    raw = await req.json();
  } catch {
    throw new HttpError(400, "MALFORMED_JSON", "The request body is not valid JSON.");
  }
  const parsed = schema.safeParse(raw);
  if (!parsed.success) {
    throw new HttpError(
      400,
      "VALIDATION_FAILED",
      "The request is invalid.",
      toFieldErrors(parsed.error),
    );
  }
  return parsed.data;
}

/** Validate an opaque path identifier with the given domain id parser. */
export function parsePathId<T>(raw: string, parse: (value: string) => Result<T, unknown>): T {
  const result = parse(decodeURIComponent(raw));
  if (!result.ok) throw new HttpError(400, "INVALID_ID", "The resource identifier is malformed.");
  return result.value;
}

/**
 * Require a well-formed `If-Match` precondition for a mutation, returning the
 * expected version. Missing → 428 Precondition Required; malformed or wrong
 * resource type → 400 Bad Request.
 */
export function requireIfMatch(req: Request, resource: string): number {
  const outcome = parseIfMatch(req.headers.get("if-match"), resource);
  if (outcome.kind === "missing") {
    throw new HttpError(428, "PRECONDITION_REQUIRED", "An If-Match precondition is required.");
  }
  if (outcome.kind === "malformed") {
    throw new HttpError(400, "INVALID_PRECONDITION", "The If-Match precondition is malformed.");
  }
  return outcome.version;
}

type NextRouteContext<P> = { params: Promise<P> } | undefined;

/**
 * Wrap a route handler: resolve the request id, await params, run the handler, and
 * turn any thrown HttpError/AppError/unexpected error into a stable error response.
 * Emits one safe structured log line per request (no bodies, actor values, or
 * secrets).
 */
export function apiRoute<P = Record<string, never>>(
  handler: (args: { req: Request; params: P; requestId: string }) => Promise<Response>,
) {
  return async (req: Request, context?: NextRouteContext<P>): Promise<Response> => {
    const requestId = resolveRequestId(req.headers);
    const startedAt = Date.now();
    const path = new URL(req.url).pathname;
    try {
      const params = context ? await context.params : ({} as P);
      const response = await handler({ req, params, requestId });
      log.info("request", {
        requestId,
        method: req.method,
        path,
        status: response.status,
        durationMs: Date.now() - startedAt,
      });
      return response;
    } catch (error) {
      const response = errorResponse(error, requestId);
      log.warn("request_error", {
        requestId,
        method: req.method,
        path,
        status: response.status,
        durationMs: Date.now() - startedAt,
        category: response.status >= 500 ? "server" : "client",
      });
      return response;
    }
  };
}
