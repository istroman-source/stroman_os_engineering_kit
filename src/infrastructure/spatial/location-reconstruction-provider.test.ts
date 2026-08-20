import { zipSync } from "fflate";
import { describe, expect, it, vi } from "vitest";
import { KiriLocationReconstructionProvider } from "./location-reconstruction-provider";

const json = (body: unknown) =>
  new Response(JSON.stringify(body), {
    status: 200,
    headers: { "content-type": "application/json" },
  });

describe("KiriLocationReconstructionProvider", () => {
  it("submits the private photo set for direct GLB reconstruction", async () => {
    const fetch = vi
      .fn()
      .mockResolvedValue(
        json({ ok: true, code: 0, data: { serialize: "provider-job-1", calculateType: 1 } }),
      );
    const provider = new KiriLocationReconstructionProvider({ apiKey: "secret", fetch });
    const photos = Array.from({ length: 20 }, (_, index) => ({
      fileName: `angle-${index + 1}.jpg`,
      contentType: "image/jpeg" as const,
      bytes: new Uint8Array([0xff, 0xd8, 0xff, index]),
    }));

    await expect(provider.start({ name: "Office", photos })).resolves.toEqual({
      providerJobId: "provider-job-1",
    });
    const [, init] = fetch.mock.calls[0]!;
    expect(init.headers).toEqual({ Authorization: "Bearer secret" });
    const form = init.body as FormData;
    expect(form.getAll("imagesFiles")).toHaveLength(20);
    expect(form.get("fileFormat")).toBe("glb");
    expect(form.get("isMask")).toBe("0");
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
