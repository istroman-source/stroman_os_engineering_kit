import { Prisma } from "@prisma/client";
import { type AppErrorOptions, AppError, ConflictError, NotFoundError } from "@/lib/errors";

/**
 * Infrastructure-level persistence failures for cases the application never
 * inspects by type (foreign-key violations, corruption, availability). They
 * extend the shared `AppError` but never expose raw Prisma errors, SQL, or
 * credentials; causes are retained internally and omitted from `toJSON`.
 *
 * Cases the APPLICATION does recognize are translated to the NEUTRAL shared-kernel
 * errors instead, so no layer imports another's error classes:
 *   - unique violation → `ConflictError` (@/lib/errors)
 *   - record-not-found → `NotFoundError` (@/lib/errors)
 * Optimistic-concurrency conflicts are raised directly by the adapters as
 * `OptimisticConcurrencyError` (@/lib/errors).
 */
export abstract class PersistenceError extends AppError {}

/** A foreign-key constraint was violated (referenced row missing). */
export class ForeignKeyConstraintError extends PersistenceError {
  constructor(options: AppErrorOptions = {}) {
    super("CONFLICT", "A referenced record does not exist", options);
  }
}

/** The database could not be reached or a query failed operationally. */
export class DatabaseUnavailableError extends PersistenceError {
  constructor(options: AppErrorOptions = {}) {
    super("UNAVAILABLE", "A database operation failed", options);
  }
}

/** Persisted data violated a domain expectation (corruption). Never repaired silently. */
export class PersistenceMappingError extends PersistenceError {
  constructor(detail: string, options: AppErrorOptions = {}) {
    super("INTERNAL", "Persisted data could not be mapped to a valid domain value", {
      ...options,
      context: { detail, ...(options.context ?? {}) },
    });
  }
}

/**
 * Translate a thrown Prisma error into a safe error, using structured error codes
 * (never by parsing human-readable messages). Application-recognized outcomes
 * become neutral shared-kernel errors; the rest become infrastructure errors.
 */
export function translatePrismaError(error: unknown): AppError {
  if (error instanceof AppError) return error;

  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    switch (error.code) {
      case "P2002": {
        const target = Array.isArray(error.meta?.target)
          ? (error.meta.target as string[]).join(", ")
          : typeof error.meta?.target === "string"
            ? error.meta.target
            : undefined;
        return new ConflictError("A unique constraint was violated", {
          cause: error,
          context: { target },
        });
      }
      case "P2003":
        return new ForeignKeyConstraintError({ cause: error });
      case "P2025":
        return new NotFoundError("The requested record was not found", { cause: error });
      default:
        return new DatabaseUnavailableError({ cause: error, context: { code: error.code } });
    }
  }

  if (
    error instanceof Prisma.PrismaClientInitializationError ||
    error instanceof Prisma.PrismaClientRustPanicError ||
    error instanceof Prisma.PrismaClientUnknownRequestError
  ) {
    return new DatabaseUnavailableError({ cause: error });
  }

  return new DatabaseUnavailableError({ cause: error });
}
