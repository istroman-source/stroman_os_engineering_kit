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
