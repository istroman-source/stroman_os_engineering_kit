import { describe, expect, it } from "vitest";
import {
  assertSafeLocalDatabase,
  parseDatabaseMaintenanceArgs,
  UnsafeDatabaseTargetError,
} from "./database-maintenance";

describe("database maintenance safety", () => {
  it.each(["reset", "seed"] as const)("accepts an explicitly confirmed %s", (operation) => {
    expect(parseDatabaseMaintenanceArgs([operation, "--confirm-local"])).toBe(operation);
  });

  it("requires explicit local confirmation", () => {
    expect(() => parseDatabaseMaintenanceArgs(["reset"])).toThrow(
      new UnsafeDatabaseTargetError("Refusing database maintenance without --confirm-local"),
    );
  });

  it.each([
    "postgresql://stroman:secret@localhost:5432/stroman_os?schema=public",
    "postgres://stroman:secret@127.0.0.1:54329/stroman_test",
    "postgresql://stroman:secret@[::1]:5432/stroman_integration_test",
  ])("allows a loopback Stroman database without exposing credentials", (databaseUrl) => {
    expect(assertSafeLocalDatabase({ databaseUrl, nodeEnv: "development" })).toMatchObject({
      databaseName: expect.stringMatching(/^stroman_/),
    });
  });

  it.each([
    ["production environment", "postgresql://u:secret@localhost/stroman_os", "production"],
    ["remote host", "postgresql://u:secret@db.example.com/stroman_os", "development"],
    ["reserved database", "postgresql://u:secret@localhost/postgres", "development"],
    ["non-PostgreSQL URL", "mysql://u:secret@localhost/stroman_os", "development"],
    ["malformed URL", "not a url containing secret", "development"],
  ])("rejects a %s with a credential-free error", (_case, databaseUrl, nodeEnv) => {
    expect(() => assertSafeLocalDatabase({ databaseUrl, nodeEnv })).toThrow(
      UnsafeDatabaseTargetError,
    );
    try {
      assertSafeLocalDatabase({ databaseUrl, nodeEnv });
    } catch (error) {
      expect(String(error)).not.toContain("secret");
    }
  });
});
