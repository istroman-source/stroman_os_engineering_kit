import { z } from "zod";
import {
  createPreparedLocationForOwner,
  listPreparedLocationsForOwner,
  preparedLocationView,
} from "@/application/location-library";
import { authenticateRequest } from "@/server/auth";
import { getApiContext } from "@/server/composition";
import { apiRoute, json, parseJson } from "@/server/http/respond";

const CreateLocationRequest = z
  .object({
    name: z.string().trim().min(1).max(160),
    inputKind: z.enum(["GLB", "PHOTOS"]),
  })
  .strict();

export const GET = apiRoute(async ({ req, requestId }) => {
  const actorId = (await authenticateRequest(req)).ownerId;
  const locations = await listPreparedLocationsForOwner(getApiContext(), actorId);
  return json({ items: locations.map(preparedLocationView) }, { requestId });
});

export const POST = apiRoute(async ({ req, requestId }) => {
  const actorId = (await authenticateRequest(req)).ownerId;
  const input = await parseJson(req, CreateLocationRequest);
  const location = await createPreparedLocationForOwner(getApiContext(), { actorId, ...input });
  return json({ location: preparedLocationView(location) }, { requestId, status: 201 });
});
