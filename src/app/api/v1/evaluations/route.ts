import { recordEvaluation } from "@/application/evaluation";
import { RubricId } from "@/domain/evaluation";
import { ProjectId } from "@/domain/project";
import { getApiContext } from "@/server/composition";
import { resolveActor } from "@/server/http/context";
import { apiRoute, parseJson, parsePathId, sendResult } from "@/server/http/respond";
import { RecordEvaluationRequest } from "@/server/http/schemas";
import { serializeEvaluation } from "@/server/http/serializers";

export const POST = apiRoute(async ({ req, requestId }) => {
  const actorId = resolveActor(req.headers);
  const body = await parseJson(req, RecordEvaluationRequest);
  const projectId = parsePathId(body.projectId, ProjectId.parse);
  const rubricId = parsePathId(body.rubricId, RubricId.parse);
  const result = await recordEvaluation(getApiContext(), {
    actorId,
    projectId,
    rubricId,
    reviewerType: body.reviewerType,
    scores: body.scores,
  });
  // Evaluations are append-only (no concurrency token).
  return sendResult(result, { requestId, status: 201, serialize: serializeEvaluation });
});
