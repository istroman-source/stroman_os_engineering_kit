import { getCreativeBrief, saveCreativeBrief } from "@/application/creative";
import { ProjectId } from "@/domain/project";
import { getApiContext } from "@/server/composition";
import { authenticateRequest } from "@/server/auth";
import { apiRoute, parseJson, parsePathId, sendResult } from "@/server/http/respond";
import { AnalyzeProjectRequest } from "@/server/http/schemas";
import { serializeAnalysis } from "@/server/http/serializers";

/** Fetch a project's creative brief + generated blueprint. 404 until analyzed. */
export const GET = apiRoute<{ projectId: string }>(async ({ req, params, requestId }) => {
  const actorId = (await authenticateRequest(req)).ownerId;
  const projectId = parsePathId(params.projectId, ProjectId.parse);
  const result = await getCreativeBrief(getApiContext(), { actorId, projectId });
  return sendResult(result, { requestId, serialize: serializeAnalysis });
});

/** Analyze a project: capture (or re-capture) its context and return the blueprint. */
export const POST = apiRoute<{ projectId: string }>(async ({ req, params, requestId }) => {
  const actorId = (await authenticateRequest(req)).ownerId;
  const projectId = parsePathId(params.projectId, ProjectId.parse);
  const body = await parseJson(req, AnalyzeProjectRequest);
  const result = await saveCreativeBrief(getApiContext(), { actorId, projectId, fields: body });
  return sendResult(result, { requestId, serialize: serializeAnalysis });
});
