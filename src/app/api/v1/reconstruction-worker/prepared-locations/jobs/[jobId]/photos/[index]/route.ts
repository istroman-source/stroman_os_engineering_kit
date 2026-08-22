import { z } from "zod";
import { AppError } from "@/lib/errors";
import { getApiContext } from "@/server/composition";
import { authenticateReconstructionWorker } from "@/server/reconstruction-worker-auth";
import { apiRoute } from "@/server/http/respond";

const Params = z.object({ jobId: z.string().min(1), index: z.coerce.number().int().nonnegative() });

export const GET = apiRoute<{ jobId: string; index: string }>(async ({ req, params }) => {
  const parsed = Params.parse(params);
  const pathname = `/api/v1/reconstruction-worker/prepared-locations/jobs/${encodeURIComponent(parsed.jobId)}/photos/${parsed.index}`;
  authenticateReconstructionWorker(req, pathname, new Uint8Array());
  const leaseId = req.headers.get("x-stroman-worker-lease");
  const context = getApiContext();
  const job = await context.preparedLocationReconstructions.findById(parsed.jobId);
  if (
    !job ||
    job.providerKey !== "stroman-pull-v1" ||
    !leaseId ||
    job.workerLeaseId !== leaseId ||
    !job.workerLeaseExpiresAt ||
    job.workerLeaseExpiresAt <= context.clock.now()
  )
    throw new AppError("FORBIDDEN", "This worker lease cannot read that room.");
  const location = await context.preparedLocations.findById(job.preparedLocationId);
  const photo = location?.inputs.filter((input) => input.kind === "PHOTO")[parsed.index];
  if (!photo) throw new AppError("NOT_FOUND", "Room photo not found.");
  const bytes = await context.sourceStorage.get(photo.storageKey);
  const payload = new ArrayBuffer(bytes.byteLength);
  new Uint8Array(payload).set(bytes);
  return new Response(payload, {
    headers: {
      "Content-Type": photo.contentType,
      "Content-Length": String(bytes.byteLength),
      "Cache-Control": "no-store",
      "X-Content-Type-Options": "nosniff",
    },
  });
});
