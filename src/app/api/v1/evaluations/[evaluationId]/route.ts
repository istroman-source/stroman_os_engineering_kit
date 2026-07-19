import { getEvaluation } from "@/application/evaluation";
import { EvaluationId } from "@/domain/evaluation";
import { getApiContext } from "@/server/composition";
import { resolveActor } from "@/server/http/context";
import { apiRoute, parsePathId, sendResult } from "@/server/http/respond";
import { serializeEvaluation } from "@/server/http/serializers";

export const GET = apiRoute<{ evaluationId: string }>(async ({ req, params, requestId }) => {
  const actorId = resolveActor(req.headers);
  const evaluationId = parsePathId(params.evaluationId, EvaluationId.parse);
  const result = await getEvaluation(getApiContext(), { actorId, evaluationId });
  return sendResult(result, { requestId, serialize: serializeEvaluation });
});
