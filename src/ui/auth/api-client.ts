"use client";

/**
 * Thin browser client for the existing Stroman OS API (Prompt 006B). It calls
 * ONLY our own same-origin routes — never Supabase directly. Same-origin `fetch`
 * automatically sends the session cookie and an `Origin` header, so the server's
 * cookie auth and CSRF/origin checks are satisfied without any client secret.
 */

export class ApiRequestError extends Error {
  readonly status: number;
  readonly code: string;
  constructor(status: number, code: string, message: string) {
    super(message);
    this.name = "ApiRequestError";
    this.status = status;
    this.code = code;
  }
}

async function requestRaw(
  path: string,
  init: RequestInit = {},
): Promise<{ body: unknown; etag: string | null }> {
  const res = await fetch(path, { credentials: "same-origin", ...init });
  const text = await res.text();
  let body: unknown = null;
  if (text) {
    try {
      body = JSON.parse(text) as unknown;
    } catch {
      // Reverse proxies can terminate a long-running upstream request with a
      // plain-text body. Never surface that body (or a JSON parser exception)
      // to the filmmaker UI; preserve a typed signal so the caller can recover.
      throw new ApiRequestError(
        res.status,
        "INVALID_UPSTREAM_RESPONSE",
        "The service returned an unreadable response.",
      );
    }
  }
  if (!res.ok) {
    const err = (body as { error?: { code?: string; message?: string } } | null)?.error;
    throw new ApiRequestError(
      res.status,
      err?.code ?? "REQUEST_FAILED",
      err?.message ?? `Request failed (${res.status}).`,
    );
  }
  return { body, etag: res.headers?.get?.("etag") ?? null };
}

async function request<T>(path: string, init: RequestInit = {}): Promise<T> {
  return (await requestRaw(path, init)).body as T;
}

