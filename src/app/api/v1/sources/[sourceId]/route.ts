import { deleteSource } from "@/application/memory";
import { getApiContext } from "@/server/composition";
import { authenticateRequest } from "@/server/auth";
import { apiRoute, sendResult } from "@/server/http/respond";

export const DELETE = apiRoute<{ sourceId: string }>(async ({ req, params, requestId }) => {
  const actorId = (await authenticateRequest(req)).ownerId;
  const result = await deleteSource(getApiContext(), { actorId, sourceId: params.sourceId });
  return sendResult(result, { requestId, serialize: () => ({ ok: true }) });
});
