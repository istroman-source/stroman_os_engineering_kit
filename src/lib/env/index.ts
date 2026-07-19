// Client-safe environment surface. Import server secrets explicitly from
// "@/lib/env/env.server" (guarded by `server-only`) — never re-exported here.
export * from "./error";
export * from "./env.client";
