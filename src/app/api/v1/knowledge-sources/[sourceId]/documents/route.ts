import {
  addSourceDocument,
  KnowledgeSourceId,
  listDocumentsForSource,
} from "@/application/knowledge-acquisition";
import { authenticateRequest } from "@/server/auth";
import { getApiContext } from "@/server/composition";
import { apiRoute, parseJson, parsePathId, sendList, sendResult } from "@/server/http/respond";
import { AddSourceDocumentRequest } from "@/server/http/schemas";
import { serializeSourceDocument } from "@/server/http/serializers";

export const POST = apiRoute<{ sourceId: string }>(async ({ req, params, requestId }) => {
  const actorId = (await authenticateRequest(req)).ownerId;
  const knowledgeSourceId = parsePathId(params.sourceId, KnowledgeSourceId.parse);
  const body = await parseJson(req, AddSourceDocumentRequest);
  const result = await addSourceDocument(getApiContext(), { actorId, knowledgeSourceId, ...body });
  return sendResult(result, { requestId, status: 201, serialize: serializeSourceDocument });
});

export const GET = apiRoute<{ sourceId: string }>(async ({ req, params, requestId }) => {
  const actorId = (await authenticateRequest(req)).ownerId;
  const knowledgeSourceId = parsePathId(params.sourceId, KnowledgeSourceId.parse);
  const result = await listDocumentsForSource(getApiContext(), { actorId, knowledgeSourceId });
  return sendList(result, { requestId, item: serializeSourceDocument });
});
