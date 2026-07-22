import { getKnowledgeSource, KnowledgeSourceId } from "@/application/knowledge-acquisition";
import { authenticateRequest } from "@/server/auth";
import { getApiContext } from "@/server/composition";
import { apiRoute, parsePathId, sendResult } from "@/server/http/respond";
import { serializeKnowledgeSource } from "@/server/http/serializers";

export const GET = apiRoute<{ sourceId: string }>(async ({ req, params, requestId }) => {
  const actorId = (await authenticateRequest(req)).ownerId;
  const knowledgeSourceId = parsePathId(params.sourceId, KnowledgeSourceId.parse);
  const result = await getKnowledgeSource(getApiContext(), { actorId, knowledgeSourceId });
  return sendResult(result, {
    requestId,
    serialize: serializeKnowledgeSource,
    resource: "knowledgesource",
    version: (view) => view.lockVersion,
  });
});
