import { attachAdvisory } from "@/application/decision";
import { DecisionId } from "@/domain/decision";
import { getApiContext } from "@/server/composition";
import { resolveActor } from "@/server/http/context";
import {
  apiRoute,
  parseJson,
  parsePathId,
  requireIfMatch,
  sendResult,
} from "@/server/http/respond";
import { AttachAdvisoryRequest } from "@/server/http/schemas";
import { serializeDecision } from "@/server/http/serializers";

export const POST = apiRoute<{ decisionId: string }>(async ({ req, params, requestId }) => {
  const actorId = resolveActor(req.headers);
  const decisionId = parsePathId(params.decisionId, DecisionId.parse);
  const expectedVersion = requireIfMatch(req, "decision");
  const body = await parseJson(req, AttachAdvisoryRequest);
  const result = await attachAdvisory(getApiContext(), {
    actorId,
    decisionId,
    recommendedOptionId: body.recommendedOptionId ?? null,
    rationale: body.rationale,
    confidence: body.confidence,
    expectedVersion,
  });
  return sendResult(result, {
    requestId,
    serialize: serializeDecision,
    resource: "decision",
    version: (view) => view.lockVersion,
  });
});
