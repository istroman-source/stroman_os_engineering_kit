import { retryProjectSource } from "@/application/source-import";
import { ProjectId } from "@/domain/project";
import { authenticateRequest } from "@/server/auth";
import { getApiContext } from "@/server/composition";
import { apiRoute, parsePathId, sendResult } from "@/server/http/respond";
import { serializeSourceImport } from "../../route";

export const POST = apiRoute<{ projectId: string; importId: string }>(
  async ({ req, params, requestId }) => {
    const actorId = (await authenticateRequest(req)).ownerId;
    const projectId = parsePathId(params.projectId, ProjectId.parse);
    const context = getApiContext();
    const result = await retryProjectSource(
      { ...context, imports: context.sourceImports, storage: context.sourceStorage },
      { actorId, projectId, sourceImportId: params.importId },
    );
    return sendResult(result, { requestId, serialize: serializeSourceImport });
  },
);
