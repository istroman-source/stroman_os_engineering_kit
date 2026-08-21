import { createHash, createHmac } from "node:crypto";
import { zipSync } from "fflate";
import { describe, expect, it, vi } from "vitest";
import {
  KiriLocationReconstructionProvider,
  StromanLocationReconstructionProvider,
  createLocationReconstructionProvider,
} from "./location-reconstruction-provider";

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
      .mockResolvedValueOnce(json({ ok: true, data: { status: -1 } }))
      .mockResolvedValueOnce(json({ ok: true, data: { status: 3 } }))
      .mockResolvedValueOnce(json({ ok: true, data: { status: 0 } }))
      .mockResolvedValueOnce(json({ ok: true, data: { status: 2 } }));
    const provider = new KiriLocationReconstructionProvider({ apiKey: "secret", fetch });

    await expect(provider.status("provider-job-1")).resolves.toEqual({
      status: "UPLOADING",
      phase: "UPLOADING",
      percent: null,
    });
    await expect(provider.status("provider-job-1")).resolves.toEqual({
      status: "QUEUED",
      phase: "QUEUED",
      percent: null,
    });
    await expect(provider.status("provider-job-1")).resolves.toEqual({
      status: "PROCESSING",
      phase: "PROCESSING",
      percent: null,
    });
    await expect(provider.status("provider-job-1")).resolves.toEqual({
      status: "SUCCEEDED",
      phase: null,
      percent: 100,
    });
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

describe("StromanLocationReconstructionProvider", () => {
  const secret = "s".repeat(32);

  it("uploads one integrity-checked photo at a time and signs every worker request", async () => {
    const seen: Array<{ url: URL; init: RequestInit; body: Uint8Array }> = [];
    const fetch = vi.fn(async (input: string | URL | Request, init?: RequestInit) => {
      const body = init?.body ? new Uint8Array(init.body as Uint8Array) : new Uint8Array();
      seen.push({ url: new URL(String(input)), init: init!, body });
      if (seen.length === 1) return json({ jobId: "rjob_1234567890abcdef1234567890abcdef" });
      return json({ ok: true });
    });
    let activeLoads = 0;
    let maximumActiveLoads = 0;
    const photos = Array.from({ length: 20 }, (_, index) => {
      const bytes = new Uint8Array([0xff, 0xd8, index]);
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
    let nonce = 0;
    const provider = new StromanLocationReconstructionProvider({
      endpoint: "https://worker.test",
      sharedSecret: secret,
      fetch,
      now: () => 1_777_000_000_000,
      nonce: () => `nonce-${String(++nonce).padStart(8, "0")}`,
    });

    await expect(provider.start({ name: "Office", photos })).resolves.toEqual({
      providerJobId: "rjob_1234567890abcdef1234567890abcdef",
    });
    expect(seen).toHaveLength(22);
    expect(maximumActiveLoads).toBe(1);
    expect(seen.filter(({ init }) => init.method === "PUT")).toHaveLength(20);
    const first = seen[0]!;
    const headers = new Headers(first.init.headers);
    const bodyHash = createHash("sha256").update(first.body).digest("hex");
    const canonical = `POST\n/v1/jobs\n1777000000000\nnonce-00000001\n${bodyHash}`;
    expect(headers.get("authorization")).toBe(
      `Stroman-HMAC-SHA256 ${createHmac("sha256", secret).update(canonical).digest("hex")}`,
    );
  });

  it("maps detailed in-house stages and retrieves a bounded direct GLB", async () => {
    const glb = new Uint8Array([0x67, 0x6c, 0x54, 0x46, 2, 0, 0, 0]);
    const fetch = vi
      .fn()
      .mockResolvedValueOnce(json({ status: "PROCESSING", phase: "DENSIFYING", percent: 63.5 }))
      .mockResolvedValueOnce(
        new Response(glb, {
          headers: {
            "content-length": String(glb.byteLength),
            "x-stroman-file-name": "Office Room.glb",
          },
        }),
      );
    const provider = new StromanLocationReconstructionProvider({
      endpoint: "https://worker.test",
      sharedSecret: secret,
      fetch,
    });

    await expect(provider.status("rjob_123")).resolves.toEqual({
      status: "PROCESSING",
      phase: "DENSIFYING",
      percent: 64,
    });
    await expect(provider.downloadGlb("rjob_123")).resolves.toMatchObject({
      bytes: glb,
      fileName: "Office-Room.glb",
      metersPerSourceUnit: null,
    });
  });

  it("rejects an insecure remote worker and undersized signing secret", () => {
    expect(
      () =>
        new StromanLocationReconstructionProvider({
          endpoint: "http://worker.test",
          sharedSecret: secret,
        }),
    ).toThrow(/HTTPS/i);
    expect(
      () =>
        new StromanLocationReconstructionProvider({
          endpoint: "https://worker.test",
          sharedSecret: "short",
        }),
    ).toThrow(/32 bytes/i);
  });

  it("prefers the owned worker in auto mode while preserving KIRI as rollback", () => {
    expect(
      createLocationReconstructionProvider({
        STROMAN_LOCATION_RECONSTRUCTION_PROVIDER: "auto",
        STROMAN_RECONSTRUCTION_WORKER_URL: "https://worker.test",
        STROMAN_RECONSTRUCTION_WORKER_SECRET: secret,
        KIRI_API_KEY: "rollback-key",
      }),
    ).toBeInstanceOf(StromanLocationReconstructionProvider);
    expect(
      createLocationReconstructionProvider({
        STROMAN_LOCATION_RECONSTRUCTION_PROVIDER: "auto",
        KIRI_API_KEY: "rollback-key",
      }),
    ).toBeInstanceOf(KiriLocationReconstructionProvider);
  });

  it("allows the authenticated owned worker on localhost only outside production", () => {
    const local = createLocationReconstructionProvider({
      NODE_ENV: "development",
      STROMAN_LOCATION_RECONSTRUCTION_PROVIDER: "stroman",
      STROMAN_RECONSTRUCTION_WORKER_URL: "http://127.0.0.1:3211",
      STROMAN_RECONSTRUCTION_WORKER_SECRET: secret,
    });
    expect(local).toBeInstanceOf(StromanLocationReconstructionProvider);
    expect(local.key).toBe("stroman-owned-v1");
    expect(() =>
      createLocationReconstructionProvider({
        NODE_ENV: "production",
        STROMAN_LOCATION_RECONSTRUCTION_PROVIDER: "stroman",
        STROMAN_RECONSTRUCTION_WORKER_URL: "http://127.0.0.1:3211",
        STROMAN_RECONSTRUCTION_WORKER_SECRET: secret,
      }),
    ).toThrow(/HTTPS/i);
  });
});
