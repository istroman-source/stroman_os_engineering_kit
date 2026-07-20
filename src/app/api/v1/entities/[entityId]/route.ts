import { deleteEntity } from "@/application/memory";
import { getApiContext } from "@/server/composition";
import { authenticateRequest } from "@/server/auth";
import { apiRoute, sendResult } from "@/server/http/respond";

export const DELETE = apiRoute<{ entityId: string }>(async ({ req, params, requestId }) => {
  const actorId = (await authenticateRequest(req)).ownerId;
  const result = await deleteEntity(getApiContext(), { actorId, entityId: params.entityId });
  return sendResult(result, { requestId, serialize: () => ({ ok: true }) });
});
