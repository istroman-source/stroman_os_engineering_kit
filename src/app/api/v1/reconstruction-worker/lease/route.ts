import { getApiContext } from "@/server/composition";
import {
  authenticateReconstructionWorker,
  nextWorkerLeaseId,
} from "@/server/reconstruction-worker-auth";
import { apiRoute, json } from "@/server/http/respond";

const LEASE_MS = 15 * 60_000;

export const POST = apiRoute(async ({ req, requestId }) => {
  const body = new Uint8Array(await req.arrayBuffer());
  authenticateReconstructionWorker(req, "/api/v1/reconstruction-worker/lease", body);
  const context = getApiContext();
  const now = context.clock.now();
  const leaseId = nextWorkerLeaseId();
  const job = await context.locationReconstructions.claimNextForWorker({
    providerKey: "stroman-pull-v1",
    leaseId,
    now,
    leaseExpiresAt: new Date(now.getTime() + LEASE_MS),
  });
  if (!job) return json({ job: null }, { requestId });
  return json(
    {
      job: {
        id: job.id,
        name: job.name,
        leaseId,
        leaseExpiresAt: job.workerLeaseExpiresAt!.toISOString(),
        resultPath: `/api/v1/reconstruction-worker/jobs/${encodeURIComponent(job.id)}/result`,
        photos: job.photos.map((photo, index) => ({
          index,
          fileName: photo.fileName,
          contentType: photo.contentType,
          byteSize: photo.byteSize,
          contentHash: photo.contentHash,
          path: `/api/v1/reconstruction-worker/jobs/${encodeURIComponent(job.id)}/photos/${index}`,
        })),
      },
    },
    { requestId },
  );
});
