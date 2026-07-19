import { describe, expect, it } from "vitest";
import { createLogger, redact, REDACTED, type LogRecord } from "./logger";

function capture(level: "debug" | "info" | "warn" | "error") {
  const records: LogRecord[] = [];
  const logger = createLogger({
    level,
    sink: (record) => records.push(record),
    clock: () => new Date("2026-07-17T12:00:00.000Z"),
  });
  return { logger, records };
}

describe("createLogger", () => {
  it("filters records below the configured level", () => {
    const { logger, records } = capture("warn");
    logger.debug("d");
    logger.info("i");
    logger.warn("w");
    logger.error("e");
    expect(records.map((r) => r.level)).toEqual(["warn", "error"]);
  });

  it("stamps time and passes meta through", () => {
    const { logger, records } = capture("debug");
    logger.info("hello", { requestId: "abc" });
    expect(records[0]?.time).toBe("2026-07-17T12:00:00.000Z");
    expect(records[0]?.meta).toEqual({ requestId: "abc" });
  });

  it("merges bindings from child loggers", () => {
    const { logger, records } = capture("debug");
    logger.child({ scope: "auth" }).child({ userId: "u1" }).info("in");
    expect(records[0]?.bindings).toEqual({ scope: "auth", userId: "u1" });
  });

  it("redacts sensitive keys in meta by default", () => {
    const { logger, records } = capture("debug");
    logger.info("login", { userId: "u1", password: "hunter2", apiKey: "sk-123" });
    expect(records[0]?.meta).toEqual({ userId: "u1", password: REDACTED, apiKey: REDACTED });
  });

  it("redacts sensitive keys in bindings", () => {
    const records: LogRecord[] = [];
    const logger = createLogger({
      sink: (r) => records.push(r),
      bindings: { authorization: "Bearer x", service: "api" },
    });
    logger.info("hi");
    expect(records[0]?.bindings).toEqual({ authorization: REDACTED, service: "api" });
  });
});

describe("redact", () => {
  it("redacts nested and array-nested secrets", () => {
    const input = { a: { token: "t" }, list: [{ secret: "s" }, { ok: 1 }] };
    expect(redact(input, ["token", "secret"])).toEqual({
      a: { token: REDACTED },
      list: [{ secret: REDACTED }, { ok: 1 }],
    });
  });

  it("handles circular references safely", () => {
    const obj: Record<string, unknown> = { name: "x" };
    obj.self = obj;
    const out = redact(obj, ["token"]) as Record<string, unknown>;
    expect(out.name).toBe("x");
    expect(out.self).toBe("[Circular]");
  });
});
