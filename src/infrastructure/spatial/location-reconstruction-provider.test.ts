import { createHash } from "node:crypto";
import { zipSync } from "fflate";
import { describe, expect, it, vi } from "vitest";
import { KiriLocationReconstructionProvider } from "./location-reconstruction-provider";

const json = (body: unknown) =>
  new Response(JSON.stringify(body), {
    status: 200,
    headers: { "content-type": "application/json" },
  });

describe("KiriLocationReconstructionProvider", () => {
  it("streams a maximum 40-photo set without loading the batch into memory", async () => {
    let multipart = "";
    let multipartBytes = 0;
    const fetch = vi.fn(async (_input: string | URL | Request, init?: RequestInit) => {
      const reader = (init?.body as ReadableStream<Uint8Array>).getReader();
      const chunks: Uint8Array[] = [];
      while (true) {
        const next = await reader.read();
        if (next.done) break;
        chunks.push(next.value);
      }
      const body = Buffer.concat(chunks);
      multipartBytes = body.byteLength;
      multipart = new TextDecoder("latin1").decode(body);
      return json({ ok: true, code: 0, data: { serialize: "provider-job-1", calculateType: 1 } });
    });
    const provider = new KiriLocationReconstructionProvider({ apiKey: "secret", fetch });
    let activeLoads = 0;
    let maximumActiveLoads = 0;
    const photos = Array.from({ length: 40 }, (_, index) => {
      const bytes = new Uint8Array([0xff, 0xd8, 0xff, index]);
      return {
        fileName: `angle-${index + 1}.jpg`,
        contentType: "image/jpeg" as const,
        byteSize: bytes.byteLength,
        contentHash: `sha256:${createHash("sha256").update(bytes).digest("hex")}`,
        loadBytes: async () => {
          activeLoads += 1;
          maximumActiveLoads = Math.max(maximumActiveLoads, activeLoads);
          await Promise.resolve();
          activeLoads -= 1;
          return bytes;
        },
      };
    });

    await expect(provider.start({ name: "Office", photos })).resolves.toEqual({
      providerJobId: "provider-job-1",
    });
    const [, init] = fetch.mock.calls[0]!;
    expect(init!.headers).toMatchObject({ Authorization: "Bearer secret" });
    expect(init!.headers).toMatchObject({ "Content-Length": expect.any(String) });
    expect(Number((init!.headers as Record<string, string>)["Content-Length"])).toBe(
      multipartBytes,
    );
    expect(multipart.match(/name="imagesFiles"/g)).toHaveLength(40);
    expect(multipart).toContain('name="fileFormat"\r\n\r\nglb');
    expect(multipart).toContain('name="isMask"\r\n\r\n0');
    expect(maximumActiveLoads).toBe(1);
  });

  it("maps provider status without exposing provider response data", async () => {
    const fetch = vi
      .fn()
      .mockResolvedValueOnce(json({ ok: true, data: { status: 3 } }))
      .mockResolvedValueOnce(json({ ok: true, data: { status: 2 } }));
    const provider = new KiriLocationReconstructionProvider({ apiKey: "secret", fetch });

    await expect(provider.status("provider-job-1")).resolves.toBe("PROCESSING");
    await expect(provider.status("provider-job-1")).resolves.toBe("SUCCEEDED");
  });

  it("extracts exactly one bounded GLB from the expiring provider archive", async () => {
    const glb = new Uint8Array([0x67, 0x6c, 0x54, 0x46]);
    const archive = zipSync({ "room/office.glb": glb });
    const fetch = vi
      .fn()
      .mockResolvedValueOnce(json({ ok: true, data: { modelUrl: "https://assets.test/room.zip" } }))
      .mockResolvedValueOnce(new Response(archive));
    const provider = new KiriLocationReconstructionProvider({ apiKey: "secret", fetch });

    await expect(provider.downloadGlb("provider-job-1")).resolves.toEqual({
      bytes: glb,
      fileName: "office.glb",
      sourceToCanonicalBasis: [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1],
      metersPerSourceUnit: null,
    });
  });

  it("refuses a provider-controlled non-HTTPS result URL before downloading it", async () => {
    const fetch = vi
      .fn()
      .mockResolvedValueOnce(
        json({ ok: true, data: { modelUrl: "http://internal.test/room.zip" } }),
      );
    const provider = new KiriLocationReconstructionProvider({ apiKey: "secret", fetch });

    await expect(provider.downloadGlb("provider-job-1")).rejects.toThrow(/insecure/i);
    expect(fetch).toHaveBeenCalledTimes(1);
  });
});
