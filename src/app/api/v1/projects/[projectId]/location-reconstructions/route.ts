import {
  getLatestLocationReconstruction,
  startLocationReconstruction,
} from "@/application/creative";
import { z } from "zod";
import { ProjectId } from "@/domain/project";
import { authenticateRequest } from "@/server/auth";
import { getApiContext } from "@/server/composition";
import { apiRoute, json, parseJson, parsePathId } from "@/server/http/respond";

const StartLocationReconstructionRequest = z
  .object({
    name: z.string().trim().min(1).max(160),
    uploadIds: z.array(z.string().min(1).max(160)).min(20).max(40),
  })
  .strict();

export const GET = apiRoute<{ projectId: string }>(async ({ req, params, requestId }) => {
  const actorId = (await authenticateRequest(req)).ownerId;
  const projectId = parsePathId(params.projectId, ProjectId.parse);
  const job = await getLatestLocationReconstruction(getApiContext(), { actorId, projectId });
  return json({ job }, { requestId });
});

export const POST = apiRoute<{ projectId: string }>(async ({ req, params, requestId }) => {
  const actorId = (await authenticateRequest(req)).ownerId;
  const projectId = parsePathId(params.projectId, ProjectId.parse);
  const { name, uploadIds } = await parseJson(req, StartLocationReconstructionRequest);
  const job = await startLocationReconstruction(getApiContext(), {
    actorId,
    projectId,
    name,
    uploadIds,
  });
  return json({ job }, { requestId, status: 202 });
});
