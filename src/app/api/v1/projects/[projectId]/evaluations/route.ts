import { listEvaluationsForProject } from "@/application/evaluation";
import { ProjectId } from "@/domain/project";
import { getApiContext } from "@/server/composition";
import { authenticateRequest } from "@/server/auth";
import { apiRoute, parsePathId, sendList } from "@/server/http/respond";
import { serializeEvaluation } from "@/server/http/serializers";

export const GET = apiRoute<{ projectId: string }>(async ({ req, params, requestId }) => {
  const actorId = (await authenticateRequest(req)).ownerId;
  const projectId = parsePathId(params.projectId, ProjectId.parse);
  const result = await listEvaluationsForProject(getApiContext(), { actorId, projectId });
  return sendList(result, { requestId, item: serializeEvaluation });
});
