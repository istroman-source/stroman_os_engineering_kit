import { createId } from "@/lib/id";

/**
 * Application-owned identifier generator port. Use cases generate new identity
 * strings through this and validate them with the relevant domain id type,
 * keeping id creation out of the domain and deterministic under test.
 */
export interface IdGenerator {
  generate(prefix: string): string;
}

/** Default generator backed by the shared id infrastructure. */
export function createIdGenerator(): IdGenerator {
  return {
    generate: (prefix) => createId({ prefix }),
  };
}
