import { describe, expect, it } from "vitest";
import { createLogger, type LogRecord } from "./logger";

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
});
