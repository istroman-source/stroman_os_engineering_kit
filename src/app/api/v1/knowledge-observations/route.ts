import {
  AcquisitionRunId,
  createKnowledgeObservation,
  KnowledgeSourceId,
  SourceDocumentId,
} from "@/application/knowledge-acquisition";
import { authenticateRequest } from "@/server/auth";
import { getApiContext } from "@/server/composition";
import { apiRoute, parseJson, parsePathId, sendResult } from "@/server/http/respond";
import { CreateKnowledgeObservationRequest } from "@/server/http/schemas";
import { serializeKnowledgeObservation } from "@/server/http/serializers";

export const POST = apiRoute(async ({ req, requestId }) => {
  const actorId = (await authenticateRequest(req)).ownerId;
  const body = await parseJson(req, CreateKnowledgeObservationRequest);
  const knowledgeSourceId = parsePathId(body.knowledgeSourceId, KnowledgeSourceId.parse);
  const sourceDocumentId = parsePathId(body.sourceDocumentId, SourceDocumentId.parse);
  const acquisitionRunId = body.acquisitionRunId
    ? parsePathId(body.acquisitionRunId, AcquisitionRunId.parse)
    : null;
  const result = await createKnowledgeObservation(getApiContext(), {
    ...body,
    actorId,
    knowledgeSourceId,
    sourceDocumentId,
    acquisitionRunId,
  });
  return sendResult(result, {
    requestId,
    status: 201,
    serialize: serializeKnowledgeObservation,
    resource: "knowledgeobservation",
    version: (view) => view.lockVersion,
  });
});
