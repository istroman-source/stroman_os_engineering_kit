import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

describe("Prompt 003 architecture decision coverage", () => {
  const decisions = readFileSync(resolve(process.cwd(), "docs/ARCHITECTURAL_DECISIONS.md"), "utf8");

  it.each([
    ["Application framework", "ADR-0002"],
    ["Database", "ADR-0016"],
    ["Authentication", "ADR-0018"],
    ["Jobs", "ADR-0019"],
    ["Storage", "ADR-0020"],
    ["Search", "ADR-0021"],
    ["AI-provider abstractions", "ADR-0009"],
  ])("maps %s to an accepted ADR", (area, adr) => {
    expect(decisions).toContain(`| ${area} | ${adr} |`);
    expect(decisions).toMatch(
      new RegExp(`## ${adr}[^#]+\\*\\*Status(?:\\.|:)\\*\\* Accepted`, "s"),
    );
  });
});
