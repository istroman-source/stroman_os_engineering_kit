import "server-only";

import { createHash, randomUUID } from "node:crypto";
import { unzipSync } from "fflate";
import type {
  LocationReconstructionPhotoInput,
  LocationReconstructionProvider,
  ProviderReconstructionStatus,
  SpatialTransform,
} from "@/domain/creative";
import { AppError } from "@/lib/errors";

type FetchLike = (input: string | URL | Request, init?: RequestInit) => Promise<Response>;

const MAX_RESULT_ARCHIVE_BYTES = 125 * 1024 * 1024;
const MAX_GLB_BYTES = 100 * 1024 * 1024;
const GLTF_TO_CANONICAL_BASIS: SpatialTransform = [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1];
const encoder = new TextEncoder();

function multipartHeader(
  boundary: string,
  name: string,
  options: { readonly fileName?: string; readonly contentType?: string } = {},
): Uint8Array {
  const disposition = options.fileName
    ? `Content-Disposition: form-data; name="${name}"; filename="${options.fileName}"\r\n`
    : `Content-Disposition: form-data; name="${name}"\r\n`;
  return encoder.encode(
    `--${boundary}\r\n${disposition}${options.contentType ? `Content-Type: ${options.contentType}\r\n` : ""}\r\n`,
  );
}

function streamingMultipart(
  boundary: string,
  photos: readonly LocationReconstructionPhotoInput[],
): { readonly body: ReadableStream<Uint8Array>; readonly contentLength: number } {
  const lineBreak = encoder.encode("\r\n");
  const fileParts = photos.map((photo, index) => ({
    photo,
    header: multipartHeader(boundary, "imagesFiles", {
      fileName: `capture-${index + 1}.${photo.contentType === "image/png" ? "png" : "jpg"}`,
      contentType: photo.contentType,
    }),
  }));
  const fields = [
    ["modelQuality", "1"],
    ["textureQuality", "1"],
    ["fileFormat", "glb"],
    ["isMask", "0"],
    ["textureSmoothing", "0"],
  ].map(([name, value]) => ({
    header: multipartHeader(boundary, name!),
    value: encoder.encode(value!),
  }));
  const closing = encoder.encode(`--${boundary}--\r\n`);
  const contentLength =
    fileParts.reduce(
      (total, { header, photo }) =>
        total + header.byteLength + photo.byteSize + lineBreak.byteLength,
      0,
    ) +
    fields.reduce(
      (total, { header, value }) =>
        total + header.byteLength + value.byteLength + lineBreak.byteLength,
      0,
    ) +
    closing.byteLength;

  async function* chunks() {
    for (const { header, photo } of fileParts) {
      yield header;
      const bytes = await photo.loadBytes();
      const contentHash = `sha256:${createHash("sha256").update(bytes).digest("hex")}`;
      if (bytes.byteLength !== photo.byteSize || contentHash !== photo.contentHash) {
        throw unavailable("A preserved location photo failed its integrity check.");
      }
      yield bytes;
      yield lineBreak;
    }
    for (const { header, value } of fields) {
      yield header;
      yield value;
      yield lineBreak;
    }
    yield closing;
  }

  const iterator = chunks();
  return {
    contentLength,
    body: new ReadableStream<Uint8Array>({
      async pull(controller) {
        try {
          const next = await iterator.next();
          if (next.done) controller.close();
          else controller.enqueue(next.value);
        } catch (error) {
          controller.error(error);
        }
      },
      async cancel() {
        await iterator.return?.();
      },
    }),
  };
}

function unavailable(message: string, cause?: unknown): AppError {
  return new AppError("UNAVAILABLE", message, cause === undefined ? {} : { cause });
}

async function jsonResponse(response: Response): Promise<Record<string, unknown>> {
  let value: unknown;
  try {
    value = await response.json();
  } catch (error) {
    throw unavailable("The location reconstruction provider returned malformed data.", error);
  }
  if (!response.ok || !value || typeof value !== "object") {
    throw unavailable("The location reconstruction provider rejected the request.");
  }
  return value as Record<string, unknown>;
}

export class KiriLocationReconstructionProvider implements LocationReconstructionProvider {
  readonly key = "kiri-photo-v1";

  constructor(
    private readonly options: {
      readonly apiKey: string;
      readonly endpoint?: string;
      readonly fetch?: FetchLike;
      readonly timeoutMs?: number;
    },
  ) {}

  private get endpoint(): string {
    return (this.options.endpoint ?? "https://api.kiriengine.app/api/v1/open").replace(/\/$/, "");
  }

  private get fetcher(): FetchLike {
    return this.options.fetch ?? fetch;
  }

  private headers(): HeadersInit {
    return { Authorization: `Bearer ${this.options.apiKey}` };
  }

  async start(input: {
    readonly name: string;
    readonly photos: readonly LocationReconstructionPhotoInput[];
  }): Promise<{ readonly providerJobId: string }> {
    const boundary = `stroman-${randomUUID()}`;
    const multipart = streamingMultipart(boundary, input.photos);
    let response: Response;
    try {
      response = await this.fetcher(`${this.endpoint}/photo/image`, {
        method: "POST",
        headers: {
          ...this.headers(),
          "Content-Type": `multipart/form-data; boundary=${boundary}`,
          "Content-Length": String(multipart.contentLength),
        },
        body: multipart.body,
        duplex: "half",
        signal: AbortSignal.timeout(this.options.timeoutMs ?? 10 * 60_000),
      } as RequestInit & { duplex: "half" });
    } catch (error) {
      throw unavailable("The location photos could not be submitted for reconstruction.", error);
    }
    const value = await jsonResponse(response);
    const data = value.data as Record<string, unknown> | undefined;
    if (value.ok !== true || typeof data?.serialize !== "string" || !data.serialize) {
      throw unavailable("The location reconstruction provider did not create a job.");
    }
    return { providerJobId: data.serialize };
  }

