import { getApiContext } from "@/server/composition";
import {
  authenticateReconstructionWorker,
  nextWorkerLeaseId,
} from "@/server/reconstruction-worker-auth";
import { apiRoute, json } from "@/server/http/respond";

const LEASE_MS = 15 * 60_000;
const PATH = "/api/v1/reconstruction-worker/prepared-locations/lease";

export const POST = apiRoute(async ({ req, requestId }) => {
  const body = new Uint8Array(await req.arrayBuffer());
  authenticateReconstructionWorker(req, PATH, body);
  const context = getApiContext();
  const now = context.clock.now();
  const leaseId = nextWorkerLeaseId();
  const job = await context.preparedLocationReconstructions.claimNextForWorker({
    providerKey: "stroman-pull-v1",
    leaseId,
    now,
    leaseExpiresAt: new Date(now.getTime() + LEASE_MS),
  });
  if (!job) return json({ job: null }, { requestId });
  const location = await context.preparedLocations.findById(job.preparedLocationId);
  if (!location || location.ownerId !== job.ownerId) {
    // A corrupted/orphaned row must not hold a lease until it times out and
    // repeatedly disappear from the queue. Its original location evidence is
    // untouched; this only makes the bad orchestration state visible.
    await context.preparedLocationReconstructions.update({
      ...job,
      status: "FAILED",
      failureCode: "LOCATION_OWNERSHIP_MISMATCH",
      workerLeaseId: null,
      workerLeaseExpiresAt: null,
      completedAt: context.clock.now(),
      updatedAt: context.clock.now(),
    });
    return json({ job: null }, { requestId });
  }
  const photos = location.inputs.filter((input) => input.kind === "PHOTO");
  return json(
    {
      job: {
        id: job.id,
        name: location.name,
        leaseId,
        leaseExpiresAt: job.workerLeaseExpiresAt!.toISOString(),
        resultPath: `/api/v1/reconstruction-worker/prepared-locations/jobs/${encodeURIComponent(job.id)}/result`,
        photos: photos.map((photo, index) => ({
          index,
          fileName: photo.fileName,
          contentType: photo.contentType,
          byteSize: photo.byteSize,
          contentHash: photo.contentHash,
          path: `/api/v1/reconstruction-worker/prepared-locations/jobs/${encodeURIComponent(job.id)}/photos/${index}`,
        })),
      },
    },
    { requestId },
  );
});
