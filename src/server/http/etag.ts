/**
 * Concurrency tokens over HTTP via ETag / If-Match. The internal `lockVersion` is
 * never exposed as a bare number in the body; it is encoded in an opaque,
 * resource-scoped ETag so a token cannot be swapped between resource types or ids.
 *
 * Format: strong ETag `"<resource>:<version>"`, e.g. `"project:3"`.
 */

export function makeEtag(resource: string, version: number): string {
  return `"${resource}:${version}"`;
}

export type IfMatchOutcome =
  | { readonly kind: "ok"; readonly version: number }
  | { readonly kind: "missing" } // → 428 Precondition Required
  | { readonly kind: "malformed" }; // → 400 Bad Request

/**
 * Parse an `If-Match` header for the given resource type. The token must match the
 * resource and carry a non-negative integer version; anything else is malformed.
 */
export function parseIfMatch(header: string | null, resource: string): IfMatchOutcome {
  if (header === null || header.trim() === "") return { kind: "missing" };
  const match = /^"([a-z]+):(\d+)"$/.exec(header.trim());
  if (!match) return { kind: "malformed" };
  const [, tokenResource, rawVersion] = match;
  if (tokenResource !== resource) return { kind: "malformed" };
  const version = Number(rawVersion);
  if (!Number.isInteger(version) || version < 0) return { kind: "malformed" };
  return { kind: "ok", version };
}
