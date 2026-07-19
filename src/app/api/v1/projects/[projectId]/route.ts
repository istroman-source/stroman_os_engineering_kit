import { getProject } from "@/application/project";
import { ProjectId } from "@/domain/project";
import { getApiContext } from "@/server/composition";
import { resolveActor } from "@/server/http/context";
import { apiRoute, parsePathId, sendResult } from "@/server/http/respond";
import { serializeProject } from "@/server/http/serializers";

export const GET = apiRoute<{ projectId: string }>(async ({ req, params, requestId }) => {
  const actorId = resolveActor(req.headers);
  const projectId = parsePathId(params.projectId, ProjectId.parse);
  const result = await getProject(getApiContext(), { actorId, projectId });
  return sendResult(result, {
    requestId,
    serialize: serializeProject,
    resource: "project",
    version: (view) => view.lockVersion,
  });
});
