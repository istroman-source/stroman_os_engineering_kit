import { getProject, renameProject } from "@/application/project";
import { ProjectId } from "@/domain/project";
import { getApiContext } from "@/server/composition";
import { authenticateRequest } from "@/server/auth";
import {
  apiRoute,
  parseJson,
  parsePathId,
  requireIfMatch,
  sendResult,
} from "@/server/http/respond";
import { RenameProjectRequest } from "@/server/http/schemas";
import { serializeProject } from "@/server/http/serializers";

export const GET = apiRoute<{ projectId: string }>(async ({ req, params, requestId }) => {
  const actorId = (await authenticateRequest(req)).ownerId;
  const projectId = parsePathId(params.projectId, ProjectId.parse);
  const result = await getProject(getApiContext(), { actorId, projectId });
  return sendResult(result, {
    requestId,
    serialize: serializeProject,
    resource: "project",
    version: (view) => view.lockVersion,
  });
});

export const PATCH = apiRoute<{ projectId: string }>(async ({ req, params, requestId }) => {
  const actorId = (await authenticateRequest(req)).ownerId;
  const projectId = parsePathId(params.projectId, ProjectId.parse);
  const expectedVersion = requireIfMatch(req, "project");
  const body = await parseJson(req, RenameProjectRequest);
  const result = await renameProject(getApiContext(), {
    actorId,
    projectId,
    expectedVersion,
    name: body.name,
  });
  return sendResult(result, {
    requestId,
    serialize: serializeProject,
    resource: "project",
    version: (view) => view.lockVersion,
  });
});
