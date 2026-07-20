type RouteHandler<P> = (req: Request, context?: { params: Promise<P> }) => Promise<Response>;

/** The app's own origin in the test environment (NEXT_PUBLIC_APP_URL default). */
export const TEST_ORIGIN = "http://localhost:3000";

export interface CallOptions<P> {
  readonly method?: string;
  readonly requestId?: string;
  readonly ifMatch?: string;
  readonly params?: P;
  readonly json?: unknown;
  readonly rawBody?: string;
  /** Explicit content-type; pass null to omit it. Defaults to application/json when a body is present. */
  readonly contentType?: string | null;
  /** Synthetic verified subject for the test authenticator (omit → anonymous). */
  readonly principal?: string;
  /** Synthetic verified email for the test authenticator. */
  readonly email?: string;
  /** Credential source the test authenticator reports (default cookie). */
  readonly via?: "cookie" | "bearer";
  /**
   * Origin header. Defaults to the app origin for unsafe cookie requests so CSRF
   * passes; pass null to omit it (to exercise a rejected origin), or a string to
   * override.
   */
  readonly origin?: string | null;
  /** Raw Cookie header (for auth flow tests). */
  readonly cookie?: string;
  /** Arbitrary extra headers. */
  readonly headers?: Record<string, string>;
}

export interface CallResult {
  readonly status: number;
  readonly headers: Headers;
  readonly body: unknown;
}

const UNSAFE = new Set(["POST", "PUT", "PATCH", "DELETE"]);

/**
 * Invoke a Next.js Route Handler with a real Request and parse its Response —
 * exercising genuine HTTP semantics (method, headers, JSON, status) without a
 * running server. Authentication is via the injected test authenticator's
 * synthetic headers, never a production credential path.
 */
export async function call<P extends Record<string, string> = Record<string, never>>(
  handler: RouteHandler<P>,
  opts: CallOptions<P> = {},
): Promise<CallResult> {
  const method = opts.method ?? "GET";
  const headers = new Headers();
  const hasBody = opts.json !== undefined || opts.rawBody !== undefined;
  if (hasBody && opts.contentType !== null) {
    headers.set("content-type", opts.contentType ?? "application/json");
  } else if (opts.contentType) {
    headers.set("content-type", opts.contentType);
  }
  if (opts.requestId !== undefined) headers.set("x-request-id", opts.requestId);
  if (opts.ifMatch !== undefined) headers.set("if-match", opts.ifMatch);
  if (opts.principal !== undefined) headers.set("x-test-principal", opts.principal);
  if (opts.email !== undefined) headers.set("x-test-email", opts.email);
  if (opts.via !== undefined) headers.set("x-test-via", opts.via);
  if (opts.cookie !== undefined) headers.set("cookie", opts.cookie);

  const via = opts.via ?? "cookie";
  const needsOrigin = UNSAFE.has(method.toUpperCase()) && via === "cookie";
  if (opts.origin === null) {
    // omit
  } else if (opts.origin !== undefined) {
    headers.set("origin", opts.origin);
  } else if (needsOrigin) {
    headers.set("origin", TEST_ORIGIN);
  }

  for (const [key, value] of Object.entries(opts.headers ?? {})) headers.set(key, value);

  const body = opts.rawBody ?? (opts.json !== undefined ? JSON.stringify(opts.json) : undefined);
  const req = new Request("http://localhost/api", { method, headers, body });
  const context = opts.params ? { params: Promise.resolve(opts.params) } : undefined;

  const res = await handler(req, context);
  const text = await res.text();
  return { status: res.status, headers: res.headers, body: text ? JSON.parse(text) : null };
}
