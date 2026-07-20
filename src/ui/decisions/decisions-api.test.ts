import { afterEach, describe, expect, it, vi } from "vitest";
import {
  attachAdvisory,
  getDecision,
  listDecisions,
  proposeDecision,
  recordHumanDecision,
} from "./decisions-api";

function stubFetch(status: number, body: unknown, etag?: string) {
  const fetchMock = vi.fn(async (_input: string, _init?: RequestInit) => ({
    ok: status >= 200 && status < 300,
    status,
    text: async () => JSON.stringify(body),
    headers: { get: (key: string) => (key.toLowerCase() === "etag" ? (etag ?? null) : null) },
  }));
  vi.stubGlobal("fetch", fetchMock);
  return fetchMock;
}

afterEach(() => vi.unstubAllGlobals());

const decision = {
  id: "dec_1",
  projectId: "proj_1",
  question: "Which opening?",
  options: [{ id: "opt-1", label: "Cold open", rationale: null }],
  advisory: null,
  status: "PROPOSED",
  selectedOptionId: null,
  decidedBy: null,
  decisionRationale: null,
  createdAt: "2026-07-19T00:00:00.000Z",
  decidedAt: null,
};

describe("decisions-api", () => {
  it("lists a project's decisions", async () => {
    stubFetch(200, { items: [{ ...decision, concurrencyToken: '"decision:1"' }] });
    const items = await listDecisions("proj_1");
    expect(items).toHaveLength(1);
    expect(items[0]?.concurrencyToken).toBe('"decision:1"');
  });

  it("returns a decision with its ETag", async () => {
    stubFetch(200, decision, '"decision:1"');
    const result = await getDecision("dec_1");
    expect(result.data.question).toBe("Which opening?");
    expect(result.etag).toBe('"decision:1"');
  });

  it("proposes a decision", async () => {
    const fetchMock = stubFetch(201, decision, '"decision:1"');
    await proposeDecision({
      projectId: "proj_1",
      question: "Which opening?",
      options: [
        { id: "opt-1", label: "Cold open" },
        { id: "opt-2", label: "Interview" },
      ],
    });
    const [url, init] = fetchMock.mock.calls[0]!;
    expect(url).toBe("/api/v1/decisions");
    expect(init?.method).toBe("POST");
  });

  it("attaches an advisory WITH the If-Match token", async () => {
    const fetchMock = stubFetch(
      200,
      { ...decision, advisory: { recommendedOptionId: "opt-1", rationale: "x", confidence: 0.9 } },
      '"decision:2"',
    );
    const result = await attachAdvisory("dec_1", '"decision:1"', {
      recommendedOptionId: "opt-1",
      rationale: "x",
      confidence: 0.9,
    });
    const [url, init] = fetchMock.mock.calls[0]!;
    expect(url).toBe("/api/v1/decisions/dec_1/advisory");
    expect((init?.headers as Record<string, string>)["If-Match"]).toBe('"decision:1"');
    expect(result.etag).toBe('"decision:2"');
  });

  it("records the human decision WITH the If-Match token", async () => {
    const fetchMock = stubFetch(
      200,
      { ...decision, status: "DECIDED", selectedOptionId: "opt-1" },
      '"decision:2"',
    );
    await recordHumanDecision("dec_1", '"decision:1"', {
      selectedOptionId: "opt-1",
      rationale: "clearer",
    });
    const [url, init] = fetchMock.mock.calls[0]!;
    expect(url).toBe("/api/v1/decisions/dec_1/decide");
    expect((init?.headers as Record<string, string>)["If-Match"]).toBe('"decision:1"');
  });

  it("throws a typed error on a stale write (409)", async () => {
    stubFetch(409, { error: { code: "CONCURRENCY_CONFLICT", message: "stale" } });
    await expect(
      recordHumanDecision("dec_1", '"decision:1"', { selectedOptionId: "opt-1", rationale: "x" }),
    ).rejects.toMatchObject({ status: 409 });
  });
});
