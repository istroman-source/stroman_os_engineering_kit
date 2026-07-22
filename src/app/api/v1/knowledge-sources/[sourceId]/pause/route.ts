import { KnowledgeSourceId, manageKnowledgeSource } from "@/application/knowledge-acquisition";
import { authenticateRequest } from "@/server/auth";
import { getApiContext } from "@/server/composition";
import { apiRoute, parsePathId, requireIfMatch, sendResult } from "@/server/http/respond";
import { serializeKnowledgeSource } from "@/server/http/serializers";

export const POST = apiRoute<{ sourceId: string }>(async ({ req, params, requestId }) => {
  const actorId = (await authenticateRequest(req)).ownerId;
  const knowledgeSourceId = parsePathId(params.sourceId, KnowledgeSourceId.parse);
  const expectedVersion = requireIfMatch(req, "knowledgesource");
  const result = await manageKnowledgeSource(getApiContext(), {
    actorId,
    knowledgeSourceId,
    expectedVersion,
    action: "pause",
  });
  return sendResult(result, {
    requestId,
    serialize: serializeKnowledgeSource,
    resource: "knowledgesource",
    version: (view) => view.lockVersion,
  });
});