function postJson<T>(path: string, data: unknown): Promise<T> {
  return request<T>(path, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
}

/** A response body plus its concurrency token (ETag), for mutable resources. */
export interface WithEtag<T> {
  readonly data: T;
  readonly etag: string | null;
}

/** GET a resource and return its body + ETag (for optimistic concurrency). */
export async function apiGetWithEtag<T>(path: string): Promise<WithEtag<T>> {
  const raw = await requestRaw(path, { method: "GET" });
  return { data: raw.body as T, etag: raw.etag };
}

/** POST JSON (optionally with If-Match) and return the body + new ETag. */
export async function apiPostWithEtag<T>(
  path: string,
  data: unknown,
  ifMatch?: string,
): Promise<WithEtag<T>> {
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  if (ifMatch) headers["If-Match"] = ifMatch;
  const raw = await requestRaw(path, { method: "POST", headers, body: JSON.stringify(data) });
  return { data: raw.body as T, etag: raw.etag };
}

/** PATCH JSON with a required optimistic-concurrency token. */
export async function apiPatchWithEtag<T>(
  path: string,
  data: unknown,
  ifMatch: string,
): Promise<WithEtag<T>> {
  const raw = await requestRaw(path, {
    method: "PATCH",
    headers: { "Content-Type": "application/json", "If-Match": ifMatch },
    body: JSON.stringify(data),
  });
  return { data: raw.body as T, etag: raw.etag };
}

/** POST browser-owned multipart data while preserving the standard typed API error contract. */
export async function apiPostForm<T>(path: string, body: FormData): Promise<T> {
  return request<T>(path, { method: "POST", body });
}

export interface ProjectItem {
  readonly id: string;
  readonly name: string;
  readonly status: string;
  readonly createdAt: string;
  readonly updatedAt: string;
  readonly concurrencyToken?: string;
}

export interface PreparedLocationItem {
  readonly id: string;
  readonly name: string;
  readonly inputKind: "GLB" | "PHOTOS";
  readonly status: "DRAFT" | "UPLOADING" | "PROCESSING" | "READY" | "NEEDS_ATTENTION" | "FAILED";
  readonly inputCount: number;
  readonly hasEnvironment: boolean;
  readonly failureCode: string | null;
  readonly createdAt: string;
  readonly updatedAt: string;
}

export interface PreparedLocationEnvironment {
  readonly source: "GLB" | "PHOTOS";
  readonly bounds: {
    readonly min: { readonly x: number; readonly y: number; readonly z: number };
    readonly max: { readonly x: number; readonly y: number; readonly z: number };
  };
  readonly sourceToCanonical: readonly number[];
  readonly scaleMetersPerUnit: number;
  readonly scaleConfidence: "ESTIMATED";
}

export interface PreparedLocationDetail extends PreparedLocationItem {
  readonly photoCount: number;
  readonly environment: PreparedLocationEnvironment | null;
}

/** Session state for the app-shell UX. Server authorization remains authoritative. */
export type SessionState =
  | { readonly state: "SIGNED_OUT" }
  | { readonly state: "PRIVATE_BETA_DENIED" }
  | { readonly state: "UNAVAILABLE" }
  | { readonly state: "AUTHORIZED" };

export async function getSession(): Promise<SessionState> {
  try {
    const body = await request<{ authenticated: boolean; privateBetaAccess: boolean }>(
      "/api/auth/session",
      { method: "GET" },
    );
    if (!body.authenticated) return { state: "SIGNED_OUT" };
    return body.privateBetaAccess ? { state: "AUTHORIZED" } : { state: "PRIVATE_BETA_DENIED" };
  } catch (error) {
    if (error instanceof ApiRequestError && error.status === 401) {
      return { state: "SIGNED_OUT" };
    }
    return { state: "UNAVAILABLE" };
  }
}

/** Begin email OTP sign-in. Resolves on success; throws ApiRequestError otherwise. */
export function startOtp(email: string): Promise<{ message: string }> {
  return postJson("/api/auth/start", { email });
}

/** Verify an email OTP; on success the server sets the session cookies. */
export function verifyOtp(email: string, token: string): Promise<{ authenticated: boolean }> {
  return postJson("/api/auth/verify", { email, token });
}

/**
 * Complete a magic-link sign-in. The browser passes the provider session it read
 * from the redirect fragment; the server re-verifies the access token and sets the
 * HttpOnly session cookies. Tokens are held in memory only for this one call.
 */
export function completeCallback(input: {
  accessToken: string;
  refreshToken: string;
  expiresInSeconds?: number;
}): Promise<{ authenticated: boolean }> {
  return postJson("/api/auth/callback", input);
}

/** End the session (clears cookies server-side). CSRF-protected same-origin POST. */
export function signOut(): Promise<{ ok: boolean }> {
  return request("/api/auth/sign-out", { method: "POST" });
}

/** List the authenticated owner's projects. */
export async function listProjects(): Promise<ProjectItem[]> {
  const body = await request<{ items: ProjectItem[] }>("/api/v1/projects", { method: "GET" });
  return body.items ?? [];
}

/** Create a project owned by the authenticated user. */
export function createProject(name: string): Promise<ProjectItem> {
  return postJson("/api/v1/projects", { name });
}

export async function listPreparedLocations(): Promise<PreparedLocationItem[]> {
  const body = await request<{ items: PreparedLocationItem[] }>("/api/v1/locations", {
    method: "GET",
  });
  return body.items ?? [];
}

export function createPreparedLocation(input: {
  name: string;
  inputKind: "GLB" | "PHOTOS";
}): Promise<PreparedLocationItem> {
  return postJson<{ location: PreparedLocationItem }>("/api/v1/locations", input).then(
    (body) => body.location,
  );
}

export function getPreparedLocation(locationId: string): Promise<PreparedLocationDetail> {
  return request<{ location: PreparedLocationDetail }>(
    `/api/v1/locations/${encodeURIComponent(locationId)}`,
    { method: "GET" },
  ).then((body) => body.location);
}

export function renamePreparedLocation(
  locationId: string,
  name: string,
): Promise<PreparedLocationDetail> {
  return request<{ location: PreparedLocationDetail }>(
    `/api/v1/locations/${encodeURIComponent(locationId)}`,
    {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name }),
    },
  ).then((body) => body.location);
}

export function uploadPreparedLocationGlb(
  locationId: string,
  file: File,
): Promise<PreparedLocationItem> {
  const form = new FormData();
  form.set("file", file);
  return apiPostForm<{ location: PreparedLocationItem }>(
    `/api/v1/locations/${encodeURIComponent(locationId)}/glb`,
    form,
  ).then((body) => body.location);
}

