import { mkdir, readFile, writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import { format } from "prettier";

interface JimmyFixture {
  readonly fixtureId: string;
  readonly brief: {
    readonly title: string;
    readonly client: string;
    readonly projectType: string;
    readonly creativeGoal: string;
    readonly targetAudience: string;
    readonly desiredEmotion: string;
    readonly context: string;
  };
}

interface ResponsesPayload {
  readonly id?: string;
  readonly output?: readonly {
    readonly content?: readonly { readonly type?: string; readonly text?: string }[];
  }[];
}

async function formattedJson(value: unknown): Promise<string> {
  return format(JSON.stringify(value), { parser: "json", printWidth: 100, tabWidth: 2 });
}

function outputText(payload: ResponsesPayload): string {
  return (payload.output ?? [])
    .flatMap((item) => item.content ?? [])
    .filter((item) => item.type === "output_text" && typeof item.text === "string")
    .map((item) => item.text!)
    .join("\n")
    .trim();
}

async function main(): Promise<void> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) throw new Error("OPENAI_API_KEY is not configured.");
  const model = process.env.STROMAN_CREATIVE_MODEL?.trim() || "gpt-5.4";
  const root = process.cwd();
  const fixture = JSON.parse(
    await readFile(resolve(root, "evaluations/fixtures/jimmys-famous-meals.json"), "utf8"),
  ) as JimmyFixture;
  const prompt = [
    "Act as a strong general-purpose creative assistant.",
    "Develop the following filmmaking brief into one recommended creative direction, three alternatives, four concrete scenes, and a shootable camera/light/design/sound plan.",
    "Include a short storyboard description for separate 16:9 and 9:16 compositions.",
    "Be useful and concise.",
    "",
    JSON.stringify(fixture.brief, null, 2),
  ].join("\n");

  console.log(JSON.stringify({ lane: "RAW_GENERAL_MODEL", state: "STARTED", model }));
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 600_000);
  let response: Response;
  try {
    response = await fetch("https://api.openai.com/v1/responses", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model,
        reasoning: { effort: "high" },
        input: [{ role: "user", content: [{ type: "input_text", text: prompt }] }],
      }),
      signal: controller.signal,
    });
  } finally {
    clearTimeout(timer);
  }
  if (!response.ok) {
    throw new Error(`Raw general-model baseline failed with status ${response.status}.`);
  }
  const payload = (await response.json()) as ResponsesPayload;
  const answer = outputText(payload);
  if (!answer) throw new Error("Raw general-model baseline returned no output text.");

  const outputDirectory = resolve(root, "evaluations/artifacts/hosted");
  await mkdir(outputDirectory, { recursive: true });
  await writeFile(
    resolve(outputDirectory, "jimmys-raw-general-baseline.json"),
    await formattedJson({
      benchmarkLane: "RAW_GENERAL_MODEL",
      fixtureId: fixture.fixtureId,
      model,
      request: { prompt },
      response: answer,
    }),
    "utf8",
  );
  console.log(
    JSON.stringify({
      lane: "RAW_GENERAL_MODEL",
      state: "COMPLETE",
      model,
      characters: answer.length,
    }),
  );
}

main().catch((error: unknown) => {
  const message = error instanceof Error ? error.message : "Unknown baseline failure.";
  console.error(JSON.stringify({ lane: "RAW_GENERAL_MODEL", state: "FAILED", error: message }));
  process.exitCode = 1;
});
