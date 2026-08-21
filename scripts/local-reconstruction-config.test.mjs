import { describe, expect, it } from "vitest";
import { localReconstructionEnvironment } from "./local-reconstruction-config.mjs";

describe("local reconstruction environment", () => {
  it("replaces a deployed CSRF allowlist with only the loopback app origin", () => {
    const environment = localReconstructionEnvironment(
      {
        APP_ALLOWED_ORIGINS: "https://web-production-3c3bc.up.railway.app",
        NEXT_PUBLIC_APP_URL: "https://web-production-3c3bc.up.railway.app",
      },
      {
        appPort: 3200,
        workerPort: 3211,
        secret: "not-logged",
      },
    );

    expect(environment).toMatchObject({
      NODE_ENV: "development",
      NEXT_PUBLIC_APP_URL: "http://localhost:3200",
      APP_ALLOWED_ORIGINS: "http://localhost:3200",
      STROMAN_RECONSTRUCTION_WORKER_URL: "http://127.0.0.1:3211",
    });
  });
});
