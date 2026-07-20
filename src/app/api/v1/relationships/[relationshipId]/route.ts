import { deleteRelationship } from "@/application/memory";
import { getApiContext } from "@/server/composition";
import { authenticateRequest } from "@/server/auth";
import { apiRoute, sendResult } from "@/server/http/respond";

export const DELETE = apiRoute<{ relationshipId: string }>(async ({ req, params, requestId }) => {
  const actorId = (await authenticateRequest(req)).ownerId;
  const result = await deleteRelationship(getApiContext(), {
    actorId,
    relationshipId: params.relationshipId,
  });
  return sendResult(result, { requestId, serialize: () => ({ ok: true }) });
});
