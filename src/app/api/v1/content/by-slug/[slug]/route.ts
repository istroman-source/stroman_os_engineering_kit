import { getContentItemBySlug } from "@/application/content";
import { getApiContext } from "@/server/composition";
import { authenticateRequest } from "@/server/auth";
import { apiRoute, sendResult } from "@/server/http/respond";
import { serializeContent } from "@/server/http/serializers";

export const GET = apiRoute<{ slug: string }>(async ({ req, params, requestId }) => {
  await authenticateRequest(req);
  const result = await getContentItemBySlug(getApiContext(), {
    slug: decodeURIComponent(params.slug),
  });
  return sendResult(result, {
    requestId,
    serialize: serializeContent,
    resource: "content",
    version: (view) => view.lockVersion,
  });
});
