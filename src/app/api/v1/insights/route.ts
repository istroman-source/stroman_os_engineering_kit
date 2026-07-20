import { createInsight } from "@/application/memory";
import { getApiContext } from "@/server/composition";
import { authenticateRequest } from "@/server/auth";
import { apiRoute, parseJson, sendResult } from "@/server/http/respond";
import { CreateInsightRequest } from "@/server/http/schemas";
import { serializeInsight } from "@/server/http/serializers";

export const POST = apiRoute(async ({ req, requestId }) => {
  const actorId = (await authenticateRequest(req)).ownerId;
  const body = await parseJson(req, CreateInsightRequest);
  const result = await createInsight(getApiContext(), {
    actorId,
    statement: body.statement,
    confidence: body.confidence,
    evidence: body.evidence,
    memoryIds: body.memoryIds,
  });
  return sendResult(result, { requestId, status: 201, serialize: serializeInsight });
});
