declare const brand: unique symbol;

/**
 * Nominal typing helper. `Brand<string, "ProjectId">` is assignable from neither a
 * plain string nor a differently-branded string, preventing accidental mix-ups of
 * identifiers and value objects at compile time.
 */
export type Brand<T, B extends string> = T & { readonly [brand]: B };
