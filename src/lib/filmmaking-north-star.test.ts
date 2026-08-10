import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

describe("filmmaking intelligence north star", () => {
  it("keeps pre-footage development and post-footage analysis connected", () => {
    const direction = readFileSync(
      resolve(process.cwd(), "docs/FILMMAKING_INTELLIGENCE_DIRECTION.md"),
      "utf8",
    );
    const roadmap = readFileSync(resolve(process.cwd(), "roadmap/PRODUCT_ROADMAP.md"), "utf8");
    const doctrine = readFileSync(
      resolve(process.cwd(), "docs/CREATIVE_INTELLIGENCE_DOCTRINE.md"),
      "utf8",
    );
    const normalizedDirection = direction.replace(/\s+/g, " ");
    const normalizedRoadmap = roadmap.replace(/\s+/g, " ");
    const normalizedDoctrine = doctrine.replace(/\s+/g, " ");

    expect(normalizedDirection).toContain(
      "IDEA → DEVELOPMENT → STORY → PRE-PRODUCTION → PRODUCTION",
    );
    expect(normalizedDirection).toContain("SOURCE/MEDIA UNDERSTANDING →");
    expect(normalizedDirection).toContain("EDITORIAL → REVISION → DELIVERY");
    expect(direction).toContain("Develop & Plan — useful before footage exists");
    expect(direction).toContain("Analyze & Edit — useful when source material already exists");
    expect(direction).toContain("The intent–evidence bridge");
    expect(direction).toContain("Evidence grounding is mandatory");
    expect(normalizedDirection).toContain("leave every creative decision with the filmmaker");
    expect(normalizedDirection).toContain("must not optimize Stroman into only");

    expect(normalizedRoadmap).toContain(
      "transcript analysis is one input path, not the product definition",
    );
    expect(roadmap).toContain("Owner-authorized creative-intelligence continuation");
    expect(roadmap).toContain("does not select the legacy Prompt 018");
    expect(roadmap).toContain("Autopilot continuous stop milestone is Prompt 017.");
    expect(roadmap).toContain("Prompt 018 remains unauthorized by this rollout");

    expect(doctrine).toContain("filmmaker's creative operating system");
    expect(doctrine).toContain("Search before recommendation");
    expect(doctrine).toContain("Genericness is a product defect");
    expect(doctrine).toContain("Principled creative temperament");
    expect(doctrine).toContain("Purposeful rule-breaking");
    expect(doctrine).toContain("Director-notebook visual language");
    expect(normalizedDoctrine).toContain("CREATIVE HYPOTHESIS");
    expect(normalizedDoctrine).toContain(
      "The filmmaker owns every consequential creative decision",
    );
    expect(doctrine).toContain("Stroman Intelligence Benchmark");
    expect(doctrine).toContain("materially better filmmaking output");
  });
});
