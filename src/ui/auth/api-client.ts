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
  const body = text ? (JSON.parse(text) as unknown) : null;
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

export interface ProjectItem {
  readonly id: string;
  readonly name: string;
  readonly status: string;
  readonly createdAt: string;
  readonly updatedAt: string;
  readonly concurrencyToken?: string;
}

/** True if the caller has a valid session. Never throws (treats errors as signed-out). */
export async function getSession(): Promise<boolean> {
  try {
    const body = await request<{ authenticated: boolean }>("/api/auth/session", { method: "GET" });
    return body.authenticated === true;
  } catch {
    return false;
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

/** Fetch a single project (owner-scoped) for the workspace header. */
export function getProject(projectId: string): Promise<ProjectItem> {
  return request<ProjectItem>(`/api/v1/projects/${encodeURIComponent(projectId)}`, {
    method: "GET",
  });
}

/** Map an API failure to a safe, user-facing message (no provider/internal detail). */
export function friendlyError(err: unknown): string {
  const code = (err as { code?: string } | null)?.code;
  switch (code) {
    case "INVALID_OTP":
      return "That code is invalid or has expired. Request a new one.";
    case "RATE_LIMITED":
      return "Too many attempts. Please wait a minute and try again.";
    case "AUTHENTICATION_UNAVAILABLE":
      return "Sign-in is temporarily unavailable. Please try again shortly.";
    case "AUTHENTICATION_REQUIRED":
    case "INVALID_SESSION":
      return "Your session has ended. Please sign in again.";
    case "VALIDATION_FAILED":
    case "MALFORMED_JSON":
      return "Please check your input and try again.";
    default:
      return (
        (err as { message?: string } | null)?.message ?? "Something went wrong. Please try again."
      );
  }
}

/** The HTTP status of an ApiRequestError, or undefined. */
export function errorStatus(err: unknown): number | undefined {
  return (err as { status?: number } | null)?.status;
}
