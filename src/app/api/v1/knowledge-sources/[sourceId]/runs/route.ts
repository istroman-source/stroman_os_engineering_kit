import {
  createAcquisitionRun,
  KnowledgeSourceId,
  listRunsForSource,
} from "@/application/knowledge-acquisition";
import { authenticateRequest } from "@/server/auth";
import { getApiContext } from "@/server/composition";
import { apiRoute, parseJson, parsePathId, sendList, sendResult } from "@/server/http/respond";
import { CreateAcquisitionRunRequest } from "@/server/http/schemas";
import { serializeAcquisitionRun } from "@/server/http/serializers";

export const POST = apiRoute<{ sourceId: string }>(async ({ req, params, requestId }) => {
  const actorId = (await authenticateRequest(req)).ownerId;
  const knowledgeSourceId = parsePathId(params.sourceId, KnowledgeSourceId.parse);
  const body = await parseJson(req, CreateAcquisitionRunRequest);
  const result = await createAcquisitionRun(getApiContext(), {
    actorId,
    knowledgeSourceId,
    ...body,
  });
  return sendResult(result, {
    requestId,
    status: 201,
    serialize: serializeAcquisitionRun,
    resource: "acquisitionrun",
    version: (view) => view.lockVersion,
  });
});

export const GET = apiRoute<{ sourceId: string }>(async ({ req, params, requestId }) => {
  const actorId = (await authenticateRequest(req)).ownerId;
  const knowledgeSourceId = parsePathId(params.sourceId, KnowledgeSourceId.parse);
  const result = await listRunsForSource(getApiContext(), { actorId, knowledgeSourceId });
  return sendList(result, { requestId, item: serializeAcquisitionRun });
});
