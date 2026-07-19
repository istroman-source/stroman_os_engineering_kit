// Client-safe config surface. `loadConfig`/`AppConfig` live in the server-only
// "./app-config" module; only the type is re-exported here (erased at runtime).
export * from "./constants";
export type { AppConfig } from "./app-config";
