import { listMemoriesByEntity } from "@/application/memory";
import { getApiContext } from "@/server/composition";
import { authenticateRequest } from "@/server/auth";
import { apiRoute, sendList } from "@/server/http/respond";
import { serializeMemory } from "@/server/http/serializers";

/** Retrieve memories by entity. */
export const GET = apiRoute<{ entityId: string }>(async ({ req, params, requestId }) => {
  const actorId = (await authenticateRequest(req)).ownerId;
  const result = await listMemoriesByEntity(getApiContext(), {
    actorId,
    entityId: params.entityId,
  });
  return sendList(result, { requestId, item: serializeMemory });
});
