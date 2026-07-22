import { beforeEach, describe, expect, it, vi } from "vitest";
import { apiGetWithEtag, apiPostWithEtag } from "@/ui/auth/api-client";
import { getRun, pauseSource, reviewObservation } from "./acquisition-api";

vi.mock("@/ui/auth/api-client", () => ({ apiGetWithEtag: vi.fn(), apiPostWithEtag: vi.fn() }));

beforeEach(() => {
  vi.mocked(apiGetWithEtag).mockReset();
  vi.mocked(apiPostWithEtag).mockReset();
});

describe("acquisition-api", () => {
  it("captures ETags on resource reads", async () => {
    vi.mocked(apiGetWithEtag).mockResolvedValue({
      data: { id: "run-1" },
      etag: '"acquisitionrun:3"',
    });
    await expect(getRun("run-1")).resolves.toMatchObject({ etag: '"acquisitionrun:3"' });
  });

  it("passes If-Match to lifecycle and review commands", async () => {
    vi.mocked(apiPostWithEtag).mockResolvedValue({ data: {}, etag: null });
    await pauseSource("source-1", '"knowledgesource:2"');
    expect(apiPostWithEtag).toHaveBeenLastCalledWith(
      "/api/v1/knowledge-sources/source-1/pause",
      {},
      '"knowledgesource:2"',
    );
    await reviewObservation("obs-1", { outcome: "ACCEPT" }, '"knowledgeobservation:1"');
    expect(apiPostWithEtag).toHaveBeenLastCalledWith(
      "/api/v1/knowledge-observations/obs-1/review",
      { outcome: "ACCEPT" },
      '"knowledgeobservation:1"',
    );
  });
});
