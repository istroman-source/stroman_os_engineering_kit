import { createEntity, listEntities } from "@/application/memory";
import { getApiContext } from "@/server/composition";
import { authenticateRequest } from "@/server/auth";
import { apiRoute, parseJson, sendList, sendResult } from "@/server/http/respond";
import { CreateEntityRequest } from "@/server/http/schemas";
import { serializeEntity } from "@/server/http/serializers";

export const POST = apiRoute(async ({ req, requestId }) => {
  const actorId = (await authenticateRequest(req)).ownerId;
  const body = await parseJson(req, CreateEntityRequest);
  const result = await createEntity(getApiContext(), {
    actorId,
    name: body.name,
    kind: body.kind,
  });
  return sendResult(result, { requestId, status: 201, serialize: serializeEntity });
});

export const GET = apiRoute(async ({ req, requestId }) => {
  const actorId = (await authenticateRequest(req)).ownerId;
  const result = await listEntities(getApiContext(), { actorId });
  return sendList(result, { requestId, item: serializeEntity });
});
