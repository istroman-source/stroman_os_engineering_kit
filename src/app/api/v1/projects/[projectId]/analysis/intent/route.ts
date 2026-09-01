import { getCreativeIntent } from "@/application/creative";
import { ProjectId } from "@/domain/project";
import { authenticateRequest } from "@/server/auth";
import { getApiContext } from "@/server/composition";
import { apiRoute, parsePathId, sendResult } from "@/server/http/respond";
import { serializeCreativeIntent } from "@/server/http/serializers";

/** Return saved filmmaker intent even while plan generation is processing or failed. */
export const GET = apiRoute<{ projectId: string }>(async ({ req, params, requestId }) => {
  const actorId = (await authenticateRequest(req)).ownerId;
  const projectId = parsePathId(params.projectId, ProjectId.parse);
  const result = await getCreativeIntent(getApiContext(), { actorId, projectId });
  return sendResult(result, { requestId, serialize: serializeCreativeIntent });
});
