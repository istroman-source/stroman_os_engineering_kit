import { afterEach, describe, expect, it } from "vitest";
import { devActorEnabled, resolveActor } from "./context";
import { HttpError } from "./http-error";

const ACTOR = "usr_AAAAAAAA";
const originalEnv = process.env.NODE_ENV;

function headers(entries: Record<string, string> = {}): Headers {
  return new Headers(entries);
}

function setNodeEnv(value: string | undefined): void {
  const env = process.env as Record<string, string | undefined>;
  if (value === undefined) delete env.NODE_ENV;
  else env.NODE_ENV = value;
}

afterEach(() => {
  setNodeEnv(originalEnv);
  delete process.env.STROMAN_ALLOW_DEV_ACTOR;
});

describe("temporary dev actor gate", () => {
  it("is enabled in development and test", () => {
    setNodeEnv("development");
    expect(devActorEnabled()).toBe(true);
    setNodeEnv("test");
    expect(devActorEnabled()).toBe(true);
  });

  it("accepts a valid actor header when enabled (test env)", () => {
    setNodeEnv("test");
    expect(resolveActor(headers({ "x-stroman-actor-id": ACTOR }))).toBe(ACTOR);
  });

  it("rejects a missing actor header (401)", () => {
    setNodeEnv("test");
    try {
      resolveActor(headers());
      expect.unreachable("should have thrown");
    } catch (error) {
      expect(error).toBeInstanceOf(HttpError);
      expect((error as HttpError).status).toBe(401);
      expect((error as HttpError).code).toBe("ACTOR_REQUIRED");
    }
  });

  it("rejects a malformed actor header (400)", () => {
    setNodeEnv("test");
    try {
      resolveActor(headers({ "x-stroman-actor-id": "not-an-owner-id" }));
      expect.unreachable("should have thrown");
    } catch (error) {
      expect((error as HttpError).status).toBe(400);
      expect((error as HttpError).code).toBe("INVALID_ACTOR");
    }
  });

  it("is DISABLED in production even when STROMAN_ALLOW_DEV_ACTOR=true", () => {
    setNodeEnv("production");
    process.env.STROMAN_ALLOW_DEV_ACTOR = "true";
    expect(devActorEnabled()).toBe(false);
    const error = (() => {
      try {
        resolveActor(headers({ "x-stroman-actor-id": ACTOR }));
      } catch (caught) {
        return caught as HttpError;
      }
      throw new Error("should have thrown");
    })();
    expect(error.status).toBe(503);
    expect(error.code).toBe("ACTOR_CONTEXT_UNAVAILABLE");
    // The message must not hint that a header can unlock production access.
    expect(error.message.toLowerCase()).not.toContain("header");
  });

  it("is DISABLED in production when the flag is absent", () => {
    setNodeEnv("production");
    expect(devActorEnabled()).toBe(false);
    expect(() => resolveActor(headers({ "x-stroman-actor-id": ACTOR }))).toThrow(HttpError);
  });
});
