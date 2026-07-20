import { listRelationshipsByEntity } from "@/application/memory";
import { getApiContext } from "@/server/composition";
import { authenticateRequest } from "@/server/auth";
import { apiRoute, sendList } from "@/server/http/respond";
import { serializeRelationship } from "@/server/http/serializers";

/** Retrieve relationships by entity (either endpoint). */
export const GET = apiRoute<{ entityId: string }>(async ({ req, params, requestId }) => {
  const actorId = (await authenticateRequest(req)).ownerId;
  const result = await listRelationshipsByEntity(getApiContext(), {
    actorId,
    entityId: params.entityId,
  });
  return sendList(result, { requestId, item: serializeRelationship });
});
