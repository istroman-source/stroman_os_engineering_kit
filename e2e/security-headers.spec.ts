import { expect, test } from "@playwright/test";

const EXPECTED_SECURITY_HEADERS = {
  "x-frame-options": "DENY",
  "referrer-policy": "strict-origin-when-cross-origin",
  "permissions-policy": "camera=(), microphone=(), geolocation=()",
  "cross-origin-opener-policy": "same-origin",
  "x-content-type-options": "nosniff",
} as const;

test.describe("deployed security boundary", () => {
  test("the running application emits hardening headers on document and API responses", async ({
    request,
  }) => {
    for (const path of ["/login", "/api/health/live"]) {
      const response = await request.get(path);
      expect(response.ok(), `${path} should respond successfully`).toBe(true);
      expect(response.headers()).toMatchObject(EXPECTED_SECURITY_HEADERS);
      expect(response.headers()["x-powered-by"]).toBeUndefined();
    }
  });
});
