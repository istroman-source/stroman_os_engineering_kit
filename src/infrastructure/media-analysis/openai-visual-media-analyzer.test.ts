import { describe, expect, it, vi } from "vitest";
import { VisualMediaAnalysisError } from "@/domain/media-analysis";
import { DeterministicVisualMediaAnalyzer } from "./deterministic-visual-media-analyzer";
import { createVisualMediaAnalyzer } from "./factory";
import { OpenAiVisualMediaAnalyzer } from "./openai-visual-media-analyzer";

const input = {
  sourceName: "desk-instruction.webm",
  projectContext: "A dry office procedure scene.",
  frames: [
    { index: 0, timestampMs: 500, mimeType: "image/jpeg" as const, bytes: new Uint8Array([1]) },
    { index: 1, timestampMs: 1500, mimeType: "image/jpeg" as const, bytes: new Uint8Array([2]) },
  ],
};

describe("OpenAiVisualMediaAnalyzer", () => {
  it("sends bounded labeled frames through strict Responses vision without leaking the key", async () => {
    const draft = {
      observations: [
        { frameIndex: 0, description: "A hand writes on a yellow note.", confidence: 0.97 },
      ],
      interpretations: [
        {
          frameIndices: [0, 1],
          content: "The repeated desk check may read as procedural frustration.",
          confidence: 0.74,
        },
      ],
      recommendations: [
        {
          frameIndices: [1],
          title: "Keep the drawer in frame",
          rationale: "Its emptiness is legible in the sampled composition.",
          confidence: 0.81,
        },
      ],
      unknowns: ["Dialogue and room tone are unavailable from still frames."],
    };
    const request = vi.fn(async (_input: string | URL | Request, _init?: RequestInit) => {
      void _input;
      void _init;
      return new Response(JSON.stringify({ output_text: JSON.stringify(draft) }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    });
    const provider = new OpenAiVisualMediaAnalyzer({
      apiKey: "test-secret",
      model: "gpt-5.4",
      fetch: request,
    });

    await expect(provider.analyze(input)).resolves.toEqual(draft);
    const [url, init] = request.mock.calls[0]!;
    expect(url).toBe("https://api.openai.com/v1/responses");
    const body = JSON.parse(String(init?.body)) as {
      store: boolean;
      input: Array<{ role: string; content: string | Array<{ type: string; text?: string }> }>;
      text: { format: { strict: boolean } };
    };
    expect(body.store).toBe(false);
    expect(body.text.format.strict).toBe(true);
    expect(JSON.stringify(body)).toContain("FRAME 0 · 500ms");
    expect(JSON.stringify(body).match(/input_image/g)).toHaveLength(2);
    expect(JSON.stringify(body)).not.toContain("test-secret");
    expect(new Headers(init?.headers).get("authorization")).toBe("Bearer test-secret");
  });

  it("does not surface an upstream response body", async () => {
    const provider = new OpenAiVisualMediaAnalyzer({
      apiKey: "test-secret",
      fetch: async () => new Response("private upstream detail", { status: 429 }),
    });
    await expect(provider.analyze(input)).rejects.toMatchObject({
      message: "Hosted visual analysis request failed with status 429.",
    });
  });
});

describe("visual media analyzer composition", () => {
  it("uses hosted vision when configured and a truthful offline fallback otherwise", () => {
    expect(createVisualMediaAnalyzer({})).toBeInstanceOf(DeterministicVisualMediaAnalyzer);
    expect(
      createVisualMediaAnalyzer({
        STROMAN_CREATIVE_REASONING_PROVIDER: "openai",
        OPENAI_API_KEY: "configured",
      }),
    ).toBeInstanceOf(OpenAiVisualMediaAnalyzer);
  });

  it("fails closed when hosted analysis is selected without a credential", () => {
    expect(() =>
      createVisualMediaAnalyzer({ STROMAN_CREATIVE_REASONING_PROVIDER: "openai" }),
    ).toThrow(VisualMediaAnalysisError);
  });
});
