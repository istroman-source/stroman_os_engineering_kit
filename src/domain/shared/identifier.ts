import { err, ok, type Result } from "@/lib/result";
import type { Brand } from "./brand";
import { InvalidValueError } from "./domain-error";

/**
 * A typed identifier constructor for one concept. Identifiers are prefixed
 * (e.g. `proj_…`) so a value carries its type at runtime and different id kinds
 * cannot be confused. Values are generated at the application boundary with
 * `@/lib/id` (`createId({ prefix })`) and validated here via `parse`.
 */
export interface IdType<B extends string> {
  readonly prefix: string;
  /** Validate an untrusted string into a typed id. */
  parse(raw: string): Result<Brand<string, B>, InvalidValueError>;
  /** Wrap a value already known to be valid (e.g. freshly generated). Use sparingly. */
  unsafe(raw: string): Brand<string, B>;
}

export function defineId<B extends string>(label: string, prefix: string): IdType<B> {
  const pattern = new RegExp(`^${prefix}_[0-9A-Za-z]{8,}$`);
  return {
    prefix,
    parse(raw) {
      const value = raw.trim();
      if (!pattern.test(value)) {
        return err(new InvalidValueError(`Invalid ${label}: "${raw}"`));
      }
      return ok(value as Brand<string, B>);
    },
    unsafe(raw) {
      return raw as Brand<string, B>;
    },
  };
}
