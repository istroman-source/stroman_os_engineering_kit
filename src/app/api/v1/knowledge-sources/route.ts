import { createKnowledgeSource, listSourcesForOwner } from "@/application/knowledge-acquisition";
import { authenticateRequest } from "@/server/auth";
import { getApiContext } from "@/server/composition";
import { apiRoute, parseJson, sendList, sendResult } from "@/server/http/respond";
import { CreateKnowledgeSourceRequest } from "@/server/http/schemas";
import { serializeKnowledgeSource } from "@/server/http/serializers";

export const POST = apiRoute(async ({ req, requestId }) => {
  const actorId = (await authenticateRequest(req)).ownerId;
  const body = await parseJson(req, CreateKnowledgeSourceRequest);
  const result = await createKnowledgeSource(getApiContext(), { actorId, ...body });
  return sendResult(result, {
    requestId,
    status: 201,
    serialize: serializeKnowledgeSource,
    resource: "knowledgesource",
    version: (view) => view.lockVersion,
  });
});

export const GET = apiRoute(async ({ req, requestId }) => {
  const actorId = (await authenticateRequest(req)).ownerId;
  const result = await listSourcesForOwner(getApiContext(), { actorId });
  return sendList(result, { requestId, item: serializeKnowledgeSource });
});
