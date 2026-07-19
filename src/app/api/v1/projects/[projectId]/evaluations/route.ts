import { listEvaluationsForProject } from "@/application/evaluation";
import { ProjectId } from "@/domain/project";
import { getApiContext } from "@/server/composition";
import { resolveActor } from "@/server/http/context";
import { apiRoute, parsePathId, sendList } from "@/server/http/respond";
import { serializeEvaluation } from "@/server/http/serializers";

export const GET = apiRoute<{ projectId: string }>(async ({ req, params, requestId }) => {
  const actorId = resolveActor(req.headers);
  const projectId = parsePathId(params.projectId, ProjectId.parse);
  const result = await listEvaluationsForProject(getApiContext(), { actorId, projectId });
  return sendList(result, { requestId, item: serializeEvaluation });
});
