import { createRubric } from "@/application/evaluation";
import { getApiContext } from "@/server/composition";
import { resolveActor } from "@/server/http/context";
import { apiRoute, parseJson, sendResult } from "@/server/http/respond";
import { CreateRubricRequest } from "@/server/http/schemas";
import { serializeRubric } from "@/server/http/serializers";

export const POST = apiRoute(async ({ req, requestId }) => {
  resolveActor(req.headers);
  const body = await parseJson(req, CreateRubricRequest);
  const result = await createRubric(getApiContext(), {
    slug: body.slug,
    title: body.title,
    criteria: body.criteria,
  });
  // Rubrics are append-only (no lockVersion / concurrency token).
  return sendResult(result, { requestId, status: 201, serialize: serializeRubric });
});
