import { listInsightsByMemory } from "@/application/memory";
import { getApiContext } from "@/server/composition";
import { authenticateRequest } from "@/server/auth";
import { apiRoute, sendList } from "@/server/http/respond";
import { serializeInsight } from "@/server/http/serializers";

/** Retrieve insights that cite a given memory. */
export const GET = apiRoute<{ memoryId: string }>(async ({ req, params, requestId }) => {
  const actorId = (await authenticateRequest(req)).ownerId;
  const result = await listInsightsByMemory(getApiContext(), {
    actorId,
    memoryId: params.memoryId,
  });
  return sendList(result, { requestId, item: serializeInsight });
});
