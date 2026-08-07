export type DatabaseMaintenanceOperation = "reset" | "seed";

export class UnsafeDatabaseTargetError extends Error {
  readonly code = "UNSAFE_DATABASE_TARGET";

  constructor(message: string) {
    super(message);
    this.name = "UnsafeDatabaseTargetError";
  }
}

export function parseDatabaseMaintenanceArgs(
  args: readonly string[],
): DatabaseMaintenanceOperation {
  const operation = args[0];
  if (operation !== "reset" && operation !== "seed") {
    throw new UnsafeDatabaseTargetError("Expected database operation: reset or seed");
  }
  if (!args.includes("--confirm-local")) {
    throw new UnsafeDatabaseTargetError("Refusing database maintenance without --confirm-local");
  }
  return operation;
}

export function assertSafeLocalDatabase(input: {
  readonly databaseUrl: string | undefined;
  readonly nodeEnv: string | undefined;
}): { readonly databaseName: string; readonly hostname: string } {
  if (input.nodeEnv === "production") {
    throw new UnsafeDatabaseTargetError("Database maintenance is disabled in production");
  }
  if (!input.databaseUrl) {
    throw new UnsafeDatabaseTargetError("DATABASE_URL is required for database maintenance");
  }

  let target: URL;
  try {
    target = new URL(input.databaseUrl);
  } catch {
    throw new UnsafeDatabaseTargetError("DATABASE_URL is not a valid URL");
  }

  if (!new Set(["postgres:", "postgresql:"]).has(target.protocol)) {
    throw new UnsafeDatabaseTargetError("Database maintenance requires PostgreSQL");
  }
  if (!new Set(["localhost", "127.0.0.1", "[::1]"]).has(target.hostname)) {
    throw new UnsafeDatabaseTargetError("Database maintenance is limited to loopback PostgreSQL");
  }

  const databaseName = decodeURIComponent(target.pathname.slice(1));
  if (databaseName !== "stroman_os" && !/^stroman_[a-z0-9_]*test$/.test(databaseName)) {
    throw new UnsafeDatabaseTargetError(
      "Database maintenance requires a Stroman development database",
    );
  }

  return { databaseName, hostname: target.hostname };
}
