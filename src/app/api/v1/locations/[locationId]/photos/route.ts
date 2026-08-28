import { uploadPreparedLocationPhotos, preparedLocationView } from "@/application/location-library";
import { authenticateRequest } from "@/server/auth";
import { getApiContext } from "@/server/composition";
import { apiRoute, json } from "@/server/http/respond";
import { AppError } from "@/lib/errors";

export const POST = apiRoute<{ locationId: string }>(async ({ req, params, requestId }) => {
  const actorId = (await authenticateRequest(req)).ownerId;
  const declaredLength = Number(req.headers.get("content-length"));
  if (Number.isFinite(declaredLength) && declaredLength > 9 * 1024 * 1024)
    throw new AppError("VALIDATION", "Add one JPEG or PNG room photo no larger than 8 MB.");
  const form = await req.formData();
  const files = form.getAll("files");
  if (files.length !== 1 || !files.every((file): file is File => file instanceof File))
    throw new AppError("VALIDATION", "Choose one room photo.");
  const location = await uploadPreparedLocationPhotos(getApiContext(), {
    actorId,
    locationId: params.locationId,
    files: files.map((file) => ({
      fileName: file.name,
      contentType: file.type,
      byteSize: file.size,
      // Application validation and persistence call this sequentially, keeping
      // only one additional decoded photo buffer live at a time.
      readBytes: async () => new Uint8Array(await file.arrayBuffer()),
    })),
  });
  return json({ location: preparedLocationView(location) }, { requestId, status: 202 });
});
