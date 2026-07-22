import {
  KnowledgeObservationId,
  materializeObservation,
} from "@/application/knowledge-acquisition";
import { authenticateRequest } from "@/server/auth";
import { getApiContext } from "@/server/composition";
import { apiRoute, parseJson, parsePathId, sendResult } from "@/server/http/respond";
import { MaterializeObservationRequest } from "@/server/http/schemas";
import { serializeMaterialization } from "@/server/http/serializers";

export const POST = apiRoute<{ observationId: string }>(async ({ req, params, requestId }) => {
  const actorId = (await authenticateRequest(req)).ownerId;
  const knowledgeObservationId = parsePathId(params.observationId, KnowledgeObservationId.parse);
  const body = await parseJson(req, MaterializeObservationRequest);
  const result = await materializeObservation(getApiContext(), {
    actorId,
    knowledgeObservationId,
    resolution: body.resolution,
  });
  return sendResult(result, { requestId, serialize: serializeMaterialization });
});
