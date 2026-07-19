/**
 * Structured logger.
 *
 * Emits one JSON object per line so logs are machine-parseable in every
 * environment. The sink is injectable to keep the logger testable, and it has
 * no dependency on other modules to avoid initialization cycles.
 */

export type LogLevel = "debug" | "info" | "warn" | "error";

const LEVEL_ORDER: Record<LogLevel, number> = {
  debug: 10,
  info: 20,
  warn: 30,
  error: 40,
};

export type LogMeta = Record<string, unknown>;

export interface LogRecord {
  readonly level: LogLevel;
  readonly message: string;
  readonly time: string;
  readonly bindings: LogMeta;
  readonly meta: LogMeta | undefined;
}

export type LogSink = (record: LogRecord) => void;

export interface Logger {
  debug(message: string, meta?: LogMeta): void;
  info(message: string, meta?: LogMeta): void;
  warn(message: string, meta?: LogMeta): void;
  error(message: string, meta?: LogMeta): void;
  child(bindings: LogMeta): Logger;
}

export interface LoggerOptions {
  readonly level?: LogLevel;
  readonly bindings?: LogMeta;
  readonly sink?: LogSink;
  readonly clock?: () => Date;
}

const defaultSink: LogSink = (record) => {
  const line = JSON.stringify(record);
  if (record.level === "error") {
    console.error(line);
  } else if (record.level === "warn") {
    console.warn(line);
  } else {
    console.log(line);
  }
};

function resolveLevel(explicit: LogLevel | undefined): LogLevel {
  if (explicit) return explicit;
  const fromEnv = process.env.LOG_LEVEL;
  if (fromEnv === "debug" || fromEnv === "info" || fromEnv === "warn" || fromEnv === "error") {
    return fromEnv;
  }
  return process.env.NODE_ENV === "production" ? "info" : "debug";
}

export function createLogger(options: LoggerOptions = {}): Logger {
  const level = resolveLevel(options.level);
  const bindings = options.bindings ?? {};
  const sink = options.sink ?? defaultSink;
  const clock = options.clock ?? (() => new Date());
  const threshold = LEVEL_ORDER[level];

  function log(recordLevel: LogLevel, message: string, meta?: LogMeta): void {
    if (LEVEL_ORDER[recordLevel] < threshold) return;
    sink({
      level: recordLevel,
      message,
      time: clock().toISOString(),
      bindings,
      meta,
    });
  }

  return {
    debug: (message, meta) => log("debug", message, meta),
    info: (message, meta) => log("info", message, meta),
    warn: (message, meta) => log("warn", message, meta),
    error: (message, meta) => log("error", message, meta),
    child: (childBindings) =>
      createLogger({ ...options, bindings: { ...bindings, ...childBindings } }),
  };
}

/** Shared application logger. Create child loggers to add request context. */
export const logger = createLogger();
