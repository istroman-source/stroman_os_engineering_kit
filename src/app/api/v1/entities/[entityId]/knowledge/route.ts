import { getEntityKnowledge } from "@/application/memory";
import { getApiContext } from "@/server/composition";
import { authenticateRequest } from "@/server/auth";
import { apiRoute, sendResult } from "@/server/http/respond";
import { serializeEntityKnowledge } from "@/server/http/serializers";

/** All knowledge about an entity, with traceable sources and evidence. */
export const GET = apiRoute<{ entityId: string }>(async ({ req, params, requestId }) => {
  const actorId = (await authenticateRequest(req)).ownerId;
  const result = await getEntityKnowledge(getApiContext(), { actorId, entityId: params.entityId });
  return sendResult(result, { requestId, serialize: serializeEntityKnowledge });
});
