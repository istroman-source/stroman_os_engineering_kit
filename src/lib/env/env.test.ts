import { afterEach, describe, expect, it } from "vitest";
import { EnvironmentValidationError, getEnv, parseEnv, resetEnvCache } from "./env";

afterEach(() => resetEnvCache());

describe("parseEnv", () => {
  it("applies defaults for an empty source", () => {
    const env = parseEnv({});
    expect(env.NODE_ENV).toBe("development");
    expect(env.NEXT_PUBLIC_APP_URL).toBe("http://localhost:3000");
    expect(env.LOG_LEVEL).toBe("info");
    expect(env.FEATURE_FLAGS).toBe("");
    expect(env.DATABASE_URL).toBeUndefined();
  });

  it("accepts valid values", () => {
    const env = parseEnv({
      NODE_ENV: "production",
      NEXT_PUBLIC_APP_URL: "https://app.example.com",
      DATABASE_URL: "postgresql://u:p@localhost:5432/db",
      LOG_LEVEL: "warn",
    });
    expect(env.NODE_ENV).toBe("production");
    expect(env.DATABASE_URL).toBe("postgresql://u:p@localhost:5432/db");
    expect(env.LOG_LEVEL).toBe("warn");
  });

  it("throws a descriptive error for invalid values", () => {
    expect(() => parseEnv({ NEXT_PUBLIC_APP_URL: "not-a-url" })).toThrowError(
      EnvironmentValidationError,
    );
    try {
      parseEnv({ LOG_LEVEL: "verbose" });
      expect.unreachable("should have thrown");
    } catch (error) {
      expect(error).toBeInstanceOf(EnvironmentValidationError);
      expect((error as EnvironmentValidationError).issues.join()).toContain("LOG_LEVEL");
    }
  });

  it("memoizes getEnv", () => {
    expect(getEnv()).toBe(getEnv());
  });
});
