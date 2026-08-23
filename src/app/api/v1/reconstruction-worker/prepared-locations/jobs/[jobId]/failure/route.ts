import { z } from "zod";
import { failPreparedLocationReconstruction } from "@/application/location-library";
import { AppError } from "@/lib/errors";
import { getApiContext } from "@/server/composition";
import { authenticateReconstructionWorker } from "@/server/reconstruction-worker-auth";
import { apiRoute, json } from "@/server/http/respond";

const Params = z.object({ jobId: z.string().min(1) });
const Body = z.object({
  code: z.enum(["LOCAL_RECONSTRUCTION_FAILED", "EVIDENCE_INTEGRITY_FAILED"]),
});

/** Records a terminal Mac result while preserving the original room evidence for retry. */
export const POST = apiRoute<{ jobId: string }>(async ({ req, params, requestId }) => {
  const { jobId } = Params.parse(params);
  const bytes = new Uint8Array(await req.arrayBuffer());
  const pathname = `/api/v1/reconstruction-worker/prepared-locations/jobs/${encodeURIComponent(jobId)}/failure`;
  authenticateReconstructionWorker(req, pathname, bytes);
  const body = Body.parse(JSON.parse(new TextDecoder().decode(bytes)));
  const leaseId = req.headers.get("x-stroman-worker-lease");
  const context = getApiContext();
  const job = await context.preparedLocationReconstructions.findById(jobId);
  if (
    !job ||
    job.providerKey !== "stroman-pull-v1" ||
    !leaseId ||
    job.workerLeaseId !== leaseId ||
    !job.workerLeaseExpiresAt ||
    job.workerLeaseExpiresAt <= context.clock.now()
  )
    throw new AppError("FORBIDDEN", "This worker lease cannot fail that room.");
  const location = await failPreparedLocationReconstruction(context, {
    job,
    failureCode: body.code,
  });
  return json({ location: { id: location.id, status: location.status } }, { requestId });
});
