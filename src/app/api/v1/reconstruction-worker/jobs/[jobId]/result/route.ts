import { z } from "zod";
import { finalizeLocationReconstruction } from "@/application/creative/location-reconstruction";
import { AppError } from "@/lib/errors";
import { getApiContext } from "@/server/composition";
import { authenticateReconstructionWorker } from "@/server/reconstruction-worker-auth";
import { apiRoute, json } from "@/server/http/respond";

const Params = z.object({ jobId: z.string().min(1) });
const MAX_GLB_BYTES = 100 * 1024 * 1024;

export const PUT = apiRoute<{ jobId: string }>(async ({ req, params, requestId }) => {
  const { jobId } = Params.parse(params);
  const bytes = new Uint8Array(await req.arrayBuffer());
  const pathname = `/api/v1/reconstruction-worker/jobs/${encodeURIComponent(jobId)}/result`;
  authenticateReconstructionWorker(req, pathname, bytes);
  if (bytes.byteLength === 0 || bytes.byteLength > MAX_GLB_BYTES)
    throw new AppError("VALIDATION", "The reconstructed room result is too large.");
  if (req.headers.get("content-type")?.toLowerCase().split(";")[0] !== "model/gltf-binary")
    throw new AppError("VALIDATION", "The worker must return a GLB room result.");
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
    throw new AppError("FORBIDDEN", "This worker lease cannot complete that room.");
  const view = await finalizeLocationReconstruction(context, {
    job,
    bytes,
    fileName:
      req.headers
        .get("x-stroman-result-file-name")
        ?.replace(/[^A-Za-z0-9._-]/g, "_")
        .slice(0, 160) || "reconstructed-room.glb",
    sourceToCanonicalBasis: [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1],
    metersPerSourceUnit: null,
  });
  return json({ job: view }, { requestId });
});
