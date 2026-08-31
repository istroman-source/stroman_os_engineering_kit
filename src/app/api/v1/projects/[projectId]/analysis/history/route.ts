import { listCreativeBriefRevisions } from "@/application/creative";
import { ProjectId } from "@/domain/project";
import { authenticateRequest } from "@/server/auth";
import { getApiContext } from "@/server/composition";
import { apiRoute, parsePathId, sendList } from "@/server/http/respond";

export const GET = apiRoute<{ projectId: string }>(async ({ req, params, requestId }) => {
  const actorId = (await authenticateRequest(req)).ownerId;
  const projectId = parsePathId(params.projectId, ProjectId.parse);
  const result = await listCreativeBriefRevisions(getApiContext(), { actorId, projectId });
  return sendList(result, {
    requestId,
    item: (revision) => ({
      ...revision,
      createdAt: revision.createdAt.toISOString(),
    }),
  });
});
