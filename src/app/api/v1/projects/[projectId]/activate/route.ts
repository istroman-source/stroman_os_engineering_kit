import { activateProject } from "@/application/project";
import { ProjectId } from "@/domain/project";
import { getApiContext } from "@/server/composition";
import { authenticateRequest } from "@/server/auth";
import { apiRoute, parsePathId, requireIfMatch, sendResult } from "@/server/http/respond";
import { serializeProject } from "@/server/http/serializers";

export const POST = apiRoute<{ projectId: string }>(async ({ req, params, requestId }) => {
  const actorId = (await authenticateRequest(req)).ownerId;
  const projectId = parsePathId(params.projectId, ProjectId.parse);
  const expectedVersion = requireIfMatch(req, "project");
  const result = await activateProject(getApiContext(), { actorId, projectId, expectedVersion });
  return sendResult(result, {
    requestId,
    serialize: serializeProject,
    resource: "project",
    version: (view) => view.lockVersion,
  });
});
