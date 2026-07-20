import { createMemory } from "@/application/memory";
import { getApiContext } from "@/server/composition";
import { authenticateRequest } from "@/server/auth";
import { apiRoute, parseJson, sendResult } from "@/server/http/respond";
import { CreateMemoryRequest } from "@/server/http/schemas";
import { serializeMemory } from "@/server/http/serializers";

export const POST = apiRoute(async ({ req, requestId }) => {
  const actorId = (await authenticateRequest(req)).ownerId;
  const body = await parseJson(req, CreateMemoryRequest);
  const result = await createMemory(getApiContext(), {
    actorId,
    entityId: body.entityId,
    sourceId: body.sourceId,
    content: body.content,
  });
  return sendResult(result, { requestId, status: 201, serialize: serializeMemory });
});
