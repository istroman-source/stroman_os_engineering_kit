import { getDecision } from "@/application/decision";
import { DecisionId } from "@/domain/decision";
import { getApiContext } from "@/server/composition";
import { resolveActor } from "@/server/http/context";
import { apiRoute, parsePathId, sendResult } from "@/server/http/respond";
import { serializeDecision } from "@/server/http/serializers";

export const GET = apiRoute<{ decisionId: string }>(async ({ req, params, requestId }) => {
  const actorId = resolveActor(req.headers);
  const decisionId = parsePathId(params.decisionId, DecisionId.parse);
  const result = await getDecision(getApiContext(), { actorId, decisionId });
  return sendResult(result, {
    requestId,
    serialize: serializeDecision,
    resource: "decision",
    version: (view) => view.lockVersion,
  });
});
