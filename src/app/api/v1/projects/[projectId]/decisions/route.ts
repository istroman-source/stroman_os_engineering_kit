import { listDecisionsForProject } from "@/application/decision";
import { ProjectId } from "@/domain/project";
import { getApiContext } from "@/server/composition";
import { authenticateRequest } from "@/server/auth";
import { makeEtag } from "@/server/http/etag";
import { apiRoute, parsePathId, sendList } from "@/server/http/respond";
import { serializeDecision } from "@/server/http/serializers";

export const GET = apiRoute<{ projectId: string }>(async ({ req, params, requestId }) => {
  const actorId = (await authenticateRequest(req)).ownerId;
  const projectId = parsePathId(params.projectId, ProjectId.parse);
  const result = await listDecisionsForProject(getApiContext(), { actorId, projectId });
  return sendList(result, {
    requestId,
    item: (view) => ({
      ...serializeDecision(view),
      concurrencyToken: makeEtag("decision", view.lockVersion),
    }),
  });
});
