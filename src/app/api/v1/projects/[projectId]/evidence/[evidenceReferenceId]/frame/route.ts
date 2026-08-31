import { getEvidenceFrame } from "@/application/evidence";
import { EvidenceReferenceId } from "@/domain/evidence";
import { ProjectId } from "@/domain/project";
import { authenticateRequest } from "@/server/auth";
import { getApiContext } from "@/server/composition";
import { apiRoute, parsePathId } from "@/server/http/respond";

export const GET = apiRoute<{ projectId: string; evidenceReferenceId: string }>(
  async ({ req, params }) => {
    const actorId = (await authenticateRequest(req)).ownerId;
    const projectId = parsePathId(params.projectId, ProjectId.parse);
    const evidenceReferenceId = parsePathId(params.evidenceReferenceId, EvidenceReferenceId.parse);
    const result = await getEvidenceFrame(getApiContext(), {
      actorId,
      projectId,
      evidenceReferenceId,
    });
    if (!result.ok) throw result.error;
    const bytes = result.value.bytes;
    const body = bytes.buffer.slice(
      bytes.byteOffset,
      bytes.byteOffset + bytes.byteLength,
    ) as ArrayBuffer;
    return new Response(body, {
      headers: {
        "Content-Type": result.value.contentType,
        "Cache-Control": "private, no-store",
        "X-Content-Type-Options": "nosniff",
      },
    });
  },
);
