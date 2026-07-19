import { getEnv, type Env } from "@/lib/env";
import type { LogLevel } from "@/lib/logging";

/**
 * Application configuration.
 *
 * Derives a stable, typed config object from the validated environment. Feature
 * code depends on this shape rather than reading process.env directly.
 */

export interface AppConfig {
  readonly name: string;
  readonly version: string;
  readonly appUrl: string;
  readonly logLevel: LogLevel;
  readonly isDevelopment: boolean;
  readonly isTest: boolean;
  readonly isProduction: boolean;
}

export const APP_NAME = "Stroman OS";
export const APP_VERSION = "0.1.0";

export function loadConfig(env: Env = getEnv()): AppConfig {
  return {
    name: APP_NAME,
    version: APP_VERSION,
    appUrl: env.NEXT_PUBLIC_APP_URL,
    logLevel: env.LOG_LEVEL,
    isDevelopment: env.NODE_ENV === "development",
    isTest: env.NODE_ENV === "test",
    isProduction: env.NODE_ENV === "production",
  };
}
