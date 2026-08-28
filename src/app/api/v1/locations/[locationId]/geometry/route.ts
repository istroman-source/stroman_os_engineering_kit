import { getPreparedLocationGeometryForOwner } from "@/application/location-library";
import { authenticateRequest } from "@/server/auth";
import { getApiContext } from "@/server/composition";
import { apiRoute } from "@/server/http/respond";

export const GET = apiRoute<{ locationId: string }>(async ({ req, params }) => {
  const actorId = (await authenticateRequest(req)).ownerId;
  const geometry = await getPreparedLocationGeometryForOwner(getApiContext(), {
    actorId,
    locationId: params.locationId,
  });
  const body = geometry.bytes.buffer.slice(
    geometry.bytes.byteOffset,
    geometry.bytes.byteOffset + geometry.bytes.byteLength,
  ) as ArrayBuffer;
  return new Response(body, {
    headers: {
      "Content-Type": "model/gltf-binary",
      "Content-Length": String(geometry.bytes.byteLength),
      "Cache-Control": "private, no-store",
      "X-Content-Type-Options": "nosniff",
    },
  });
});
