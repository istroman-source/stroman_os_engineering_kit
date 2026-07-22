import {
  getObservationWithReview,
  KnowledgeObservationId,
} from "@/application/knowledge-acquisition";
import { authenticateRequest } from "@/server/auth";
import { getApiContext } from "@/server/composition";
import { apiRoute, parsePathId, sendResult } from "@/server/http/respond";
import { serializeObservationWithReview } from "@/server/http/serializers";

export const GET = apiRoute<{ observationId: string }>(async ({ req, params, requestId }) => {
  const actorId = (await authenticateRequest(req)).ownerId;
  const knowledgeObservationId = parsePathId(params.observationId, KnowledgeObservationId.parse);
  const result = await getObservationWithReview(getApiContext(), {
    actorId,
    knowledgeObservationId,
  });
  return sendResult(result, {
    requestId,
    serialize: serializeObservationWithReview,
    resource: "knowledgeobservation",
    version: (view) => view.observation.lockVersion,
  });
});
