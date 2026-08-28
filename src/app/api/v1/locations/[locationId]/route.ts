import { z } from "zod";
import {
  getPreparedLocationForOwner,
  preparedLocationDetailView,
  renamePreparedLocationForOwner,
} from "@/application/location-library";
import { authenticateRequest } from "@/server/auth";
import { getApiContext } from "@/server/composition";
import { apiRoute, json, parseJson } from "@/server/http/respond";

const RenameLocationRequest = z.object({ name: z.string().trim().min(1).max(160) }).strict();

export const GET = apiRoute<{ locationId: string }>(async ({ req, params, requestId }) => {
  const actorId = (await authenticateRequest(req)).ownerId;
  const location = await getPreparedLocationForOwner(getApiContext(), {
    actorId,
    locationId: params.locationId,
  });
  return json({ location: preparedLocationDetailView(location) }, { requestId });
});

export const PATCH = apiRoute<{ locationId: string }>(async ({ req, params, requestId }) => {
  const actorId = (await authenticateRequest(req)).ownerId;
  const input = await parseJson(req, RenameLocationRequest);
  const location = await renamePreparedLocationForOwner(getApiContext(), {
    actorId,
    locationId: params.locationId,
    name: input.name,
  });
  return json({ location: preparedLocationDetailView(location) }, { requestId });
});
