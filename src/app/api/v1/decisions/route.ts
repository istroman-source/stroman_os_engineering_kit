import { proposeDecision } from "@/application/decision";
import { ProjectId } from "@/domain/project";
import { EvidenceReferenceId } from "@/domain/evidence";
import { getApiContext } from "@/server/composition";
import { authenticateRequest } from "@/server/auth";
import { apiRoute, parseJson, parsePathId, sendResult } from "@/server/http/respond";
import { ProposeDecisionRequest } from "@/server/http/schemas";
import { serializeDecision } from "@/server/http/serializers";

export const POST = apiRoute(async ({ req, requestId }) => {
  const actorId = (await authenticateRequest(req)).ownerId;
  const body = await parseJson(req, ProposeDecisionRequest);
  const projectId = parsePathId(body.projectId, ProjectId.parse);
  const result = await proposeDecision(getApiContext(), {
    actorId,
    projectId,
    question: body.question,
    options: body.options.map((option) => ({
      id: option.id,
      label: option.label,
      rationale: option.rationale ?? null,
    })),
    context: body.context
      ? {
          originStage: body.context.originStage,
          artifactKind: body.context.artifactKind,
          artifactId: body.context.artifactId ?? null,
          artifactVersion: body.context.artifactVersion ?? null,
        }
      : undefined,
    advisory: body.advisory
      ? {
          recommendedOptionId: body.advisory.recommendedOptionId ?? null,
          rationale: body.advisory.rationale,
          tradeoff: body.advisory.tradeoff ?? null,
          uncertainty: body.advisory.uncertainty ?? null,
          confidence: body.advisory.confidence,
          evidence: body.advisory.evidence?.map((entry) => ({
            ...entry,
            evidenceReferenceId: entry.evidenceReferenceId
              ? parsePathId(entry.evidenceReferenceId, EvidenceReferenceId.parse)
              : null,
          })),
        }
      : undefined,
  });
  return sendResult(result, {
    requestId,
    status: 201,
    serialize: serializeDecision,
    resource: "decision",
    version: (view) => view.lockVersion,
  });
});
