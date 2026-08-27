import { EventEmitter } from "node:events";
import { describe, expect, it } from "vitest";
import {
  appleReconstructionWorkerLaunchConfig,
  readHiddenSecret,
} from "../../scripts/apple-reconstruction-worker-launch-config.mjs";

function terminal() {
  const stdin = new EventEmitter();
  stdin.isTTY = true;
  stdin.isRaw = false;
  stdin.resume = () => {};
  stdin.pause = () => {};
  stdin.setRawMode = (value) => {
    stdin.isRaw = value;
  };
  const output = [];
  return { stdin, stdout: { isTTY: true, write: (text) => output.push(text) }, output };
}

describe("Apple reconstruction worker launch configuration", () => {
  it("uses an already exported secret without opening an interactive prompt", async () => {
    const config = await appleReconstructionWorkerLaunchConfig({
      STROMAN_RECONSTRUCTION_WORKER_SECRET: "s".repeat(32),
      STROMAN_RECONSTRUCTION_APP_URL: "https://stroman.example",
    });

    expect(config).toEqual({ appUrl: "https://stroman.example", secret: "s".repeat(32) });
  });

  it("securely collects a missing secret from an interactive terminal", async () => {
    const io = terminal();
    const reading = readHiddenSecret(io);
    io.stdin.emit("data", "s".repeat(32));
    io.stdin.emit("data", "\r");

    await expect(reading).resolves.toBe("s".repeat(32));
    expect(io.output.join("")).toContain("Paste the Railway worker secret");
    expect(io.output.join("")).not.toContain("s".repeat(32));
    expect(io.stdin.isRaw).toBe(false);
  });

  it("fails early when the app URL is absent", async () => {
    await expect(
      appleReconstructionWorkerLaunchConfig({
        STROMAN_RECONSTRUCTION_WORKER_SECRET: "s".repeat(32),
      }),
    ).rejects.toThrow("STROMAN_RECONSTRUCTION_APP_URL must be an HTTPS Stroman app URL");
  });
});
