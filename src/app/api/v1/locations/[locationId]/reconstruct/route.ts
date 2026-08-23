import { startPreparedLocationReconstruction } from "@/application/location-library";
import { authenticateRequest } from "@/server/auth";
import { getApiContext } from "@/server/composition";
import { apiRoute, json } from "@/server/http/respond";

export const POST = apiRoute<{ locationId: string }>(async ({ req, params, requestId }) => {
  const actorId = (await authenticateRequest(req)).ownerId;
  const job = await startPreparedLocationReconstruction(getApiContext(), {
    actorId,
    locationId: params.locationId,
  });
  return json({ reconstruction: { id: job.id, status: job.status } }, { requestId, status: 202 });
});
