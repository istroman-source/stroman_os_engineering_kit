import { updateCreativePlanning } from "@/application/creative";
import { ProjectId } from "@/domain/project";
import { authenticateRequest } from "@/server/auth";
import { getApiContext } from "@/server/composition";
import { apiRoute, parseJson, parsePathId, sendResult } from "@/server/http/respond";
import { UpdateCreativePlanningRequest } from "@/server/http/schemas";
import { serializeAnalysis } from "@/server/http/serializers";

export const POST = apiRoute<{ projectId: string }>(async ({ req, params, requestId }) => {
  const actorId = (await authenticateRequest(req)).ownerId;
  const projectId = parsePathId(params.projectId, ProjectId.parse);
  const body = await parseJson(req, UpdateCreativePlanningRequest);
  const result = await updateCreativePlanning(getApiContext(), {
    actorId,
    projectId,
    stage: body.stage,
    production: body.production,
    shotPlanning: body.shotPlanning,
    correction: body.correction
      ? {
          statement: body.correction.statement,
          replacesClaimId: body.correction.replacesClaimId ?? null,
        }
      : undefined,
  });
  return sendResult(result, { requestId, serialize: serializeAnalysis });
});
