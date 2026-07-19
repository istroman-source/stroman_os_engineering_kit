import SwaggerParser from "@apidevtools/swagger-parser";

const SPEC = "docs/openapi/stroman-os-v1.yaml";

try {
  const api = await SwaggerParser.validate(SPEC);
  const pathCount = Object.keys(api.paths ?? {}).length;
  console.log(`OpenAPI ${api.openapi} valid: ${pathCount} paths.`);
} catch (error) {
  console.error("OpenAPI validation failed:");
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
}
