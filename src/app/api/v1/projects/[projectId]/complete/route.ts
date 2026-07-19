import { completeProject } from "@/application/project";
import { ProjectId } from "@/domain/project";
import { getApiContext } from "@/server/composition";
import { resolveActor } from "@/server/http/context";
import { apiRoute, parsePathId, requireIfMatch, sendResult } from "@/server/http/respond";
import { serializeProject } from "@/server/http/serializers";

export const POST = apiRoute<{ projectId: string }>(async ({ req, params, requestId }) => {
  const actorId = resolveActor(req.headers);
  const projectId = parsePathId(params.projectId, ProjectId.parse);
  const expectedVersion = requireIfMatch(req, "project");
  const result = await completeProject(getApiContext(), { actorId, projectId, expectedVersion });
  return sendResult(result, {
    requestId,
    serialize: serializeProject,
    resource: "project",
    version: (view) => view.lockVersion,
  });
});
