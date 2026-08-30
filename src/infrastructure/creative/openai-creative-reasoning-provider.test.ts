import { describe, expect, it, vi } from "vitest";
import { CreativeBriefId, createCreativeBrief, CreativeReasoningError } from "@/domain/creative";
import { ProjectId } from "@/domain/project";
import { DeterministicCreativeReasoningProvider } from "./deterministic-creative-reasoning-provider";
import { createCreativeReasoningProvider } from "./factory";
import { OpenAiCreativeReasoningProvider } from "./openai-creative-reasoning-provider";

function brief() {
  const result = createCreativeBrief({
    id: CreativeBriefId.unsafe("brief_PROVIDER1"),
    projectId: ProjectId.unsafe("proj_PROVIDER1"),
    now: new Date("2026-08-10T00:00:00.000Z"),
    title: "Morning routine",
    client: "Jimmy's Famous Meals",
    projectType: "Commercial",
    creativeGoal: "Conversion",
    targetAudience: "Parents who need convenience",
    desiredEmotion: "Understood",
    context: "Eight-month-old; never show the baby's face.",
    runtimeTarget: "30 seconds",
    deliveryPlatform: "Connected TV and vertical social",
    references: "A quiet observational kitchen film",
    restrictions: "No speed claims",
    clientRequirements: "Show the sealed meal package",
    nonNegotiables: "Never show the baby's face",
    successCriteria: "A parent recognizes their own mental load",
  });
  if (!result.ok) throw result.error;
  return result.value;
}

describe("OpenAiCreativeReasoningProvider", () => {
  it("uses the Responses API with strict structured output and untrusted brief data", async () => {
    const understanding = {
      projectSpecificReading: "This is about removing one decision from an overloaded morning.",
      insight: {
        thesis: "Relief is a pause, not a speed claim.",
        humanTruth: "Convenience can feel like care.",
        dramaticTension: "Every sound asks for another decision.",
        audiencePromise: "Parents feel recognized before the offer.",
      },
      verifiedIntent: ["commercial", "parents", "conversion"],
      assumptions: ["the meal is already available", "mental load is the real friction"],
      constraints: ["never show the baby's face"],
    };
    const request = vi.fn(async (input: string | URL | Request, init?: RequestInit) => {
      void input;
      void init;
      return new Response(
        JSON.stringify({
          output: [{ content: [{ type: "output_text", text: JSON.stringify(understanding) }] }],
        }),
        { status: 200, headers: { "Content-Type": "application/json" } },
      );
    });
    const provider = new OpenAiCreativeReasoningProvider({
      apiKey: "test-secret",
      model: "test-reasoning-model",
      fetch: request,
    });

    await expect(provider.understand(brief())).resolves.toEqual(understanding);
    const [url, init] = request.mock.calls[0]!;
    expect(url).toBe("https://api.openai.com/v1/responses");
    const body = JSON.parse(String(init?.body)) as {
      model: string;
      store: boolean;
      reasoning: { effort: string };
      input: readonly { role: string; content: string }[];
      text: { format: { type: string; strict: boolean; schema: unknown } };
    };
    expect(body).toMatchObject({
      model: "test-reasoning-model",
      store: false,
      reasoning: { effort: "high" },
      text: { format: { type: "json_schema", strict: true } },
    });
    expect(body.input[0]?.content).toMatch(/untrusted data/i);
    expect(body.input[1]?.content).toContain("never show the baby's face");
    expect(body.input[1]?.content).toContain("30 seconds");
    expect(body.input[1]?.content).toContain("Connected TV and vertical social");
    expect(body.input[1]?.content).toContain("No speed claims");
    expect(body.input[1]?.content).toContain("Show the sealed meal package");
    expect(body.input[1]?.content).toContain("A parent recognizes their own mental load");
    expect(JSON.stringify(body)).not.toContain("test-secret");
    expect(new Headers(init?.headers).get("authorization")).toBe("Bearer test-secret");
  });

  it("fails without leaking a provider response body", async () => {
    const provider = new OpenAiCreativeReasoningProvider({
      apiKey: "test-secret",
      fetch: async () => new Response("sensitive upstream detail", { status: 429 }),
    });
    await expect(provider.understand(brief())).rejects.toMatchObject({
      message: "Hosted creative reasoning request failed with status 429.",
    });
  });

  it("retries one transient transport failure without changing the request", async () => {
    const understanding = {
      projectSpecificReading: "The morning is organized by interrupted care.",
      insight: {
        thesis: "The first bite is the proof.",
        humanTruth: "Care can erase the caregiver.",
        dramaticTension: "Her hunger remains easy to postpone.",
        audiencePromise: "Relief can remain credible.",
      },
      verifiedIntent: ["commercial", "parents", "conversion"],
      assumptions: ["meal available", "prep is truthful"],
      constraints: ["never show the baby's face"],
    };
    const request = vi
      .fn()
      .mockRejectedValueOnce(new TypeError("transient connection loss"))
      .mockResolvedValueOnce(
        new Response(JSON.stringify({ output_text: JSON.stringify(understanding) }), {
          status: 200,
          headers: { "Content-Type": "application/json" },
        }),
      );
    const provider = new OpenAiCreativeReasoningProvider({
      apiKey: "test-secret",
      fetch: request,
    });

    await expect(provider.understand(brief())).resolves.toEqual(understanding);
    expect(request).toHaveBeenCalledTimes(2);
    expect(request.mock.calls[1]).toEqual(request.mock.calls[0]);
  });

  it("allows a high-effort hosted stage up to ten minutes by default", async () => {
    vi.useFakeTimers();
    try {
      let signal: AbortSignal | undefined;
      const provider = new OpenAiCreativeReasoningProvider({
        apiKey: "test-secret",
        fetch: async (_input, init) => {
          signal = init?.signal ?? undefined;
          return await new Promise<Response>((_resolve, reject) => {
            signal?.addEventListener("abort", () => {
              reject(Object.assign(new Error("aborted"), { name: "AbortError" }));
            });
          });
        },
      });
      const request = provider.understand(brief());
      const rejection = expect(request).rejects.toMatchObject({
        message: "Hosted creative reasoning timed out.",
      });
      await vi.advanceTimersByTimeAsync(120_001);
      expect(signal?.aborted).toBe(false);
      await vi.advanceTimersByTimeAsync(479_999);
      await rejection;
    } finally {
      vi.useRealTimers();
    }
  });
});

describe("creative reasoning provider composition", () => {
  it("uses hosted reasoning when configured and deterministic reasoning offline", () => {
    expect(createCreativeReasoningProvider({})).toBeInstanceOf(
      DeterministicCreativeReasoningProvider,
    );
    expect(
      createCreativeReasoningProvider({
        STROMAN_CREATIVE_REASONING_PROVIDER: "openai",
        OPENAI_API_KEY: "configured",
      }),
    ).toBeInstanceOf(OpenAiCreativeReasoningProvider);
  });

  it("fails closed when hosted reasoning is explicitly selected without a credential", () => {
    expect(() =>
      createCreativeReasoningProvider({ STROMAN_CREATIVE_REASONING_PROVIDER: "openai" }),
    ).toThrow(CreativeReasoningError);
  });
});
