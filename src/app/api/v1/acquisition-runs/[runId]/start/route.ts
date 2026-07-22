import { AcquisitionRunId, progressAcquisitionRun } from "@/application/knowledge-acquisition";
import { authenticateRequest } from "@/server/auth";
import { getApiContext } from "@/server/composition";
import { apiRoute, parsePathId, requireIfMatch, sendResult } from "@/server/http/respond";
import { serializeAcquisitionRun } from "@/server/http/serializers";

export const POST = apiRoute<{ runId: string }>(async ({ req, params, requestId }) => {
  const actorId = (await authenticateRequest(req)).ownerId;
  const acquisitionRunId = parsePathId(params.runId, AcquisitionRunId.parse);
  const expectedVersion = requireIfMatch(req, "acquisitionrun");
  const result = await progressAcquisitionRun(getApiContext(), {
    actorId,
    acquisitionRunId,
    expectedVersion,
    action: "start",
  });
  return sendResult(result, {
    requestId,
    serialize: serializeAcquisitionRun,
    resource: "acquisitionrun",
    version: (view) => view.lockVersion,
  });
});
