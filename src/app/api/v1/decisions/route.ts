import { proposeDecision } from "@/application/decision";
import { ProjectId } from "@/domain/project";
import { getApiContext } from "@/server/composition";
import { resolveActor } from "@/server/http/context";
import { apiRoute, parseJson, parsePathId, sendResult } from "@/server/http/respond";
import { ProposeDecisionRequest } from "@/server/http/schemas";
import { serializeDecision } from "@/server/http/serializers";

export const POST = apiRoute(async ({ req, requestId }) => {
  const actorId = resolveActor(req.headers);
  const body = await parseJson(req, ProposeDecisionRequest);
  const projectId = parsePathId(body.projectId, ProjectId.parse);
  const result = await proposeDecision(getApiContext(), {
    actorId,
    projectId,
    question: body.question,
    options: body.options.map((option) => ({
      id: option.id,
      label: option.label,
      rationale: option.rationale ?? null,
    })),
    advisory: body.advisory
      ? {
          recommendedOptionId: body.advisory.recommendedOptionId ?? null,
          rationale: body.advisory.rationale,
          confidence: body.advisory.confidence,
        }
      : undefined,
  });
  return sendResult(result, {
    requestId,
    status: 201,
    serialize: serializeDecision,
    resource: "decision",
    version: (view) => view.lockVersion,
  });
});
