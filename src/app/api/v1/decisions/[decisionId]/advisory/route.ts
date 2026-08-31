import { attachAdvisory } from "@/application/decision";
import { DecisionId } from "@/domain/decision";
import { EvidenceReferenceId } from "@/domain/evidence";
import { getApiContext } from "@/server/composition";
import { authenticateRequest } from "@/server/auth";
import {
  apiRoute,
  parseJson,
  parsePathId,
  requireIfMatch,
  sendResult,
} from "@/server/http/respond";
import { AttachAdvisoryRequest } from "@/server/http/schemas";
import { serializeDecision } from "@/server/http/serializers";

export const POST = apiRoute<{ decisionId: string }>(async ({ req, params, requestId }) => {
  const actorId = (await authenticateRequest(req)).ownerId;
  const decisionId = parsePathId(params.decisionId, DecisionId.parse);
  const expectedVersion = requireIfMatch(req, "decision");
  const body = await parseJson(req, AttachAdvisoryRequest);
  const result = await attachAdvisory(getApiContext(), {
    actorId,
    decisionId,
    recommendedOptionId: body.recommendedOptionId ?? null,
    rationale: body.rationale,
    tradeoff: body.tradeoff ?? null,
    uncertainty: body.uncertainty ?? null,
    confidence: body.confidence,
    evidence: body.evidence?.map((entry) => ({
      ...entry,
      evidenceReferenceId: entry.evidenceReferenceId
        ? parsePathId(entry.evidenceReferenceId, EvidenceReferenceId.parse)
        : null,
    })),
    expectedVersion,
  });
  return sendResult(result, {
    requestId,
    serialize: serializeDecision,
    resource: "decision",
    version: (view) => view.lockVersion,
  });
});
