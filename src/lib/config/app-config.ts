import "server-only";

import { getServerEnv, type ServerEnv } from "@/lib/env/env.server";
import type { LogLevel } from "@/lib/logging";
import { APP_NAME, APP_VERSION } from "./constants";

/**
 * Server application configuration.
 *
 * Derives a stable, typed config object from the validated server environment.
 * This module is server-only (it reads secrets); client code should use the
 * client-safe constants in `./constants` instead.
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

export function loadConfig(env: ServerEnv = getServerEnv()): AppConfig {
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
