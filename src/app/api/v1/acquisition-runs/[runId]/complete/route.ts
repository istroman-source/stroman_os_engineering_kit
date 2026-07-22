import { AcquisitionRunId, progressAcquisitionRun } from "@/application/knowledge-acquisition";
import { authenticateRequest } from "@/server/auth";
import { getApiContext } from "@/server/composition";
import {
  apiRoute,
  parseJson,
  parsePathId,
  requireIfMatch,
  sendResult,
} from "@/server/http/respond";
import { CompleteAcquisitionRunRequest } from "@/server/http/schemas";
import { serializeAcquisitionRun } from "@/server/http/serializers";

export const POST = apiRoute<{ runId: string }>(async ({ req, params, requestId }) => {
  const actorId = (await authenticateRequest(req)).ownerId;
  const acquisitionRunId = parsePathId(params.runId, AcquisitionRunId.parse);
  const expectedVersion = requireIfMatch(req, "acquisitionrun");
  const body = await parseJson(req, CompleteAcquisitionRunRequest);
  const result = await progressAcquisitionRun(getApiContext(), {
    actorId,
    acquisitionRunId,
    expectedVersion,
    action: "complete",
    ...body,
  });
  return sendResult(result, {
    requestId,
    serialize: serializeAcquisitionRun,
    resource: "acquisitionrun",
    version: (view) => view.lockVersion,
  });
});
