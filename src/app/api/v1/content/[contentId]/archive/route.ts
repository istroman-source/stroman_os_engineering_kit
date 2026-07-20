import { archiveContentItem } from "@/application/content";
import { ContentItemId } from "@/domain/content";
import { getApiContext } from "@/server/composition";
import { authenticateRequest } from "@/server/auth";
import { apiRoute, parsePathId, requireIfMatch, sendResult } from "@/server/http/respond";
import { serializeContent } from "@/server/http/serializers";

export const POST = apiRoute<{ contentId: string }>(async ({ req, params, requestId }) => {
  await authenticateRequest(req);
  const contentItemId = parsePathId(params.contentId, ContentItemId.parse);
  const expectedVersion = requireIfMatch(req, "content");
  const result = await archiveContentItem(getApiContext(), { contentItemId, expectedVersion });
  return sendResult(result, {
    requestId,
    serialize: serializeContent,
    resource: "content",
    version: (view) => view.lockVersion,
  });
});
