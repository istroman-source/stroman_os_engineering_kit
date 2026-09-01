import {
  beginCreativeBriefDevelopment,
  completeCreativeBriefDevelopment,
  getCreativeBrief,
} from "@/application/creative";
import { ProjectId } from "@/domain/project";
import { getApiContext } from "@/server/composition";
import { authenticateRequest } from "@/server/auth";
import { apiRoute, parseJson, parsePathId, sendResult } from "@/server/http/respond";
import { AnalyzeProjectRequest } from "@/server/http/schemas";
import { serializeAnalysis, serializeCreativeIntent } from "@/server/http/serializers";
import { after } from "next/server";

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
  const context = getApiContext();
  const result = await beginCreativeBriefDevelopment(context, {
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
  if (!result.ok) return sendResult(result, { requestId, serialize: (value) => value });

  // Offline/deterministic runs remain synchronous and predictable. Next keeps
  // hosted development alive after the durable intent response, so the browser
  // never waits on a multi-stage model call.
  if (context.creativeReasoning.mode === "DETERMINISTIC") {
    const completed = await completeCreativeBriefDevelopment(context, result.value.brief);
    return sendResult(completed, { requestId, serialize: serializeAnalysis });
  }
  after(() => completeCreativeBriefDevelopment(context, result.value.brief));
  return sendResult(result, {
    requestId,
    status: 202,
    serialize: (value) => ({ brief: serializeCreativeIntent(value.view) }),
  });
});
