/**
 * Constrain a post-login redirect to a SAFE same-origin path, preventing open
 * redirects. Only a plain absolute path (`/projects`, `/projects/123`) is allowed;
 * protocol-relative (`//evil.com`), backslash tricks (`/\evil.com`), absolute URLs
 * (`https://…`), and anything else fall back to the default.
 */
export function safeInternalPath(raw: string | null | undefined, fallback = "/projects"): string {
  if (typeof raw !== "string") return fallback;
  const value = raw.trim();
  if (!value.startsWith("/")) return fallback; // must be a rooted path
  if (value.startsWith("//") || value.startsWith("/\\")) return fallback; // protocol-relative
  if (!/^\/[A-Za-z0-9/_\-.]*$/.test(value)) return fallback; // no query/scheme/space/@ etc.
  return value;
}
