type RouteHandler<P> = (req: Request, context?: { params: Promise<P> }) => Promise<Response>;

export interface CallOptions<P> {
  readonly method?: string;
  readonly actor?: string;
  readonly requestId?: string;
  readonly ifMatch?: string;
  readonly params?: P;
  readonly json?: unknown;
  readonly rawBody?: string;
  /** Explicit content-type; pass null to omit it. Defaults to application/json when a body is present. */
  readonly contentType?: string | null;
}

export interface CallResult {
  readonly status: number;
  readonly headers: Headers;
  readonly body: unknown;
}

/**
 * Invoke a Next.js Route Handler with a real Request and parse its Response —
 * exercising genuine HTTP semantics (method, headers, JSON, status) without a
 * running server.
 */
export async function call<P extends Record<string, string> = Record<string, never>>(
  handler: RouteHandler<P>,
  opts: CallOptions<P> = {},
): Promise<CallResult> {
  const headers = new Headers();
  const hasBody = opts.json !== undefined || opts.rawBody !== undefined;
  if (hasBody && opts.contentType !== null) {
    headers.set("content-type", opts.contentType ?? "application/json");
  } else if (opts.contentType) {
    headers.set("content-type", opts.contentType);
  }
  if (opts.actor !== undefined) headers.set("x-stroman-actor-id", opts.actor);
  if (opts.requestId !== undefined) headers.set("x-request-id", opts.requestId);
  if (opts.ifMatch !== undefined) headers.set("if-match", opts.ifMatch);

  const body = opts.rawBody ?? (opts.json !== undefined ? JSON.stringify(opts.json) : undefined);
  const req = new Request("http://localhost/api", { method: opts.method ?? "GET", headers, body });
  const context = opts.params ? { params: Promise.resolve(opts.params) } : undefined;

  const res = await handler(req, context);
  const text = await res.text();
  return { status: res.status, headers: res.headers, body: text ? JSON.parse(text) : null };
}
