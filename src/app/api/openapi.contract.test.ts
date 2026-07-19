// @vitest-environment node
import { readdirSync } from "node:fs";
import { join, resolve } from "node:path";
import SwaggerParser from "@apidevtools/swagger-parser";
import { describe, expect, it } from "vitest";

const SPEC = resolve("docs/openapi/stroman-os-v1.yaml");

/** Derive implemented HTTP paths from the route.ts files under src/app/api. */
function implementedPaths(dir: string, base: string): string[] {
  const entries = readdirSync(dir, { withFileTypes: true });
  const paths: string[] = [];
  if (entries.some((entry) => entry.isFile() && entry.name === "route.ts")) {
    paths.push(base);
  }
  for (const entry of entries) {
    if (entry.isDirectory()) {
      const segment = entry.name.replace(/^\[(.+)]$/, "{$1}");
      paths.push(...implementedPaths(join(dir, entry.name), `${base}/${segment}`));
    }
  }
  return paths;
}

describe("OpenAPI contract", () => {
  it("is a valid OpenAPI 3.1 document", async () => {
    await expect(SwaggerParser.validate(SPEC)).resolves.toBeDefined();
  });

  it("documents exactly the implemented routes (no drift)", async () => {
    const api = await SwaggerParser.parse(SPEC);
    const documented = Object.keys(api.paths ?? {}).sort();
    const implemented = implementedPaths("src/app/api", "/api").sort();
    expect(documented).toEqual(implemented);
  });
});