  async status(providerJobId: string): Promise<ProviderReconstructionStatus> {
    let response: Response;
    try {
      response = await this.fetcher(
        `${this.endpoint}/model/getStatus?serialize=${encodeURIComponent(providerJobId)}`,
        { headers: this.headers(), signal: AbortSignal.timeout(this.options.timeoutMs ?? 30_000) },
      );
    } catch (error) {
      throw unavailable("The location reconstruction status could not be refreshed.", error);
    }
    const value = await jsonResponse(response);
    const data = value.data as Record<string, unknown> | undefined;
    switch (data?.status) {
      case -1:
      case 0:
      case 3:
        return "PROCESSING";
      case 1:
        return "FAILED";
      case 2:
        return "SUCCEEDED";
      case 4:
        return "EXPIRED";
      default:
        throw unavailable("The location reconstruction provider returned an unknown status.");
    }
  }

  async downloadGlb(providerJobId: string): Promise<{
    readonly bytes: Uint8Array;
    readonly fileName: string;
    readonly sourceToCanonicalBasis: SpatialTransform;
    readonly metersPerSourceUnit: number | null;
  }> {
    const linkResponse = await this.fetcher(
      `${this.endpoint}/model/getModelZip?serialize=${encodeURIComponent(providerJobId)}`,
      { headers: this.headers(), signal: AbortSignal.timeout(this.options.timeoutMs ?? 30_000) },
    ).catch((error) => {
      throw unavailable("The reconstructed location could not be retrieved.", error);
    });
    const value = await jsonResponse(linkResponse);
    const data = value.data as Record<string, unknown> | undefined;
    if (value.ok !== true || typeof data?.modelUrl !== "string") {
      throw unavailable("The reconstruction provider did not return a model download.");
    }
    let modelUrl: URL;
    try {
      modelUrl = new URL(data.modelUrl);
    } catch (error) {
      throw unavailable("The reconstruction provider returned an invalid model download.", error);
    }
    if (modelUrl.protocol !== "https:") {
      throw unavailable("The reconstruction provider returned an insecure model download.");
    }
    const archiveResponse = await this.fetcher(modelUrl, {
      signal: AbortSignal.timeout(this.options.timeoutMs ?? 5 * 60_000),
    }).catch((error) => {
      throw unavailable("The reconstructed location download failed.", error);
    });
    if (!archiveResponse.ok) throw unavailable("The reconstructed location download failed.");
    const declaredBytes = Number(archiveResponse.headers.get("content-length") ?? 0);
    if (declaredBytes > MAX_RESULT_ARCHIVE_BYTES) {
      throw unavailable("The reconstructed location is too large for the first release.");
    }
    const archive = new Uint8Array(await archiveResponse.arrayBuffer());
    if (archive.byteLength > MAX_RESULT_ARCHIVE_BYTES) {
      throw unavailable("The reconstructed location is too large for the first release.");
    }
    let files: Record<string, Uint8Array>;
    try {
      files = unzipSync(archive, {
        filter: (file) =>
          file.name.toLowerCase().endsWith(".glb") &&
          file.originalSize > 0 &&
          file.originalSize <= MAX_GLB_BYTES,
      });
    } catch (error) {
      throw unavailable("The reconstructed location archive is invalid.", error);
    }
    const glbs = Object.entries(files).filter(([name]) => name.toLowerCase().endsWith(".glb"));
    if (glbs.length !== 1 || !glbs[0]) {
      throw unavailable("The reconstruction archive did not contain exactly one GLB model.");
    }
    const [fileName, bytes] = glbs[0];
    if (bytes.byteLength === 0 || bytes.byteLength > MAX_GLB_BYTES) {
      throw unavailable("The reconstructed GLB is outside the supported 100 MB limit.");
    }
    return {
      bytes,
      fileName: fileName.split("/").pop() ?? "reconstructed-location.glb",
      sourceToCanonicalBasis: GLTF_TO_CANONICAL_BASIS,
      metersPerSourceUnit: null,
    };
  }
}

class UnavailableLocationReconstructionProvider implements LocationReconstructionProvider {
  readonly key = "unavailable";
  async start(): Promise<never> {
    throw unavailable("Photo reconstruction is not configured on this Stroman deployment.");
  }
  async status(): Promise<never> {
    throw unavailable("Photo reconstruction is not configured on this Stroman deployment.");
  }
  async downloadGlb(): Promise<never> {
    throw unavailable("Photo reconstruction is not configured on this Stroman deployment.");
  }
}

export function createLocationReconstructionProvider(
  env: Readonly<Record<string, string | undefined>> = process.env,
): LocationReconstructionProvider {
  const selection = (env.STROMAN_LOCATION_RECONSTRUCTION_PROVIDER ?? "auto").toLowerCase();
  if (!new Set(["auto", "kiri", "disabled"]).has(selection)) {
    throw new AppError(
      "VALIDATION",
      "STROMAN_LOCATION_RECONSTRUCTION_PROVIDER must be auto, kiri, or disabled.",
    );
  }
  if (selection === "disabled") return new UnavailableLocationReconstructionProvider();
  if (env.KIRI_API_KEY?.trim()) {
    return new KiriLocationReconstructionProvider({ apiKey: env.KIRI_API_KEY.trim() });
  }
  if (selection === "kiri") {
    throw unavailable("KIRI reconstruction is selected but KIRI_API_KEY is not configured.");
  }
  return new UnavailableLocationReconstructionProvider();
}
