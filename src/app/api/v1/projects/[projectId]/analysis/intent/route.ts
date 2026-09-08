import { getCreativeIntent, saveCreativeBriefDraft } from "@/application/creative";
import { ProjectId } from "@/domain/project";
import { authenticateRequest } from "@/server/auth";
import { getApiContext } from "@/server/composition";
import { apiRoute, parseJson, parsePathId, sendResult } from "@/server/http/respond";
import { AnalyzeProjectRequest } from "@/server/http/schemas";
import { serializeCreativeIntent } from "@/server/http/serializers";

/** Return saved filmmaker intent even while plan generation is processing or failed. */
export const GET = apiRoute<{ projectId: string }>(async ({ req, params, requestId }) => {
  const actorId = (await authenticateRequest(req)).ownerId;
  const projectId = parsePathId(params.projectId, ProjectId.parse);
  const result = await getCreativeIntent(getApiContext(), { actorId, projectId });
  return sendResult(result, { requestId, serialize: serializeCreativeIntent });
});

/** Save a brief for filmmaker confirmation before any creative development begins. */
export const POST = apiRoute<{ projectId: string }>(async ({ req, params, requestId }) => {
  const actorId = (await authenticateRequest(req)).ownerId;
  const projectId = parsePathId(params.projectId, ProjectId.parse);
  const body = await parseJson(req, AnalyzeProjectRequest);
  const result = await saveCreativeBriefDraft(getApiContext(), {
    actorId,
    projectId,
    fields: {
      title: body.title,
      client: body.client ?? "",
      projectType: body.projectType ?? "",
      creativeGoal: body.creativeGoal ?? "",
      targetAudience: body.targetAudience ?? "",
      desiredEmotion: body.desiredEmotion ?? "",
      context: body.context ?? "",
      runtimeTarget: body.runtimeTarget ?? "",
      deliveryPlatform: body.deliveryPlatform ?? "",
      references: body.references ?? "",
      restrictions: body.restrictions ?? "",
      clientRequirements: body.clientRequirements ?? "",
      nonNegotiables: body.nonNegotiables ?? "",
      successCriteria: body.successCriteria ?? "",
    },
  });
  return sendResult(result, {
    requestId,
    serialize: (value) => serializeCreativeIntent(value.view),
  });
});
