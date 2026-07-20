import { recordHumanDecision } from "@/application/decision";
import { DecisionId } from "@/domain/decision";
import { getApiContext } from "@/server/composition";
import { authenticateRequest } from "@/server/auth";
import {
  apiRoute,
  parseJson,
  parsePathId,
  requireIfMatch,
  sendResult,
} from "@/server/http/respond";
import { RecordHumanDecisionRequest } from "@/server/http/schemas";
import { serializeDecision } from "@/server/http/serializers";

export const POST = apiRoute<{ decisionId: string }>(async ({ req, params, requestId }) => {
  const actorId = (await authenticateRequest(req)).ownerId;
  const decisionId = parsePathId(params.decisionId, DecisionId.parse);
  const expectedVersion = requireIfMatch(req, "decision");
  const body = await parseJson(req, RecordHumanDecisionRequest);
  const result = await recordHumanDecision(getApiContext(), {
    actorId,
    decisionId,
    selectedOptionId: body.selectedOptionId,
    rationale: body.rationale,
    expectedVersion,
  });
  return sendResult(result, {
    requestId,
    serialize: serializeDecision,
    resource: "decision",
    version: (view) => view.lockVersion,
  });
});
