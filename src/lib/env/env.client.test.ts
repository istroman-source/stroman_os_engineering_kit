import { afterEach, describe, expect, it } from "vitest";
import { getClientEnv, parseClientEnv, resetClientEnvCache } from "./env.client";
import { EnvironmentValidationError } from "./error";

afterEach(() => resetClientEnvCache());

describe("parseClientEnv", () => {
  it("defaults the public app URL", () => {
    expect(parseClientEnv({}).NEXT_PUBLIC_APP_URL).toBe("http://localhost:3000");
  });

  it("accepts a valid public app URL", () => {
    expect(
      parseClientEnv({ NEXT_PUBLIC_APP_URL: "https://app.example.com" }).NEXT_PUBLIC_APP_URL,
    ).toBe("https://app.example.com");
  });

  it("rejects an invalid URL", () => {
    expect(() => parseClientEnv({ NEXT_PUBLIC_APP_URL: "nope" })).toThrowError(
      EnvironmentValidationError,
    );
  });

  it("does not expose server-only keys", () => {
    const env = parseClientEnv({ DATABASE_URL: "postgresql://u:p@h:5432/d" });
    expect("DATABASE_URL" in env).toBe(false);
  });

  it("memoizes getClientEnv", () => {
    expect(getClientEnv()).toBe(getClientEnv());
  });
});
