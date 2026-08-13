/** Liveness: the process is up. Deliberately does not touch the database. */
export function GET(): Response {
  return Response.json(
    { status: "ok", release: process.env.STROMAN_RELEASE_SHA ?? "unknown" },
    { headers: { "Cache-Control": "no-store" } },
  );
}
