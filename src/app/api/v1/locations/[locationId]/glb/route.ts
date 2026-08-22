import { uploadPreparedLocationGlb, preparedLocationView } from "@/application/location-library";
import { authenticateRequest } from "@/server/auth";
import { getApiContext } from "@/server/composition";
import { apiRoute, json } from "@/server/http/respond";
import { AppError } from "@/lib/errors";

export const POST = apiRoute<{ locationId: string }>(async ({ req, params, requestId }) => {
  const actorId = (await authenticateRequest(req)).ownerId;
  const form = await req.formData();
  const file = form.get("file");
  if (!(file instanceof File)) throw new AppError("VALIDATION", "Choose one GLB room file.");
  const location = await uploadPreparedLocationGlb(getApiContext(), {
    actorId,
    locationId: params.locationId,
    fileName: file.name,
    bytes: new Uint8Array(await file.arrayBuffer()),
  });
  return json({ location: preparedLocationView(location) }, { requestId, status: 202 });
});
