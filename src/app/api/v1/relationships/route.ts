import { createRelationship } from "@/application/memory";
import { getApiContext } from "@/server/composition";
import { authenticateRequest } from "@/server/auth";
import { apiRoute, parseJson, sendResult } from "@/server/http/respond";
import { CreateRelationshipRequest } from "@/server/http/schemas";
import { serializeRelationship } from "@/server/http/serializers";

export const POST = apiRoute(async ({ req, requestId }) => {
  const actorId = (await authenticateRequest(req)).ownerId;
  const body = await parseJson(req, CreateRelationshipRequest);
  const result = await createRelationship(getApiContext(), {
    actorId,
    fromEntityId: body.fromEntityId,
    toEntityId: body.toEntityId,
    relationType: body.relationType,
  });
  return sendResult(result, { requestId, status: 201, serialize: serializeRelationship });
});
