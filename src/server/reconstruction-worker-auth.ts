import "server-only";

import { createHash, createHmac, randomUUID, timingSafeEqual } from "node:crypto";
import { AppError } from "@/lib/errors";
import { getServerEnv } from "@/lib/env/env.server";

const WINDOW_MS = 5 * 60_000;
const seenNonces = new Map<string, number>();

function same(left: string, right: string): boolean {
  const a = Buffer.from(left);
  const b = Buffer.from(right);
  return a.byteLength === b.byteLength && timingSafeEqual(a, b);
}

/** Authenticate the Mac's outbound worker without accepting browser identity. */
export function authenticateReconstructionWorker(req: Request, pathname: string, body: Uint8Array): void {
  const secret = getServerEnv().STROMAN_RECONSTRUCTION_WORKER_SECRET;
  if (!secret) throw new AppError("UNAVAILABLE", "The Mac reconstruction worker is not configured.");
  const authorization = req.headers.get("authorization") ?? "";
  const timestamp = req.headers.get("x-stroman-timestamp") ?? "";
  const nonce = req.headers.get("x-stroman-nonce") ?? "";
  const claimedHash = req.headers.get("x-content-sha256") ?? "";
  if (!authorization.startsWith("Stroman-HMAC-SHA256 ") || !/^\d{10,14}$/.test(timestamp) || !/^[A-Za-z0-9-]{8,100}$/.test(nonce) || !/^[a-f0-9]{64}$/.test(claimedHash)) {
    throw new AppError("UNAUTHORIZED", "The reconstruction worker request is not authenticated.");
  }
  const now = Date.now();
  const timestampMs = Number(timestamp);
  if (!Number.isFinite(timestampMs) || Math.abs(now - timestampMs) > WINDOW_MS) {
    throw new AppError("UNAUTHORIZED", "The reconstruction worker request has expired.");
  }
  for (const [value, expiresAt] of seenNonces) if (expiresAt <= now) seenNonces.delete(value);
  if (seenNonces.has(nonce)) throw new AppError("UNAUTHORIZED", "The reconstruction worker request was replayed.");
  const actualHash = createHash("sha256").update(body).digest("hex");
  if (!same(actualHash, claimedHash)) throw new AppError("UNAUTHORIZED", "The reconstruction worker body changed in transit.");
  const expected = createHmac("sha256", secret)
    .update(`${req.method}\n${pathname}\n${timestamp}\n${nonce}\n${actualHash}`)
    .digest("hex");
  if (!same(expected, authorization.slice("Stroman-HMAC-SHA256 ".length))) {
    throw new AppError("UNAUTHORIZED", "The reconstruction worker request is not authenticated.");
  }
  seenNonces.set(nonce, now + WINDOW_MS);
}

export function nextWorkerLeaseId(): string {
  return `lease_${randomUUID().replaceAll("-", "")}`;
}
