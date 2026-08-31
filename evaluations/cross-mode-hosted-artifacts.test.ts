import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import { isBlueprint, type Blueprint, type CreativeMode } from "../src/domain/creative";

interface HostedArtifact {
  readonly generatedAt: string;
  readonly case: { readonly id: string; readonly expectedMode: CreativeMode };
  readonly provider: { readonly id: string; readonly mode: "HOSTED" };
  readonly semanticGate: string;
  readonly creativeQuality: {
    readonly passed: boolean;
    readonly total: number;
    readonly blockingFindings: readonly string[];
    readonly substitutionSignal: { readonly weak: boolean };
  };
  readonly visualQuality: { readonly passed: boolean; readonly findings: readonly string[] };
  readonly blueprint: Blueprint;
}

const caseNames = [
  "jimmys-famous-meals",
  "documentary-harbor-third-shift",
  "narrative-apartment-4c",
  "performance-one-breath",
  "open-empty-chair",
] as const;

function readJson<T>(name: string): T {
  return JSON.parse(
    readFileSync(resolve(process.cwd(), "evaluations/artifacts/hosted", name), "utf8"),
  ) as T;
}

const artifacts = caseNames.map((name) => readJson<HostedArtifact>(`${name}.json`));

function distinct(values: readonly string[]): boolean {
  return new Set(values.map((value) => value.trim().toLowerCase())).size === values.length;
}

describe("stored hosted cross-mode release evidence", () => {
  it("preserves one current-schema, quality-gated hosted artifact for every filmmaking mode", () => {
    expect(artifacts.map((artifact) => artifact.case.expectedMode).sort()).toEqual(
      ["COMMERCIAL", "DOCUMENTARY", "NARRATIVE", "OPEN", "PERFORMANCE"].sort(),
    );
    for (const artifact of artifacts) {
      expect(artifact.provider.mode).toBe("HOSTED");
      expect(artifact.provider.id).toMatch(/^openai-responses:/);
      expect(artifact.semanticGate).toBe("PASSED_BY_APPLICATION");
      expect(artifact.creativeQuality).toMatchObject({
        passed: true,
        blockingFindings: [],
        substitutionSignal: { weak: false },
      });
      expect(artifact.creativeQuality.total).toBeGreaterThanOrEqual(85);
      expect(artifact.visualQuality).toEqual({ passed: true, findings: [] });
      expect(isBlueprint(artifact.blueprint)).toBe(true);
      expect(artifact.blueprint.development.mode).toBe(artifact.case.expectedMode);
    }
  });

  it("demonstrates materially different story engines, scenes, and craft—not label substitution", () => {
    const developments = artifacts.map((artifact) => artifact.blueprint.development);
    expect(distinct(developments.map((item) => item.directionDecision.title))).toBe(true);
    expect(distinct(developments.map((item) => item.directionDecision.storyEngine))).toBe(true);
    expect(distinct(developments.map((item) => item.directionDecision.formalStrategy))).toBe(true);
    expect(
      distinct(developments.map((item) => item.sceneHypotheses[0]?.action ?? "missing")),
    ).toBe(true);
    expect(
      distinct(developments.map((item) => item.sceneHypotheses[0]?.craft.camera ?? "missing")),
    ).toBe(true);
    expect(
      distinct(developments.map((item) => item.sceneHypotheses[0]?.craft.sound ?? "missing")),
    ).toBe(true);
    for (const development of developments) {
      expect(development.sceneHypotheses.length).toBeGreaterThanOrEqual(4);
      expect(
        development.sceneHypotheses.every(
          (scene) =>
            scene.action &&
            scene.turn &&
            scene.craft.camera &&
            scene.craft.light &&
            scene.craft.design &&
            scene.craft.sound,
        ),
      ).toBe(true);
    }
  });

  it("keeps horizontal and vertical visual planning separately composed and shootable", () => {
    for (const artifact of artifacts) {
      for (const shot of artifact.blueprint.development.visualPlan.shots) {
        expect(shot.horizontal.aspectRatio).toBe("16:9");
        expect(shot.vertical.aspectRatio).toBe("9:16");
        expect(shot.horizontal.id).not.toBe(shot.vertical.id);
        expect(shot.horizontal.executionStrip).toHaveLength(2);
        expect(shot.vertical.executionStrip).toHaveLength(2);
        expect(shot.horizontal.figures.length + shot.horizontal.setPieces.length).toBeGreaterThan(0);
        expect(shot.vertical.figures.length + shot.vertical.setPieces.length).toBeGreaterThan(0);
      }
    }
  });

  it("records where the raw general baseline is weaker without pretending an automatic human verdict", () => {
    const baseline = readJson<{ benchmarkLane: string; model: string; response: string }>(
      "jimmys-raw-general-baseline.json",
    );
    expect(baseline.benchmarkLane).toBe("RAW_GENERAL_MODEL");
    expect(baseline.response).toMatch(/center-safe/i);
    expect(baseline.response).toMatch(/tight vertical crop/i);
    expect(baseline.response).toMatch(/gentle acoustic or piano|warm neutrals/i);

    const stroman = artifacts[0]!;
    expect(JSON.stringify(stroman.blueprint)).not.toMatch(/center-safe|tight vertical crop/i);
    expect(stroman.creativeQuality.total).toBeGreaterThanOrEqual(90);
    // The persisted comparison lanes remain evidence for independent/human review;
    // this test deliberately does not convert one model's self-score into a winner.
  });
});
