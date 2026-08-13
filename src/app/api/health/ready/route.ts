import { checkDatabaseReady } from "@/server/composition";
import { getServerEnv } from "@/lib/env/env.server";

/** Readiness: validates release config and verifies the database is reachable. */
export async function GET(): Promise<Response> {
  try {
    getServerEnv();
  } catch {
    return Response.json(
      { status: "unavailable", release: process.env.STROMAN_RELEASE_SHA ?? "unknown" },
      { status: 503, headers: { "Cache-Control": "no-store" } },
    );
  }
  const ready = await checkDatabaseReady();
  return Response.json(
    {
      status: ready ? "ready" : "unavailable",
      release: process.env.STROMAN_RELEASE_SHA ?? "unknown",
    },
    { status: ready ? 200 : 503, headers: { "Cache-Control": "no-store" } },
  );
}
