import { checkDatabaseReady } from "@/server/composition";

/** Readiness: verifies the database is reachable with a bounded, safe check. */
export async function GET(): Promise<Response> {
  const ready = await checkDatabaseReady();
  return Response.json(
    { status: ready ? "ready" : "unavailable" },
    { status: ready ? 200 : 503, headers: { "Cache-Control": "no-store" } },
  );
}
