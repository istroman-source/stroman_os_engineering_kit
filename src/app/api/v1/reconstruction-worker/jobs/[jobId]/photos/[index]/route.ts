import { z } from "zod";
import { getApiContext } from "@/server/composition";
import { authenticateReconstructionWorker } from "@/server/reconstruction-worker-auth";
import { apiRoute } from "@/server/http/respond";
import { AppError } from "@/lib/errors";

const Params = z.object({ jobId: z.string().min(1), index: z.coerce.number().int().min(0).max(39) });

export const GET = apiRoute(async ({ req, params }) => {
  const parsed = Params.parse(params);
  const pathname = `/api/v1/reconstruction-worker/jobs/${encodeURIComponent(parsed.jobId)}/photos/${parsed.index}`;
  authenticateReconstructionWorker(req, pathname, new Uint8Array());
  const leaseId = req.headers.get("x-stroman-worker-lease");
  const context = getApiContext();
  const job = await context.locationReconstructions.findById(parsed.jobId);
  if (!job || job.providerKey !== "stroman-pull-v1" || !leaseId || job.workerLeaseId !== leaseId || !job.workerLeaseExpiresAt || job.workerLeaseExpiresAt <= context.clock.now()) {
    throw new AppError("FORBIDDEN", "This worker lease cannot read that room evidence.");
  }
  const photo = job.photos[parsed.index];
  if (!photo) throw new AppError("NOT_FOUND", "Room photo not found.");
  const bytes = await context.sourceStorage.get(photo.storageKey);
  return new Response(bytes.slice().buffer as ArrayBuffer, { headers: {
    "Content-Type": photo.contentType,
    "Content-Length": String(bytes.byteLength),
    "Cache-Control": "no-store",
    "X-Content-Type-Options": "nosniff",
    "X-Content-Sha256": photo.contentHash.replace(/^sha256:/, ""),
  } });
});
