import { deleteInsight } from "@/application/memory";
import { getApiContext } from "@/server/composition";
import { authenticateRequest } from "@/server/auth";
import { apiRoute, sendResult } from "@/server/http/respond";

export const DELETE = apiRoute<{ insightId: string }>(async ({ req, params, requestId }) => {
  const actorId = (await authenticateRequest(req)).ownerId;
  const result = await deleteInsight(getApiContext(), { actorId, insightId: params.insightId });
  return sendResult(result, { requestId, serialize: () => ({ ok: true }) });
});
