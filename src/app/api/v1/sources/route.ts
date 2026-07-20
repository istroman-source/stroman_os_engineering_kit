import { createSource, listSources } from "@/application/memory";
import { getApiContext } from "@/server/composition";
import { authenticateRequest } from "@/server/auth";
import { apiRoute, parseJson, sendList, sendResult } from "@/server/http/respond";
import { CreateSourceRequest } from "@/server/http/schemas";
import { serializeSource } from "@/server/http/serializers";

export const POST = apiRoute(async ({ req, requestId }) => {
  const actorId = (await authenticateRequest(req)).ownerId;
  const body = await parseJson(req, CreateSourceRequest);
  const result = await createSource(getApiContext(), {
    actorId,
    label: body.label,
    sourceType: body.sourceType,
    url: body.url,
    detail: body.detail,
  });
  return sendResult(result, { requestId, status: 201, serialize: serializeSource });
});

export const GET = apiRoute(async ({ req, requestId }) => {
  const actorId = (await authenticateRequest(req)).ownerId;
  const result = await listSources(getApiContext(), { actorId });
  return sendList(result, { requestId, item: serializeSource });
});
