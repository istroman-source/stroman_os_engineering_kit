import { createProject, listProjectsForOwner } from "@/application/project";
import { getApiContext } from "@/server/composition";
import { authenticateRequest } from "@/server/auth";
import { makeEtag } from "@/server/http/etag";
import { apiRoute, parseJson, sendList, sendResult } from "@/server/http/respond";
import { CreateProjectRequest } from "@/server/http/schemas";
import { serializeProject } from "@/server/http/serializers";

export const POST = apiRoute(async ({ req, requestId }) => {
  const actorId = (await authenticateRequest(req)).ownerId;
  const body = await parseJson(req, CreateProjectRequest);
  const result = await createProject(getApiContext(), { actorId, name: body.name });
  return sendResult(result, {
    requestId,
    status: 201,
    serialize: serializeProject,
    resource: "project",
    version: (view) => view.lockVersion,
  });
});

export const GET = apiRoute(async ({ req, requestId }) => {
  const actorId = (await authenticateRequest(req)).ownerId;
  const result = await listProjectsForOwner(getApiContext(), { actorId });
  return sendList(result, {
    requestId,
    // `concurrencyToken` is the opaque token to copy verbatim into If-Match when
    // mutating this item (distinct from the whole-representation HTTP ETag header).
    item: (view) => ({
      ...serializeProject(view),
      concurrencyToken: makeEtag("project", view.lockVersion),
    }),
  });
});
