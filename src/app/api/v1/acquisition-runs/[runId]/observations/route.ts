import { AcquisitionRunId, listObservationsByRun } from "@/application/knowledge-acquisition";
import { authenticateRequest } from "@/server/auth";
import { getApiContext } from "@/server/composition";
import { apiRoute, parsePathId, sendList } from "@/server/http/respond";
import { serializeKnowledgeObservation } from "@/server/http/serializers";

export const GET = apiRoute<{ runId: string }>(async ({ req, params, requestId }) => {
  const actorId = (await authenticateRequest(req)).ownerId;
  const acquisitionRunId = parsePathId(params.runId, AcquisitionRunId.parse);
  const result = await listObservationsByRun(getApiContext(), { actorId, acquisitionRunId });
  return sendList(result, { requestId, item: serializeKnowledgeObservation });
});
