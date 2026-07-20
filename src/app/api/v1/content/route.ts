import { createContentItem } from "@/application/content";
import { getApiContext } from "@/server/composition";
import { authenticateRequest } from "@/server/auth";
import { apiRoute, parseJson, sendResult } from "@/server/http/respond";
import { CreateContentRequest } from "@/server/http/schemas";
import { serializeContent } from "@/server/http/serializers";

export const POST = apiRoute(async ({ req, requestId }) => {
  // Require actor context (fail-closed). Knowledge-base authoring authorization is
  // deferred (Content has no owner yet — see KNOWN_LIMITATIONS); no anonymous writes.
  await authenticateRequest(req);
  const body = await parseJson(req, CreateContentRequest);
  const result = await createContentItem(getApiContext(), {
    type: body.type,
    slug: body.slug,
    title: body.title,
  });
  return sendResult(result, {
    requestId,
    status: 201,
    serialize: serializeContent,
    resource: "content",
    version: (view) => view.lockVersion,
  });
});
