import { describe, expect, it } from "vitest";
import { z } from "zod";
import { ValidationError } from "@/lib/errors";
import { validate } from "./validation";

const schema = z.object({ name: z.string().min(1), age: z.number().int().nonnegative() });

describe("validate", () => {
  it("returns ok for valid data", () => {
    const result = validate(schema, { name: "Ada", age: 36 });
    expect(result).toEqual({ ok: true, value: { name: "Ada", age: 36 } });
  });

  it("returns a ValidationError for invalid data", () => {
    const result = validate(schema, { name: "", age: -1 });
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error).toBeInstanceOf(ValidationError);
      expect(result.error.context?.issues).toBeInstanceOf(Array);
    }
  });
});
