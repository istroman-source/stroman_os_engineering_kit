import { retryLocationReconstruction } from "@/application/creative";
import { ProjectId } from "@/domain/project";
import { authenticateRequest } from "@/server/auth";
import { getApiContext } from "@/server/composition";
import { apiRoute, json, parsePathId } from "@/server/http/respond";

export const POST = apiRoute<{ projectId: string; reconstructionId: string }>(
  async ({ req, params, requestId }) => {
    const actorId = (await authenticateRequest(req)).ownerId;
    const projectId = parsePathId(params.projectId, ProjectId.parse);
    const job = await retryLocationReconstruction(getApiContext(), {
      actorId,
      projectId,
      jobId: decodeURIComponent(params.reconstructionId),
    });
    return json({ job }, { requestId, status: 202 });
  },
);
