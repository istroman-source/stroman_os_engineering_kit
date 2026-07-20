import { listMemoriesBySource } from "@/application/memory";
import { getApiContext } from "@/server/composition";
import { authenticateRequest } from "@/server/auth";
import { apiRoute, sendList } from "@/server/http/respond";
import { serializeMemory } from "@/server/http/serializers";

/** Retrieve memories by source. */
export const GET = apiRoute<{ sourceId: string }>(async ({ req, params, requestId }) => {
  const actorId = (await authenticateRequest(req)).ownerId;
  const result = await listMemoriesBySource(getApiContext(), {
    actorId,
    sourceId: params.sourceId,
  });
  return sendList(result, { requestId, item: serializeMemory });
});
