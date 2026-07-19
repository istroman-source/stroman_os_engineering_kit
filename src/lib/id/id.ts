/**
 * Identifier generation.
 *
 * `uuid()` for standard UUIDs, and `createId(prefix)` for short, URL-safe,
 * optionally prefixed identifiers (e.g. "proj_c3f8..."). Prefixes make IDs
 * self-describing in logs and URLs. Uses the Web Crypto API available in both
 * Node and the browser.
 */

// Crockford base32 (no I, L, O, U) — unambiguous and case-insensitive.
const ALPHABET = "0123456789ABCDEFGHJKMNPQRSTVWXYZ";
const DEFAULT_LENGTH = 24;

export function uuid(): string {
  return globalThis.crypto.randomUUID();
}

function randomBase32(length: number): string {
  const bytes = new Uint8Array(length);
  globalThis.crypto.getRandomValues(bytes);
  let out = "";
  for (const byte of bytes) {
    out += ALPHABET[byte % ALPHABET.length] ?? "0";
  }
  return out;
}

export interface CreateIdOptions {
  readonly prefix?: string;
  readonly length?: number;
}

export function createId(options: CreateIdOptions = {}): string {
  const length = options.length ?? DEFAULT_LENGTH;
  if (length <= 0) throw new Error("createId length must be positive");
  const body = randomBase32(length);
  return options.prefix ? `${options.prefix}_${body}` : body;
}
