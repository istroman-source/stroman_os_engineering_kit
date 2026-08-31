import { inspectEvidenceReference } from "@/application/evidence";
import { EvidenceReferenceId } from "@/domain/evidence";
import { ProjectId } from "@/domain/project";
import { authenticateRequest } from "@/server/auth";
import { getApiContext } from "@/server/composition";
import { apiRoute, parsePathId, sendResult } from "@/server/http/respond";

export const GET = apiRoute<{ projectId: string; evidenceReferenceId: string }>(
  async ({ req, params, requestId }) => {
    const actorId = (await authenticateRequest(req)).ownerId;
    const projectId = parsePathId(params.projectId, ProjectId.parse);
    const evidenceReferenceId = parsePathId(params.evidenceReferenceId, EvidenceReferenceId.parse);
    const result = await inspectEvidenceReference(getApiContext(), {
      actorId,
      projectId,
      evidenceReferenceId,
    });
    return sendResult(result, {
      requestId,
      serialize: (value) => ({
        ...value,
        frame: value.frame
          ? {
              ...value.frame,
              url: `/api/v1/projects/${projectId}/evidence/${evidenceReferenceId}/frame`,
            }
          : null,
      }),
    });
  },
);
