import { getProjectExport, type ProjectExportKind } from "@/application/project-export";
import { ProjectId } from "@/domain/project";
import { authenticateRequest } from "@/server/auth";
import { getApiContext } from "@/server/composition";
import { errorResponse } from "@/server/http/http-error";
import { apiRoute, parsePathId } from "@/server/http/respond";
import { HttpError } from "@/server/http/http-error";

const kinds = new Set<ProjectExportKind>([
  "snapshot-json",
  "treatment",
  "shot-plan",
  "edit-brief",
  "decision-record",
  "review-packet",
  "decisions-csv",
]);

export const GET = apiRoute<{ projectId: string; kind: string }>(
  async ({ req, params, requestId }) => {
    const actorId = (await authenticateRequest(req)).ownerId;
    const projectId = parsePathId(params.projectId, ProjectId.parse);
    if (!kinds.has(params.kind as ProjectExportKind)) {
      throw new HttpError(404, "NOT_FOUND", "That export format is not available.");
    }
    const result = await getProjectExport(getApiContext(), {
      actorId,
      projectId,
      kind: params.kind as ProjectExportKind,
    });
    if (!result.ok) return errorResponse(result.error, requestId);
    return new Response(result.value.body, {
      status: 200,
      headers: {
        "Content-Type": result.value.contentType,
        "Content-Disposition": `attachment; filename="${result.value.filename}"`,
        "X-Stroman-Snapshot-Id": result.value.snapshotId,
        "X-Request-Id": requestId,
        "Cache-Control": "no-store",
        "X-Content-Type-Options": "nosniff",
      },
    });
  },
);
