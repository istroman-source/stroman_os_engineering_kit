import { AcquisitionRunId, getAcquisitionRun } from "@/application/knowledge-acquisition";
import { authenticateRequest } from "@/server/auth";
import { getApiContext } from "@/server/composition";
import { apiRoute, parsePathId, sendResult } from "@/server/http/respond";
import { serializeAcquisitionRun } from "@/server/http/serializers";

export const GET = apiRoute<{ runId: string }>(async ({ req, params, requestId }) => {
  const actorId = (await authenticateRequest(req)).ownerId;
  const acquisitionRunId = parsePathId(params.runId, AcquisitionRunId.parse);
  const result = await getAcquisitionRun(getApiContext(), { actorId, acquisitionRunId });
  return sendResult(result, {
    requestId,
    serialize: serializeAcquisitionRun,
    resource: "acquisitionrun",
    version: (view) => view.lockVersion,
  });
});
