import { afterEach, describe, expect, it } from "vitest";
import { getServerEnv, parseServerEnv, resetServerEnvCache } from "./env.server";
import { EnvironmentValidationError } from "./error";

afterEach(() => resetServerEnvCache());

describe("parseServerEnv", () => {
  it("applies defaults for an empty source", () => {
    const env = parseServerEnv({});
    expect(env.NODE_ENV).toBe("development");
    expect(env.NEXT_PUBLIC_APP_URL).toBe("http://localhost:3000");
    expect(env.LOG_LEVEL).toBe("info");
    expect(env.FEATURE_FLAGS).toBe("");
    expect(env.DATABASE_URL).toBeUndefined();
    expect(env.STROMAN_LOCATION_RECONSTRUCTION_PROVIDER).toBe("auto");
  });

  it("includes both public and server values", () => {
    const env = parseServerEnv({
      NODE_ENV: "production",
      NEXT_PUBLIC_APP_URL: "https://app.example.com",
      DATABASE_URL: "postgresql://u:p@localhost:5432/db",
      LOG_LEVEL: "warn",
      SUPABASE_URL: "https://ref.supabase.co",
      SUPABASE_ANON_KEY: "anon-key",
      APP_ALLOWED_ORIGINS: "https://app.example.com",
      SUPABASE_EMAIL_REDIRECT_URL: "https://app.example.com/auth/callback",
      STROMAN_PRIVATE_BETA_OWNER_EMAIL: "owner@example.com",
      STROMAN_RELEASE_SHA: "a".repeat(40),
      STROMAN_SOURCE_STORAGE_PATH: "/app/.data/source-imports",
      STROMAN_CREATIVE_REASONING_PROVIDER: "openai",
      OPENAI_API_KEY: "configured",
    });
    expect(env.NODE_ENV).toBe("production");
    expect(env.DATABASE_URL).toBe("postgresql://u:p@localhost:5432/db");
    expect(env.LOG_LEVEL).toBe("warn");
    expect(env.SUPABASE_JWT_AUD).toBe("authenticated");
  });

  it("requires complete release configuration in production (fail closed)", () => {
    try {
      parseServerEnv({
        NODE_ENV: "production",
        DATABASE_URL: "postgresql://u:p@localhost:5432/db",
      });
      expect.unreachable("should have thrown");
    } catch (error) {
      expect(error).toBeInstanceOf(EnvironmentValidationError);
      const issues = (error as EnvironmentValidationError).issues.join();
      expect(issues).toContain("SUPABASE_URL");
      expect(issues).toContain("SUPABASE_ANON_KEY");
      expect(issues).toContain("STROMAN_PRIVATE_BETA_OWNER_EMAIL");
      expect(issues).toContain("OPENAI_API_KEY");
      expect(issues).toContain("Hosted OpenAI creative reasoning");
    }
  });

  it("does NOT require Supabase auth configuration in development/test", () => {
    expect(() => parseServerEnv({ NODE_ENV: "development" })).not.toThrow();
    expect(() => parseServerEnv({ NODE_ENV: "test" })).not.toThrow();
  });

  it("requires a server-side KIRI key only when that reconstruction adapter is explicit", () => {
    expect(() =>
      parseServerEnv({
        NODE_ENV: "development",
        STROMAN_LOCATION_RECONSTRUCTION_PROVIDER: "kiri",
      }),
    ).toThrow(EnvironmentValidationError);
    expect(() =>
      parseServerEnv({
        NODE_ENV: "development",
        STROMAN_LOCATION_RECONSTRUCTION_PROVIDER: "auto",
      }),
    ).not.toThrow();
  });

  it("requires a complete private Stroman worker configuration when selected", () => {
    expect(() =>
      parseServerEnv({
        NODE_ENV: "development",
        STROMAN_LOCATION_RECONSTRUCTION_PROVIDER: "stroman",
      }),
    ).toThrow(EnvironmentValidationError);
    expect(() =>
      parseServerEnv({
        NODE_ENV: "development",
        STROMAN_LOCATION_RECONSTRUCTION_PROVIDER: "stroman",
        STROMAN_RECONSTRUCTION_WORKER_URL: "https://reconstruct.example.com",
        STROMAN_RECONSTRUCTION_WORKER_SECRET: "s".repeat(32),
      }),
    ).not.toThrow();
    expect(() =>
      parseServerEnv({
        NODE_ENV: "development",
        STROMAN_LOCATION_RECONSTRUCTION_PROVIDER: "auto",
        STROMAN_RECONSTRUCTION_WORKER_URL: "https://reconstruct.example.com",
      }),
    ).toThrow(EnvironmentValidationError);
  });

  it("throws a descriptive error for invalid values", () => {
    try {
      parseServerEnv({ LOG_LEVEL: "verbose" });
      expect.unreachable("should have thrown");
    } catch (error) {
      expect(error).toBeInstanceOf(EnvironmentValidationError);
      expect((error as EnvironmentValidationError).issues.join()).toContain("LOG_LEVEL");
    }
  });

  it("memoizes getServerEnv", () => {
    expect(getServerEnv()).toBe(getServerEnv());
  });
});
