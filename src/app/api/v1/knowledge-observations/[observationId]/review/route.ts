import {
  KnowledgeObservationId,
  reviewKnowledgeObservation,
} from "@/application/knowledge-acquisition";
import { authenticateRequest } from "@/server/auth";
import { getApiContext } from "@/server/composition";
import {
  apiRoute,
  parseJson,
  parsePathId,
  requireIfMatch,
  sendResult,
} from "@/server/http/respond";
import { ReviewObservationRequest } from "@/server/http/schemas";
import { serializeObservationWithReview } from "@/server/http/serializers";

export const POST = apiRoute<{ observationId: string }>(async ({ req, params, requestId }) => {
  const actorId = (await authenticateRequest(req)).ownerId;
  const knowledgeObservationId = parsePathId(params.observationId, KnowledgeObservationId.parse);
  const expectedVersion = requireIfMatch(req, "knowledgeobservation");
  const body = await parseJson(req, ReviewObservationRequest);
  const result = await reviewKnowledgeObservation(getApiContext(), {
    actorId,
    knowledgeObservationId,
    expectedVersion,
    ...body,
  });
  return sendResult(result, {
    requestId,
    serialize: serializeObservationWithReview,
    resource: "knowledgeobservation",
    version: (view) => view.observation.lockVersion,
  });
});
