/** Liveness: the process is up. Deliberately does not touch the database. */
export function GET(): Response {
  return Response.json({ status: "ok" }, { headers: { "Cache-Control": "no-store" } });
}