export function uploadPreparedLocationPhotos(
  locationId: string,
  files: File[],
  onProgress?: (completed: number, total: number) => void,
): Promise<PreparedLocationItem> {
  return files
    .reduce<Promise<PreparedLocationItem | null>>(async (previous, file, index) => {
      await previous;
      const form = new FormData();
      form.append("files", file);
      const location = (
        await apiPostForm<{ location: PreparedLocationItem }>(
          `/api/v1/locations/${encodeURIComponent(locationId)}/photos`,
          form,
        )
      ).location;
      onProgress?.(index + 1, files.length);
      return location;
    }, Promise.resolve(null))
    .then((location) => {
      if (!location) throw new Error("Choose at least one room photo.");
      return location;
    });
}

export function startPreparedLocationReconstruction(
  locationId: string,
): Promise<{ id: string; status: string }> {
  return apiPostForm<{ reconstruction: { id: string; status: string } }>(
    `/api/v1/locations/${encodeURIComponent(locationId)}/reconstruct`,
    new FormData(),
  ).then((body) => body.reconstruction);
}

/** Fetch a single project (owner-scoped) for the workspace header. */
export function getProject(projectId: string): Promise<ProjectItem> {
  return apiGetWithEtag<ProjectItem>(`/api/v1/projects/${encodeURIComponent(projectId)}`).then(
    ({ data, etag }) => ({ ...data, concurrencyToken: etag ?? undefined }),
  );
}

/** Rename a project using the exact state last loaded by the browser. */
export function renameProject(
  projectId: string,
  name: string,
  concurrencyToken: string,
): Promise<ProjectItem> {
  return apiPatchWithEtag<ProjectItem>(
    `/api/v1/projects/${encodeURIComponent(projectId)}`,
    { name },
    concurrencyToken,
  ).then(({ data, etag }) => ({ ...data, concurrencyToken: etag ?? undefined }));
}

export type ProjectLifecycleAction = "activate" | "complete" | "archive" | "reopen";

/** Apply a project lifecycle action using the exact state last loaded by the browser. */
export function updateProjectLifecycle(
  projectId: string,
  action: ProjectLifecycleAction,
  concurrencyToken: string,
): Promise<ProjectItem> {
  return apiPostWithEtag<ProjectItem>(
    `/api/v1/projects/${encodeURIComponent(projectId)}/${action}`,
    {},
    concurrencyToken,
  ).then(({ data, etag }) => ({ ...data, concurrencyToken: etag ?? undefined }));
}

/** Map an API failure to a safe, user-facing message (no provider/internal detail). */
export function friendlyError(err: unknown): string {
  const code = (err as { code?: string } | null)?.code;
  const status = (err as { status?: number } | null)?.status;
  switch (code) {
    case "INVALID_OTP":
      return "That code is invalid or has expired. Request a new one.";
    case "RATE_LIMITED":
      return "Too many attempts. Please wait a minute and try again.";
    // 503 — a required upstream service (auth provider, identity store) is down.
    case "AUTHENTICATION_UNAVAILABLE":
    case "SERVICE_UNAVAILABLE":
      return "A required service is unavailable.";
    // 401 — no/expired session (refresh already attempted server-side and failed).
    case "AUTHENTICATION_REQUIRED":
    case "INVALID_SESSION":
      return "Your session expired. Please sign in again.";
    // 403 — authenticated but not permitted (owner scope, disabled account, CSRF).
    case "FORBIDDEN":
    case "ACCOUNT_DISABLED":
    case "REQUEST_ORIGIN_REJECTED":
      return "You do not have permission to access this resource.";
    case "PRIVATE_BETA_ACCESS_REQUIRED":
      return "Stroman OS is currently in private testing. This account does not have access yet.";
    case "ACCESS_CONTROL_UNAVAILABLE":
      return "Private access verification is temporarily unavailable.";
    case "INVALID_UPSTREAM_RESPONSE":
      return "The service returned an unexpected response. Please try again.";
    case "CREATIVE_DEVELOPMENT_PENDING":
      return "Creative development is still finishing. Keep this page open or return shortly; do not submit it again.";
    case "VALIDATION_FAILED":
    case "MALFORMED_JSON":
      return "Please check your input and try again.";
    default:
      // Fall back to status when the code is unrecognized, so new server codes
      // still map to the correct family of message.
      if (status === 401) return "Your session expired. Please sign in again.";
      if (status === 403) return "You do not have permission to access this resource.";
      if (status === 503) return "A required service is unavailable.";
      return (
        (err as { message?: string } | null)?.message ?? "Something went wrong. Please try again."
      );
  }
}

/** The HTTP status of an ApiRequestError, or undefined. */
export function errorStatus(err: unknown): number | undefined {
  return (err as { status?: number } | null)?.status;
}
