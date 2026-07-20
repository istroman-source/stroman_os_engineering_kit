import { getRubric } from "@/application/evaluation";
import { RubricId } from "@/domain/evaluation";
import { getApiContext } from "@/server/composition";
import { authenticateRequest } from "@/server/auth";
import { apiRoute, parsePathId, sendResult } from "@/server/http/respond";
import { serializeRubric } from "@/server/http/serializers";

export const GET = apiRoute<{ rubricId: string }>(async ({ req, params, requestId }) => {
  await authenticateRequest(req);
  const rubricId = parsePathId(params.rubricId, RubricId.parse);
  const result = await getRubric(getApiContext(), { rubricId });
  return sendResult(result, { requestId, serialize: serializeRubric });
});
