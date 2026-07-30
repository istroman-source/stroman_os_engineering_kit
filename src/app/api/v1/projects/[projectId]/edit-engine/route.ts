import { getEditEngine } from "@/application/edit-engine";
import { ProjectId } from "@/domain/project";
import { authenticateRequest } from "@/server/auth";
import { getApiContext } from "@/server/composition";
import { apiRoute, parsePathId, sendResult } from "@/server/http/respond";

export const GET = apiRoute<{ projectId: string }>(async ({ req, params, requestId }) => {
  const actorId = (await authenticateRequest(req)).ownerId;
  const projectId = parsePathId(params.projectId, ProjectId.parse);
  return sendResult(await getEditEngine(getApiContext(), { actorId, projectId }), {
    requestId,
    serialize: (value) => value,
  });
});
