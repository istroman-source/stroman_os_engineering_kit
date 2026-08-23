import { z } from "zod";
import { failLocationReconstruction } from "@/application/creative";
import { AppError } from "@/lib/errors";
import { getApiContext } from "@/server/composition";
import { authenticateReconstructionWorker } from "@/server/reconstruction-worker-auth";
import { apiRoute, json } from "@/server/http/respond";

const Params = z.object({ jobId: z.string().min(1) });
const Body = z.object({
  code: z.enum(["LOCAL_RECONSTRUCTION_FAILED", "EVIDENCE_INTEGRITY_FAILED"]),
});

/** Make terminal local-worker failures durable so the existing project retry action works. */
export const POST = apiRoute<{ jobId: string }>(async ({ req, params, requestId }) => {
  const { jobId } = Params.parse(params);
  const bytes = new Uint8Array(await req.arrayBuffer());
  const pathname = `/api/v1/reconstruction-worker/jobs/${encodeURIComponent(jobId)}/failure`;
  authenticateReconstructionWorker(req, pathname, bytes);
  const body = Body.parse(JSON.parse(new TextDecoder().decode(bytes)));
  const leaseId = req.headers.get("x-stroman-worker-lease");
  const context = getApiContext();
  const job = await context.locationReconstructions.findById(jobId);
  if (
    !job ||
    job.providerKey !== "stroman-pull-v1" ||
    !leaseId ||
    job.workerLeaseId !== leaseId ||
    !job.workerLeaseExpiresAt ||
    job.workerLeaseExpiresAt <= context.clock.now()
  )
    throw new AppError("FORBIDDEN", "This worker lease cannot fail that room.");
  const view = await failLocationReconstruction(context, { job, failureCode: body.code });
  return json({ job: view }, { requestId });
});
