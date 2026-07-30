import { getLatestAutomaticAnalysis, runAutomaticAnalysis } from "@/application/automatic-analysis";
import { ProjectId } from "@/domain/project";
import { authenticateRequest } from "@/server/auth";
import { getApiContext } from "@/server/composition";
import { apiRoute, parsePathId, sendResult } from "@/server/http/respond";

const iso = (date: Date | null) => (date ? date.toISOString() : null);

const sendAnalysis = (
  result: Awaited<ReturnType<typeof runAutomaticAnalysis>>,
  requestId: string,
  status = 200,
) =>
  sendResult(result, {
    requestId,
    status,
    serialize: (value) => ({
      run: {
        ...value.run,
        createdAt: iso(value.run.createdAt),
        startedAt: iso(value.run.startedAt),
        completedAt: iso(value.run.completedAt),
      },
      outputs: value.outputs.map((output) => ({
        ...output,
        createdAt: output.createdAt.toISOString(),
      })),
      recommendations: value.recommendations.map((recommendation) => ({
        ...recommendation,
        createdAt: recommendation.createdAt.toISOString(),
      })),
    }),
  });

export const POST = apiRoute<{ projectId: string }>(async ({ req, params, requestId }) => {
  const actorId = (await authenticateRequest(req)).ownerId;
  const projectId = parsePathId(params.projectId, ProjectId.parse);
  const result = await runAutomaticAnalysis(getApiContext(), { actorId, projectId });
  return sendAnalysis(result, requestId, 201);
});

export const GET = apiRoute<{ projectId: string }>(async ({ req, params, requestId }) => {
  const actorId = (await authenticateRequest(req)).ownerId;
  const projectId = parsePathId(params.projectId, ProjectId.parse);
  const result = await getLatestAutomaticAnalysis(getApiContext(), { actorId, projectId });
  return sendAnalysis(result, requestId);
});
