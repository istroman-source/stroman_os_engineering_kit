import { uploadPreparedLocationPhotos, preparedLocationView } from "@/application/location-library";
import { authenticateRequest } from "@/server/auth";
import { getApiContext } from "@/server/composition";
import { apiRoute, json } from "@/server/http/respond";
import { AppError } from "@/lib/errors";

export const POST = apiRoute<{ locationId: string }>(async ({ req, params, requestId }) => {
  const actorId = (await authenticateRequest(req)).ownerId;
  const form = await req.formData();
  const files = form.getAll("files");
  if (!files.every((file): file is File => file instanceof File)) throw new AppError("VALIDATION", "Choose room photos.");
  const location = await uploadPreparedLocationPhotos(getApiContext(), { actorId, locationId: params.locationId, files: await Promise.all(files.map(async (file) => ({ fileName: file.name, contentType: file.type, bytes: new Uint8Array(await file.arrayBuffer()) }))) });
  return json({ location: preparedLocationView(location) }, { requestId, status: 202 });
});
