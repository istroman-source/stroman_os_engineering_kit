import { getPromptHandoff } from "@/application/prompt-handoff";
import { ProjectId } from "@/domain/project";
import { authenticateRequest } from "@/server/auth";
import { getApiContext } from "@/server/composition";
import { apiRoute, parsePathId, sendResult } from "@/server/http/respond";

export const GET = apiRoute<{ projectId: string }>(async ({ req, params, requestId }) => {
  const actorId = (await authenticateRequest(req)).ownerId;
  const projectId = parsePathId(params.projectId, ProjectId.parse);
  return sendResult(await getPromptHandoff(getApiContext(), { actorId, projectId }), {
    requestId,
    serialize: (value) => value,
  });
});
