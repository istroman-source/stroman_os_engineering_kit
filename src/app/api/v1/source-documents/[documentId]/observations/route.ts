import { listObservationsByDocument, SourceDocumentId } from "@/application/knowledge-acquisition";
import { authenticateRequest } from "@/server/auth";
import { getApiContext } from "@/server/composition";
import { apiRoute, parsePathId, sendList } from "@/server/http/respond";
import { serializeKnowledgeObservation } from "@/server/http/serializers";

export const GET = apiRoute<{ documentId: string }>(async ({ req, params, requestId }) => {
  const actorId = (await authenticateRequest(req)).ownerId;
  const sourceDocumentId = parsePathId(params.documentId, SourceDocumentId.parse);
  const result = await listObservationsByDocument(getApiContext(), { actorId, sourceDocumentId });
  return sendList(result, { requestId, item: serializeKnowledgeObservation });
});
